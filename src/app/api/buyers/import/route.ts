import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buyers, buyerHistory } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { parseCSV } from '@/lib/csv';

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimited = await rateLimit(req, 'import-buyers');
    if (!rateLimited.success) {
      return rateLimitResponse();
    }
    
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the uploaded file from the form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Parse and validate the CSV
    const { data, errors } = await parseCSV(file);
    
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation errors in CSV', errors },
        { status: 400 }
      );
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No valid data found in CSV' },
        { status: 400 }
      );
    }
    
    if (data.length > 200) {
      return NextResponse.json(
        { error: 'CSV import is limited to 200 rows maximum' },
        { status: 400 }
      );
    }
    
    // Prepare the data for insertion with the current user as owner
    const buyersToInsert = data.map((buyer) => ({
      ...buyer,
      ownerId: session.user.id,
      // Ensure arrays are handled correctly
      tags: Array.isArray(buyer.tags) ? buyer.tags : [],
    }));
    
    // Insert all valid buyers in a transaction
    const insertedBuyers = await db.transaction(async (tx) => {
      // Insert all buyers
      const result = await tx
        .insert(buyers)
        .values(buyersToInsert)
        .returning();
      
      // Record history for each buyer
      for (const buyer of result) {
        await tx.insert(buyerHistory).values({
          buyerId: buyer.id,
          changedById: session.user.id,
          diff: { action: 'imported', data: buyer },
        });
      }
      
      return result;
    });
    
    return NextResponse.json({
      success: true,
      count: insertedBuyers.length,
    });
  } catch (error) {
    console.error('Error importing buyers:', error);
    return NextResponse.json(
      { error: 'Failed to import buyers' },
      { status: 500 }
    );
  }
}

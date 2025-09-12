import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buyers, buyerHistory } from '@/db/schema';
import { buyerSchema } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { mockBuyers } from '@/lib/mock-data';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const unwrappedParams = params instanceof Promise ? await params : params;
    const id = unwrappedParams.id;
    
    // For development purposes, use mock data instead of accessing the database
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development (GET buyer by ID)');
      
      // Find the buyer in mock data
      const buyer = mockBuyers.find(buyer => buyer.id === id);
      
      if (!buyer) {
        return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
      }
      
      // Mock history data
      const mockHistory = [
        {
          id: '1',
          buyerId: id,
          changedById: '1',
          changedAt: new Date().toISOString(),
          diff: { action: 'created', data: { status: 'New' } },
        }
      ];
      
      return NextResponse.json(buyer);
    }
    
    // Get the buyer data
    const buyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id))
      .limit(1);
    
    if (!buyer.length) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }
    
    // Get history for this buyer
    const history = await db
      .select()
      .from(buyerHistory)
      .where(eq(buyerHistory.buyerId, id))
      .orderBy(desc(buyerHistory.changedAt))
      .limit(5);
    
    return NextResponse.json({
      buyer: buyer[0],
      history,
    });
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Check rate limit
    const rateLimited = await rateLimit(req, 'update-buyer');
    if (!rateLimited.success) {
      return rateLimitResponse();
    }
    
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const unwrappedParams = params instanceof Promise ? await params : params;
    const id = unwrappedParams.id;
    const body = await req.json();
    
    // For development purposes, use mock data instead of accessing the database
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development (PUT buyer by ID)');
      
      // Find the buyer in mock data
      const buyerIndex = mockBuyers.findIndex(buyer => buyer.id === id);
      
      if (buyerIndex === -1) {
        return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
      }
      
      // Check ownership (unless it's admin)
      if (mockBuyers[buyerIndex].ownerId !== session.user.id && session.user.email !== 'admin@example.com') {
        return NextResponse.json(
          { error: 'You do not have permission to update this buyer' },
          { status: 403 }
        );
      }
      
      // In a real app, we'd update the mock data here
      // For this demo, we'll just return success
      
      return NextResponse.json({ 
        message: 'Buyer updated successfully', 
        buyer: {
          ...mockBuyers[buyerIndex],
          ...body,
          updatedAt: new Date().toISOString()
        } 
      });
    }
    
    // Check if the buyer exists and the user has ownership
    const existingBuyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id))
      .limit(1);
    
    if (!existingBuyer.length) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }
    
    // Check ownership (unless the user is an admin, which we could add later)
    if (existingBuyer[0].ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this buyer' },
        { status: 403 }
      );
    }
    
    // Check for concurrency issues with updatedAt
    if (body.updatedAt && new Date(body.updatedAt).getTime() !== new Date(existingBuyer[0].updatedAt).getTime()) {
      return NextResponse.json(
        { error: 'This record has been modified by someone else. Please refresh and try again.' },
        { status: 409 }
      );
    }
    
    // Validate the update data
    const updateSchema = buyerSchema
      .partial()
      .required({ id: true })
      .refine(
        (data) => {
          // BHK is required for Apartment and Villa property types
          if (['Apartment', 'Villa'].includes(data.propertyType || '') && !data.bhk) {
            return false;
          }
          return true;
        },
        {
          message: "BHK is required for Apartment and Villa property types",
          path: ["bhk"],
        }
      ).refine(
        (data) => {
          // budgetMax should be greater than or equal to budgetMin if both are present
          if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
            return false;
          }
          return true;
        },
        {
          message: "Maximum budget should be greater than or equal to minimum budget",
          path: ["budgetMax"],
        }
      );
    
    const validation = updateSchema.safeParse({
      ...body,
      id, // Ensure the ID matches the URL parameter
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', issues: validation.error.issues },
        { status: 400 }
      );
    }
    
    const updateData = validation.data;
    
    // Calculate what changed for history
    const changes: Record<string, { old: any, new: any }> = {};
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'updatedAt' && updateData[key as keyof typeof updateData] !== existingBuyer[0][key as keyof typeof existingBuyer[0]]) {
        changes[key] = {
          old: existingBuyer[0][key as keyof typeof existingBuyer[0]],
          new: updateData[key as keyof typeof updateData],
        };
      }
    });
    
    // If there are actual changes, update the buyer and record history
    if (Object.keys(changes).length > 0) {
      // Start a transaction
      await db.transaction(async (tx) => {
        // Update the buyer
        await tx
          .update(buyers)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(buyers.id, id));
        
        // Record the history
        await tx.insert(buyerHistory).values({
          buyerId: id,
          changedById: session.user.id,
          diff: changes,
        });
      });
    }
    
    // Get the updated buyer
    const updatedBuyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id))
      .limit(1);
    
    return NextResponse.json(updatedBuyer[0]);
  } catch (error) {
    console.error('Error updating buyer:', error);
    return NextResponse.json(
      { error: 'Failed to update buyer' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check rate limit
    const rateLimited = await rateLimit(req, 'update-buyer-status');
    if (!rateLimited.success) {
      return rateLimitResponse();
    }
    
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = params.id;
    const body = await req.json();
    
    // Check if the buyer exists and the user has ownership
    const existingBuyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id))
      .limit(1);
    
    if (!existingBuyer.length) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }
    
    // Check ownership (unless the user is an admin, which we could add later)
    if (existingBuyer[0].ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this buyer' },
        { status: 403 }
      );
    }
    
    // Validate the status change
    const statusUpdateSchema = z.object({
      status: z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'])
    });
    
    const validation = statusUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', issues: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { status } = validation.data;
    const oldStatus = existingBuyer[0].status;
    
    // Only update if status actually changed
    if (status !== oldStatus) {
      // Start a transaction
      await db.transaction(async (tx) => {
        // Update just the status
        await tx
          .update(buyers)
          .set({
            status,
            updatedAt: new Date(),
          })
          .where(eq(buyers.id, id));
        
        // Record the history
        await tx.insert(buyerHistory).values({
          buyerId: id,
          changedById: session.user.id,
          diff: {
            status: {
              old: oldStatus,
              new: status
            }
          },
        });
      });
    }
    
    // Get the updated buyer
    const updatedBuyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id))
      .limit(1);
    
    return NextResponse.json(updatedBuyer[0]);
  } catch (error) {
    console.error('Error updating buyer status:', error);
    return NextResponse.json(
      { error: 'Failed to update buyer status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = params.id;
    
    // Check if the buyer exists and the user has ownership
    const existingBuyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, id))
      .limit(1);
    
    if (!existingBuyer.length) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }
    
    // Check ownership (unless the user is an admin, which we could add later)
    if (existingBuyer[0].ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this buyer' },
        { status: 403 }
      );
    }
    
    // Delete the buyer (history will cascade delete due to our schema)
    await db
      .delete(buyers)
      .where(eq(buyers.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return NextResponse.json(
      { error: 'Failed to delete buyer' },
      { status: 500 }
    );
  }
}

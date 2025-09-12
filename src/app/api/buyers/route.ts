import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buyers, buyerHistory } from '@/db/schema';
import { buyerSchema } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { env } from '@/lib/env';
import { eq, and, desc, asc, ilike, or } from 'drizzle-orm';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { filterMockData, mockBuyers } from '@/lib/mock-data';
import { testDbConnection } from '@/lib/db-test';

// Query parameters schema
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sort: z.enum(['updatedAt', 'fullName', 'city', 'propertyType', 'status', 'timeline']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  city: z.string().optional(),
  propertyType: z.string().optional(),
  status: z.string().optional(),
  timeline: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/buyers request received');
    
    // Check for session cookie or token
    const session = await getSession();
    if (!session?.user) {
      console.log('Unauthorized: No session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('User authenticated:', session.user.name);
    
    // Parse the query parameters
    const { searchParams } = new URL(req.url);
    const parsedQuery = querySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
      sort: searchParams.get('sort') || 'updatedAt',
      order: searchParams.get('order') || 'desc',
      search: searchParams.get('search') || undefined,
      city: searchParams.get('city') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      status: searchParams.get('status') || undefined,
      timeline: searchParams.get('timeline') || undefined,
    });

    // For development purposes, use mock data instead of accessing the database
    // This bypasses database connectivity issues
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development');
      console.log('Current user ID:', session.user.id);
      
      const { page, limit, sort, order, search, city, propertyType, status, timeline } = parsedQuery;
      
      // Assign the current user's ID as owner to all mock data to ensure visibility
      const modifiedMockData = mockBuyers.map(buyer => ({
        ...buyer,
        ownerId: session.user.id
      }));
      
      const result = filterMockData({
        page, limit, sort, order, search, city, propertyType, status, timeline,
        mockData: modifiedMockData
      });
      
      return NextResponse.json(result);
    }
    
    const { page, limit, sort, order, search, city, propertyType, status, timeline } = parsedQuery;
    
    // Build query conditions
    let whereClause;
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          ilike(buyers.fullName, `%${search}%`),
          ilike(buyers.email || '', `%${search}%`),
          ilike(buyers.phone, `%${search}%`)
        )
      );
    }
    
    if (city) {
      whereConditions.push(eq(buyers.city, city));
    }
    
    // State filter removed
    
    if (propertyType) {
      whereConditions.push(eq(buyers.propertyType, propertyType));
    }
    
    if (status) {
      whereConditions.push(eq(buyers.status, status));
    }
    
    if (timeline) {
      whereConditions.push(eq(buyers.timeline, timeline));
    }
    
    if (whereConditions.length > 0) {
      whereClause = and(...whereConditions);
    }
    
    // Count the total results
    const countQuery = db.select().from(buyers);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const countResults = await countQuery;
    const total = countResults.length;
    
    // Get column for sorting
    const getSortColumn = () => {
      switch (sort) {
        case 'fullName': return buyers.fullName;
        case 'city': return buyers.city;
        case 'propertyType': return buyers.propertyType;
        case 'status': return buyers.status;
        case 'timeline': return buyers.timeline;
        case 'updatedAt':
        default:
          return buyers.updatedAt;
      }
    };
    
    const column = getSortColumn();
    const offset = (page - 1) * limit;
    
    // Execute the main query with all filters, sorting, and pagination
    const selectQuery = db.select().from(buyers);
    if (whereClause) {
      selectQuery.where(whereClause);
    }
    selectQuery.orderBy(order === 'asc' ? asc(column) : desc(column));
    selectQuery.limit(limit);
    selectQuery.offset(offset);
    
    const data = await selectQuery;
    
    return NextResponse.json({
      buyers: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch buyers', 
        details: errorMessage,
        stack: errorStack,
        env: {
          databaseUrl: env.DATABASE_URL ? 'Set' : 'Not set', 
          nodeEnv: process.env.NODE_ENV
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimited = await rateLimit(req, 'create-buyer');
    if (!rateLimited.success) {
      return rateLimitResponse();
    }
    
    const session = await getSession();
    if (!session?.user) {
      console.log('POST /api/buyers - Unauthorized: No session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('POST /api/buyers - User authenticated:', session.user.name);
    console.log('POST /api/buyers - User ID:', session.user.id);
    
    const body = await req.json();
    
    // For development purposes, manually add new buyers to mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Adding new buyer to mock data');
      
      // Generate a random ID for the new buyer
      const newId = Math.floor(Math.random() * 10000).toString();
      
      // Add the new buyer to the mock data
      mockBuyers.push({
        id: newId,
        ...body,
        ownerId: session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log(`Created new buyer with ID ${newId} for user ${session.user.id}`);
      
      // Return the newly created buyer
      return NextResponse.json(mockBuyers[mockBuyers.length - 1], { status: 201 });
    }
    
    // Validate request body with Zod schema
    const validation = buyerSchema.safeParse({
      ...body,
      ownerId: session.user.id,
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', issues: validation.error.issues },
        { status: 400 }
      );
    }
    
    const newBuyer = validation.data;
    
    // Start a transaction
    const [buyer] = await db.transaction(async (tx) => {
      // Insert the buyer
      const result = await tx
        .insert(buyers)
        .values(newBuyer)
        .returning();
      
      // Record the history
      await tx.insert(buyerHistory).values({
        buyerId: result[0].id,
        changedById: session.user.id,
        diff: { action: 'created', data: newBuyer },
      });
      
      return result;
    });
    
    return NextResponse.json(buyer, { status: 201 });
  } catch (error) {
    console.error('Error creating buyer:', error);
    return NextResponse.json(
      { error: 'Failed to create buyer' },
      { status: 500 }
    );
  }
}

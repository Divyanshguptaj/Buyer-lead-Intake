import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buyers } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { createCSV } from '@/lib/csv';
import { eq, and, desc, asc, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

// Query parameters schema
const querySchema = z.object({
  sort: z.enum(['updatedAt', 'fullName', 'city', 'propertyType', 'status', 'timeline']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  city: z.string().optional(),
  propertyType: z.string().optional(),
  status: z.string().optional(),
  timeline: z.string().optional(),
});

import { filterMockData } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const parsedQuery = querySchema.parse({
      sort: searchParams.get('sort') || 'updatedAt',
      order: searchParams.get('order') || 'desc',
      search: searchParams.get('search') || undefined,
      city: searchParams.get('city') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      status: searchParams.get('status') || undefined,
      timeline: searchParams.get('timeline') || undefined,
    });
    
    const { sort, order, search, city, propertyType, status, timeline } = parsedQuery;
    
    // For development purposes, use mock data instead of accessing the database
    // This bypasses database connectivity issues
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development (CSV export)');
      
      // Get all data without pagination for export
      const mockResult = filterMockData({
        search, city, propertyType, status, timeline,
        sort, order,
        // Set a large limit to get all data
        limit: 1000,
        page: 1
      });
      
      const data = mockResult.buyers;
      
      // Format the data for CSV export
      const csvData = data.map(buyer => ({
        fullName: buyer.fullName,
        email: buyer.email || '',
        phone: buyer.phone,
        city: buyer.city,
        propertyType: buyer.propertyType,
        bhk: buyer.bhk || '',
        purpose: buyer.purpose,
        budgetMin: buyer.budgetMin?.toString() || '',
        budgetMax: buyer.budgetMax?.toString() || '',
        timeline: buyer.timeline,
        source: buyer.source,
        status: buyer.status,
        notes: buyer.notes || '',
        tags: Array.isArray(buyer.tags) ? buyer.tags.join(',') : '',
      }));
      
      // Generate the CSV
      const csv = createCSV(csvData);
      
      // Return the CSV as a downloadable file
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="buyers-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
    
    // Production code path that connects to the database
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
    
    // Execute the query to get all filtered data (no pagination for export)
    const selectQuery = db.select().from(buyers);
    if (whereClause) {
      selectQuery.where(whereClause);
    }
    selectQuery.orderBy(order === 'asc' ? asc(column) : desc(column));
    
    const data = await selectQuery;
    
    // Format the data for CSV export
    const csvData = data.map(buyer => ({
      fullName: buyer.fullName,
      email: buyer.email || '',
      phone: buyer.phone,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || '',
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin?.toString() || '',
      budgetMax: buyer.budgetMax?.toString() || '',
      timeline: buyer.timeline,
      source: buyer.source,
      status: buyer.status,
      notes: buyer.notes || '',
      tags: buyer.tags?.join(',') || '',
    }));
    
    // Generate the CSV
    const csv = createCSV(csvData);
    
    // Return the CSV as a downloadable file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="buyers-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting buyers:', error);
    return NextResponse.json(
      { error: 'Failed to export buyers' },
      { status: 500 }
    );
  }
}

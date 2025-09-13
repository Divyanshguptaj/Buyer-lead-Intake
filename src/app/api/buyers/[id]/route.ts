import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { mockBuyers } from '@/lib/mock-data';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    if (process.env.NODE_ENV === 'development') {
      const buyer = mockBuyers.find((b) => b.id === id);
      if (buyer) {
        return NextResponse.json(buyer);
      }
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }
    
    // Production logic here
    // const buyer = await db.query.buyers.findFirst({ where: eq(buyers.id, id) });
    // if (!buyer) {
    //   return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    // }
    // return NextResponse.json(buyer);

  } catch (error) {
    console.error('[BUYER_GET_ID]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rateLimited = await rateLimit(req, 'update-buyer');
    if (rateLimited) return rateLimited;

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const body = await req.json();
    
    if (process.env.NODE_ENV === 'development') {
      const index = mockBuyers.findIndex((b) => b.id === id);
      if (index !== -1) {
        mockBuyers[index] = { ...mockBuyers[index], ...body, id };
        return NextResponse.json(mockBuyers[index]);
      }
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Production logic here
    // const [updatedBuyer] = await db.update(buyers).set(body).where(eq(buyers.id, id)).returning();
    // return NextResponse.json(updatedBuyer);

  } catch (error) {
    console.error('[BUYER_PUT_ID]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rateLimited = await rateLimit(req, 'update-buyer');
    if (rateLimited) return rateLimited;

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const body = await req.json();
    
    if (process.env.NODE_ENV === 'development') {
      const index = mockBuyers.findIndex((b) => b.id === id);
      if (index !== -1) {
        mockBuyers[index] = { ...mockBuyers[index], ...body };
        return NextResponse.json(mockBuyers[index]);
      }
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Production logic here
    // const [updatedBuyer] = await db.update(buyers).set(body).where(eq(buyers.id, id)).returning();
    // return NextResponse.json(updatedBuyer);

  } catch (error) {
    console.error('[BUYER_PATCH_ID]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

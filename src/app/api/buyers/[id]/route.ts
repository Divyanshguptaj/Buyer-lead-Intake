// src/app/api/buyers/[id]/route.ts

import { NextResponse } from "next/server";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;

    // TODO: fetch buyer from your database using id
    // Example:
    // const buyer = await db.buyer.findUnique({ where: { id } });
    // if (!buyer) return new NextResponse("Not Found", { status: 404 });
    // return NextResponse.json(buyer);

    return NextResponse.json({ buyerId: id });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

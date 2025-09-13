// src/app/api/buyers/[id]/route.ts

import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Example: fetch buyer from DB here
    // const buyer = await db.buyer.findUnique({ where: { id } });
    // if (!buyer) return new NextResponse("Not Found", { status: 404 });

    return NextResponse.json({ buyerId: id });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const stockLots = await prisma.stockLot.findMany({
      take: 20,
      orderBy: { receivedAt: 'desc' },
      include: {
        product: true,
      },
    });
    return NextResponse.json(stockLots);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const stockLot = await prisma.stockLot.create({
      data: {
        productId: body.productId,
        quantity: body.quantity,
        receivedAt: new Date(body.receivedAt),
        notes: body.notes || null,
      },
    });
    return NextResponse.json(stockLot);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating stock lot' }, { status: 500 });
  }
}

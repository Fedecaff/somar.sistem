import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: params.id },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }

    if (
      (user as any).role === 'picker' &&
      orderItem.order.assignedPickerId !== (user as any).id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await prisma.orderItem.update({
      where: { id: params.id },
      data: {
        quantityPicked: body.quantityPicked,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating order item:', error);
    return NextResponse.json({ error: 'Error updating order item' }, { status: 500 });
  }
}

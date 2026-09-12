import { prisma } from '@/lib/prisma';
import { requirePicker } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { PickerOrderDetail } from '@/components/picker/PickerOrderDetail';

export default async function PickerOrderPage({ params }: { params: { id: string } }) {
  const user = await requirePicker();
  
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
        orderBy: {
          product: {
            name: 'asc',
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  if (order.assignedPickerId !== (user as any).id) {
    redirect('/picker');
  }

  return <PickerOrderDetail order={order} />;
}

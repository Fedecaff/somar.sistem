import { prisma } from '@/lib/prisma';
import { OrdersList } from '@/components/admin/OrdersList';

export default async function OrdersPage() {
  const [orders, customers, products, pickers] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        assignedPicker: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.customer.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'picker' },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Pedidos</h1>
      <OrdersList
        initialOrders={orders}
        customers={customers}
        products={products}
        pickers={pickers}
      />
    </div>
  );
}

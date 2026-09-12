import { prisma } from '@/lib/prisma';
import { requirePicker } from '@/lib/auth';
import Link from 'next/link';

export default async function PickerDashboard() {
  const user = await requirePicker();
  
  const orders = await prisma.order.findMany({
    where: {
      assignedPickerId: (user as any).id,
      status: {
        in: ['assigned', 'picking'],
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const statusLabels: Record<string, string> = {
    assigned: 'Asignado',
    picking: 'En armado',
  };

  const unitLabels: Record<string, string> = {
    kg: 'Kg',
    cajon: 'Cajón',
    unidad: 'Unidad',
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pedidos asignados</h2>
        <p className="text-gray-600 mt-1">
          {orders.length} pedido{orders.length !== 1 ? 's' : ''} para armar
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No tienes pedidos asignados</p>
          <p className="text-gray-400 mt-2 text-sm">
            Los pedidos aparecerán aquí cuando sean asignados
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const totalItems = order.items.length;
            const pickedItems = order.items.filter(
              (item) => item.quantityPicked >= item.quantityOrdered
            ).length;
            const progress = totalItems > 0 ? (pickedItems / totalItems) * 100 : 0;

            return (
              <Link
                key={order.id}
                href={`/picker/orders/${order.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {order.customer.name}
                      </h3>
                      <p className="text-gray-600 mt-1">{order.customer.phone}</p>
                    </div>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        order.status === 'assigned'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>

                  {order.notes && (
                    <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
                      <p className="text-sm text-amber-800">
                        <span className="font-semibold">Nota:</span> {order.notes}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-700">{item.product.name}</span>
                        <span className="text-gray-900 font-medium">
                          {item.quantityOrdered} {unitLabels[item.product.unit]}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{order.items.length - 3} más...
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progreso</span>
                      <span>
                        {pickedItems} / {totalItems} productos
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    Creado: {new Date(order.createdAt).toLocaleDateString('es-AR')}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

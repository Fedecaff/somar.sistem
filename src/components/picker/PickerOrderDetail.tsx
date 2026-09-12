'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order, Customer, OrderItem, Product } from '@prisma/client';
import Link from 'next/link';

type OrderWithRelations = Order & {
  customer: Customer;
  items: (OrderItem & { product: Product })[];
};

export function PickerOrderDetail({ order: initialOrder }: { order: OrderWithRelations }) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<string>('');

  const unitLabels: Record<string, string> = {
    kg: 'Kg',
    cajon: 'Cajón',
    unidad: 'Unidad',
  };

  const handleStartPicking = async () => {
    if (order.status !== 'assigned') return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'picking' }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        router.refresh();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (itemId: string, quantityPicked: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/order-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantityPicked }),
      });

      if (res.ok) {
        const updatedItem = await res.json();
        setOrder({
          ...order,
          items: order.items.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          ),
        });
        setEditingItem(null);
        router.refresh();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async () => {
    if (!confirm('¿Marcar este pedido como listo?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready' }),
      });

      if (res.ok) {
        router.push('/picker');
        router.refresh();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: OrderItem & { product: Product }) => {
    setEditingItem(item.id);
    setTempQuantity(item.quantityPicked.toString());
  };

  const saveEdit = (itemId: string) => {
    const quantity = parseFloat(tempQuantity);
    if (!isNaN(quantity) && quantity >= 0) {
      handleUpdateItem(itemId, quantity);
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setTempQuantity('');
  };

  const allItemsComplete = order.items.every(
    (item) => item.quantityPicked >= item.quantityOrdered
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/picker" className="text-blue-600 hover:text-blue-700 text-sm">
          ← Volver a mis pedidos
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold">{order.customer.name}</h1>
          <p className="mt-1 opacity-90">{order.customer.phone}</p>
        </div>

        {order.notes && (
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Nota importante:</span> {order.notes}
            </p>
          </div>
        )}

        <div className="p-6 space-y-4">
          {order.status === 'assigned' && (
            <button
              onClick={handleStartPicking}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando...' : 'Comenzar a armar'}
            </button>
          )}

          <div className="space-y-3">
            {order.items.map((item) => {
              const isComplete = item.quantityPicked >= item.quantityOrdered;
              const isEditing = editingItem === item.id;

              return (
                <div
                  key={item.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isComplete
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Solicitado: {item.quantityOrdered} {unitLabels[item.product.unit]}
                      </p>
                    </div>
                    {isComplete && (
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={tempQuantity}
                        onChange={(e) => setTempQuantity(e.target.value)}
                        className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(item.id)}
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:opacity-50"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-lg">
                        <span className="text-gray-600">Armado: </span>
                        <span className="font-bold text-gray-900">
                          {item.quantityPicked} {unitLabels[item.product.unit]}
                        </span>
                      </div>
                      <button
                        onClick={() => startEdit(item)}
                        disabled={loading || order.status === 'ready'}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                      >
                        {order.status === 'ready' ? 'Completo' : 'Actualizar'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {order.status === 'picking' && (
            <div className="pt-4 border-t">
              <button
                onClick={handleMarkReady}
                disabled={loading || !allItemsComplete}
                className={`w-full font-bold py-4 px-6 rounded-lg text-lg disabled:cursor-not-allowed ${
                  allItemsComplete
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {loading
                  ? 'Guardando...'
                  : allItemsComplete
                  ? 'Marcar pedido como listo'
                  : 'Completa todos los items primero'}
              </button>
              {!allItemsComplete && (
                <p className="text-sm text-gray-600 text-center mt-2">
                  Asegúrate de armar todos los productos antes de finalizar
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

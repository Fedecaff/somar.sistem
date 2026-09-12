'use client';

import { useState } from 'react';
import { Customer, Product, User, Order, OrderItem, OrderStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

type OrderWithRelations = Order & {
  customer: Customer;
  assignedPicker: User | null;
  items: (OrderItem & { product: Product })[];
};

export function OrdersList({
  initialOrders,
  customers,
  products,
  pickers,
}: {
  initialOrders: OrderWithRelations[];
  customers: Customer[];
  products: Product[];
  pickers: User[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    notes: '',
    items: [{ productId: '', quantityOrdered: '' }],
  });

  const statusLabels: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    assigned: 'Asignado',
    picking: 'En armado',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  const unitLabels: Record<string, string> = {
    kg: 'Kg',
    cajon: 'Cajón',
    unidad: 'Unidad',
  };

  const openCreateModal = () => {
    setSelectedOrder(null);
    setFormData({
      customerId: customers[0]?.id || '',
      notes: '',
      items: [{ productId: products[0]?.id || '', quantityOrdered: '' }],
    });
    setIsModalOpen(true);
  };

  const openDetailsModal = (order: OrderWithRelations) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: products[0]?.id || '', quantityOrdered: '' }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: formData.items.map((item) => ({
            productId: item.productId,
            quantityOrdered: parseFloat(item.quantityOrdered),
          })),
        }),
      });

      if (res.ok) {
        closeModal();
        router.refresh();
        const updatedOrders = await fetch('/api/orders').then((r) => r.json());
        setOrders(updatedOrders);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAssignPicker = async (orderId: string, pickerId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedPickerId: pickerId }),
      });

      if (res.ok) {
        router.refresh();
        const updatedOrders = await fetch('/api/orders').then((r) => r.json());
        setOrders(updatedOrders);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChangeStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        router.refresh();
        const updatedOrders = await fetch('/api/orders').then((r) => r.json());
        setOrders(updatedOrders);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Crear pedido
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">No hay pedidos todavía</p>
          <button onClick={openCreateModal} className="text-blue-600 hover:text-blue-500">
            Crear primer pedido
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Armador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.customer.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={order.status}
                      onChange={(e) => handleChangeStatus(order.id, e.target.value as OrderStatus)}
                      className="text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor:
                          order.status === 'pending'
                            ? '#fef3c7'
                            : order.status === 'ready'
                            ? '#d1fae5'
                            : order.status === 'cancelled'
                            ? '#fee2e2'
                            : '#dbeafe',
                        color:
                          order.status === 'pending'
                            ? '#92400e'
                            : order.status === 'ready'
                            ? '#065f46'
                            : order.status === 'cancelled'
                            ? '#991b1b'
                            : '#1e40af',
                      }}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={order.assignedPickerId || ''}
                      onChange={(e) => handleAssignPicker(order.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sin asignar</option>
                      {pickers.map((picker) => (
                        <option key={picker.id} value={picker.id}>
                          {picker.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openDetailsModal(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && !selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Crear pedido</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Productos</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Agregar producto
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({unitLabels[product.unit]})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="Cantidad"
                        value={item.quantityOrdered}
                        onChange={(e) => updateItem(index, 'quantityOrdered', e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Crear pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Pedido - {selectedOrder.customer.name}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {statusLabels[selectedOrder.status]}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Armador</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedOrder.assignedPicker?.name || 'Sin asignar'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cliente</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.customer.name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customer.phone}</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notas</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Productos</p>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Producto
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Solicitado
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Armado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.product.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {item.quantityOrdered} {unitLabels[item.product.unit]}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {item.quantityPicked} {unitLabels[item.product.unit]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

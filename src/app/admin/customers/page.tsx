import { prisma } from '@/lib/prisma';
import { CustomersList } from '@/components/admin/CustomersList';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
      </div>
      <CustomersList initialCustomers={customers} />
    </div>
  );
}

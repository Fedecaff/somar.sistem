import { prisma } from '@/lib/prisma';
import { ProductsList } from '@/components/admin/ProductsList';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
      </div>
      <ProductsList initialProducts={products} />
    </div>
  );
}

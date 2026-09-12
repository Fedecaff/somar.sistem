import { prisma } from '@/lib/prisma';
import { StockList } from '@/components/admin/StockList';

export default async function StockPage() {
  const [products, stockLots] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    }),
    prisma.stockLot.findMany({
      take: 20,
      orderBy: { receivedAt: 'desc' },
      include: {
        product: true,
      },
    }),
  ]);

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Stock</h1>
      <StockList products={products} initialStockLots={stockLots} />
    </div>
  );
}

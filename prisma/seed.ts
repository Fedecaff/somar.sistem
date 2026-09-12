import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockLot.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuarios
  const adminPassword = await bcrypt.hash('admin123', 10);
  const pickerPassword = await bcrypt.hash('picker123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@mayorista.com',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin creado:', admin.email);

  const picker1 = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@mayorista.com',
      passwordHash: pickerPassword,
      role: 'picker',
    },
  });

  const picker2 = await prisma.user.create({
    data: {
      name: 'María González',
      email: 'maria@mayorista.com',
      passwordHash: pickerPassword,
      role: 'picker',
    },
  });
  console.log('✅ Armadores creados:', picker1.name, picker2.name);

  // Crear productos
  const products = await Promise.all([
    prisma.product.create({
      data: { name: 'Tomate', unit: 'kg', active: true },
    }),
    prisma.product.create({
      data: { name: 'Lechuga', unit: 'unidad', active: true },
    }),
    prisma.product.create({
      data: { name: 'Banana', unit: 'kg', active: true },
    }),
    prisma.product.create({
      data: { name: 'Manzana', unit: 'cajon', active: true },
    }),
    prisma.product.create({
      data: { name: 'Naranja', unit: 'kg', active: true },
    }),
    prisma.product.create({
      data: { name: 'Papa', unit: 'kg', active: true },
    }),
    prisma.product.create({
      data: { name: 'Cebolla', unit: 'kg', active: true },
    }),
    prisma.product.create({
      data: { name: 'Zanahoria', unit: 'kg', active: true },
    }),
  ]);
  console.log('✅ Productos creados:', products.length);

  // Crear stock para los productos
  for (const product of products) {
    await prisma.stockLot.create({
      data: {
        productId: product.id,
        receivedAt: new Date(),
        quantity: Math.floor(Math.random() * 100) + 50,
        notes: 'Ingreso inicial',
      },
    });
  }
  console.log('✅ Stock inicial creado');

  // Crear clientes
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Verdulería El Sol',
        phone: '+54 11 4444-5555',
        notes: 'Cliente frecuente',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Frutería La Luna',
        phone: '+54 11 5555-6666',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Mercado Central',
        phone: '+54 11 6666-7777',
        notes: 'Pedidos grandes',
      },
    }),
  ]);
  console.log('✅ Clientes creados:', customers.length);

  // Crear pedidos de ejemplo
  const order1 = await prisma.order.create({
    data: {
      customerId: customers[0].id,
      status: 'assigned',
      assignedPickerId: picker1.id,
      notes: 'Pedido urgente',
      items: {
        create: [
          {
            productId: products[0].id,
            quantityOrdered: 20,
            quantityPicked: 0,
          },
          {
            productId: products[1].id,
            quantityOrdered: 15,
            quantityPicked: 0,
          },
          {
            productId: products[4].id,
            quantityOrdered: 10,
            quantityPicked: 0,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: customers[1].id,
      status: 'pending',
      notes: 'Entregar mañana',
      items: {
        create: [
          {
            productId: products[2].id,
            quantityOrdered: 25,
            quantityPicked: 0,
          },
          {
            productId: products[3].id,
            quantityOrdered: 5,
            quantityPicked: 0,
          },
        ],
      },
    },
  });
  console.log('✅ Pedidos de ejemplo creados:', order1.id, order2.id);

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

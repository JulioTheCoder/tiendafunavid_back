import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating sample data...');

  const password = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@tiendafunavid.com',
      password,
      name: 'Administrador',
    },
  });
  console.log(`Created admin: ${admin.email} (password: admin123)`);

  const products = [
    {
      name: 'Camiseta Estampada',
      description: 'Camiseta de algodón con diseño exclusivo. Disponible en tallas S, M, L, XL.',
      price: 29.99,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      stock: 50,
    },
    {
      name: 'Pantalón Jeans Clásico',
      description: 'Pantalón jeans azul clásico, cómodo y duradero. Perfecto para uso diario.',
      price: 59.99,
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      stock: 30,
    },
    {
      name: 'Zapatillas Deportivas',
      description: 'Zapatillas con suela acolchada, ideales para correr y actividades deportivas.',
      price: 89.99,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      stock: 25,
    },
    {
      name: 'Bolso de Cuero',
      description: 'Bolso de cuero genuino, espacioso y elegante. Ideal para el trabajo o viajes.',
      price: 119.99,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
      stock: 15,
    },
    {
      name: 'Gorra Baseball',
      description: 'Gorra ajustable con escudo bordado. Uno-size fits all.',
      price: 19.99,
      imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
      stock: 100,
    },
    {
      name: 'Auriculares Inalámbricos',
      description: 'Auriculares Bluetooth con cancelación de ruido. Batería de 30 horas.',
      price: 149.99,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d6ab?w=500',
      stock: 40,
    },
    {
      name: 'Mochila Urbana',
      description: 'Mochila resistente al agua con múltiples compartimentos. Capacidad 30L.',
      price: 69.99,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      stock: 35,
    },
    {
      name: 'Reloj Smart',
      description: 'Reloj inteligente con monitor de salud, notificaciones y resistencia al agua.',
      price: 199.99,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37801b7b0d03?w=500',
      stock: 20,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`Created ${products.length} products`);

  const customer = await prisma.customer.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      phone: '+1234567890',
      address: 'Calle Mayor 123',
      city: 'Madrid',
      postalCode: '28001',
    },
  });
  console.log(`Created customer: ${customer.name}`);

  const createdProducts = await prisma.product.findMany({ take: 3 });
  const total =
    createdProducts[0].price.toNumber() +
    createdProducts[1].price.toNumber() +
    createdProducts[2].price.toNumber();
  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      total,
      status: 'PAID',
      orderItems: {
        create: [
          {
            productId: createdProducts[0].id,
            quantity: 2,
            price: createdProducts[0].price,
          },
          {
            productId: createdProducts[1].id,
            quantity: 1,
            price: createdProducts[1].price,
          },
          {
            productId: createdProducts[2].id,
            quantity: 1,
            price: createdProducts[2].price,
          },
        ],
      },
    },
    include: { orderItems: true },
  });
  console.log(`Created order #${order.id} with ${order.orderItems.length} items`);

  console.log('\n✓ Sample data created successfully!');
  console.log('\n=== Admin Login ===');
  console.log('Email: admin@tiendafunavid.com');
  console.log('Password: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
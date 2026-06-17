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

  const categories = [
    { name: 'Ropa' },
    { name: 'Calzado' },
    { name: 'Accesorios' },
    { name: 'Tecnología' },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }
  console.log(`Created ${categories.length} categories`);

  const ropaCat = await prisma.category.findUnique({ where: { name: 'Ropa' } });
  const calzadoCat = await prisma.category.findUnique({ where: { name: 'Calzado' } });
  const accesoriosCat = await prisma.category.findUnique({ where: { name: 'Accesorios' } });
  const tecnologiaCat = await prisma.category.findUnique({ where: { name: 'Tecnología' } });

  if (!ropaCat || !calzadoCat || !accesoriosCat || !tecnologiaCat) {
    throw new Error('Categories not found');
  }

  const products = [
    {
      name: 'Camiseta Estampada',
      description: 'Camiseta de algodón con diseño exclusivo. Disponible en tallas S, M, L, XL.',
      price: 59000,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      stock: 50,
      categoryId: ropaCat.id,
    },
    {
      name: 'Pantalón Jeans Clásico',
      description: 'Pantalón jeans azul clásico, cómodo y duradero. Perfecto para uso diario.',
      price: 159000,
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      stock: 30,
      categoryId: ropaCat.id,
    },
    {
      name: 'Zapatillas Deportivas',
      description: 'Zapatillas con suela acolchada, ideales para correr y actividades deportivas.',
      price: 289000,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      stock: 25,
      categoryId: calzadoCat.id,
    },
    {
      name: 'Bolso de Cuero',
      description: 'Bolso de cuero genuino, espacioso y elegante. Ideal para el trabajo o viajes.',
      price: 350000,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
      stock: 15,
      categoryId: accesoriosCat.id,
    },
    {
      name: 'Gorra Baseball',
      description: 'Gorra ajustable con escudo bordado. Uno-size fits all.',
      price: 45000,
      imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
      stock: 100,
      categoryId: accesoriosCat.id,
    },
    {
      name: 'Auriculares Inalámbricos',
      description: 'Auriculares Bluetooth con cancelación de ruido. Batería de 30 horas.',
      price: 420000,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d6ab?w=500',
      stock: 40,
      categoryId: tecnologiaCat.id,
    },
    {
      name: 'Mochila Urbana',
      description: 'Mochila resistente al agua con múltiples compartimentos. Capacidad 30L.',
      price: 185000,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      stock: 35,
      categoryId: accesoriosCat.id,
    },
    {
      name: 'Reloj Smart',
      description: 'Reloj inteligente con monitor de salud, notificaciones y resistencia al agua.',
      price: 650000,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37801b7b0d03?w=500',
      stock: 20,
      categoryId: tecnologiaCat.id,
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
      phone: '+573001234567',
      address: 'Calle 123 #45-67',
      city: 'Bogotá',
      postalCode: '11001',
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
      status: 'PENDING',
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
  console.log(`Created order #${order.id} with ${order.orderItems.length} items (PENDING - awaiting payment proof)`);

  console.log('\n✓ Sample data created successfully!');
  console.log('\n=== Admin Login ===');
  console.log('Email: admin@tiendafunavid.com');
  console.log('Password: admin123');
  console.log('\n=== Categories ===');
  categories.forEach(c => console.log(`  - ${c.name}`));
  console.log('\n=== Prices in COP (Colombian Pesos) ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        customer: true,
        orderItems: {
          include: { product: true },
        },
        paymentProof: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        orderItems: {
          include: { product: true },
        },
        paymentProof: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async create(data: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({
        where: { email: data.customerEmail },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: data.customerName,
            email: data.customerEmail,
            phone: data.customerPhone,
            address: data.shippingAddress,
            city: data.shippingCity,
            postalCode: data.shippingPostalCode,
          },
        });
      }

      const orderItemsData = await Promise.all(
        data.items.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) {
            throw new BadRequestException(
              `Product with ID ${item.productId} not found`,
            );
          }
          if (product.stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for product: ${product.name}`,
            );
          }
          await tx.product.update({
            where: { id: product.id },
            data: { stock: product.stock - item.quantity },
          });
          return {
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
          };
        }),
      );

      const total = orderItemsData.reduce(
        (sum, item) => sum + item.price.toNumber() * item.quantity,
        0,
      );

      return tx.order.create({
        data: {
          customerId: customer.id,
          total,
          status: OrderStatus.PENDING,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          customer: true,
          orderItems: {
            include: { product: true },
          },
        },
      });
    });
  }

  async updateStatus(id: number, status: OrderStatus) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async uploadPaymentProof(orderId: number, imageUrl: string) {
    await this.findOne(orderId);
    return this.prisma.paymentProof.upsert({
      where: { orderId },
      create: { orderId, imageUrl },
      update: { imageUrl },
    });
  }
}

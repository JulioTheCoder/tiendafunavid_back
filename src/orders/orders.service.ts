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
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
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
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
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
      const normalizedEmail =
        data.customerEmail.trim().toLowerCase();

      /*
       * Cada compra crea un cliente nuevo, incluso cuando
       * el correo ya existe en la tabla customers.
       */
      const customer = await tx.customer.create({
        data: {
          name: data.customerName.trim(),
          email: normalizedEmail,
          phone: data.customerPhone?.trim() || null,
          address: data.shippingAddress.trim(),
          city: data.shippingCity.trim(),
          postalCode:
            data.shippingPostalCode?.trim() || null,
        },
      });

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

          // Conserva exactamente los datos escritos para esta compra,
          // aunque el mismo correo sea utilizado en pedidos posteriores.
          customerName: data.customerName.trim(),
          customerEmail: data.customerEmail.trim().toLowerCase(),
          customerPhone: data.customerPhone?.trim() || null,
          shippingAddress: data.shippingAddress.trim(),
          shippingCity: data.shippingCity.trim(),
          shippingPostalCode:
            data.shippingPostalCode?.trim() || null,

          orderItems: {
            create: orderItemsData,
          },

          ...(data.paymentProof && {
            paymentProof: {
              create: {
                imageUrl: data.paymentProof,
              },
            },
          }),
        },
     
        include: {
          customer: true,
          orderItems: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          paymentProof: true,
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

  async delete(id: number) {
    const order = await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.paymentProof.deleteMany({
        where: { orderId: id },
      });

      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      await tx.order.delete({
        where: { id },
      });

      /*
       * Elimina el cliente solamente cuando ya no tiene
       * ninguna orden asociada. Esto protege registros
       * antiguos que podrían compartir el mismo customerId.
       */
      const remainingOrders = await tx.order.count({
        where: {
          customerId: order.customerId,
        },
      });

      if (remainingOrders === 0) {
        await tx.customer.delete({
          where: {
            id: order.customerId,
          },
        });
      }
    });

    return {
      message: `Order #${id} deleted successfully`,
    };
  }
}

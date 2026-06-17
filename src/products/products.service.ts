import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(data: CreateProductDto) {
    return this.prisma.product.create({
      data: {
      ...data,
      price: Number(data.price),  
      stock: Number(data.stock),   
      categoryId: Number(data.categoryId), 
    },
    });
  }

  async update(id: number, data: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data:{
      ...data,
      ...(data.price && { price: Number(data.price) }),
      ...(data.stock && { stock: Number(data.stock) }),
      ...(data.categoryId && { categoryId: Number(data.categoryId) }),
    },
    });
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }
}

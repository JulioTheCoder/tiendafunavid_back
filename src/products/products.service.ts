import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${id} not found`,
      );
    }

    return product;
  }

  private async validateCategory(categoryId: number) {
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      throw new BadRequestException(
        'Selecciona una categoría válida.',
      );
    }

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException(
        `No existe una categoría con el ID ${categoryId}.`,
      );
    }
  }

  async create(data: CreateProductDto) {
    const categoryId = Number(data.categoryId);

    await this.validateCategory(categoryId);

    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        imageUrl: data.imageUrl,
        stock: Number(data.stock ?? 0),
        categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: number, data: UpdateProductDto) {
    await this.findOne(id);

    const updateData: {
      name?: string;
      description?: string;
      price?: number;
      imageUrl?: string;
      stock?: number;
      categoryId?: number;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.price !== undefined) {
      updateData.price = Number(data.price);
    }

    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
    }

    if (data.stock !== undefined) {
      updateData.stock = Number(data.stock);
    }

    if (data.categoryId !== undefined) {
      const categoryId = Number(data.categoryId);
      await this.validateCategory(categoryId);
      updateData.categoryId = categoryId;
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
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

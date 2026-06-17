import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      include: { products: true },
      orderBy: { name: 'asc' },
    });
  }

  create(data: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { name: data.name },
    });
  }

  async findOne(id: number) {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });
      if (!category) {
        throw new NotFoundException(`No se encuentra el profucto con el ID: ${id}`);
      }
      return category;
    }

    async delete(id: number) {
    await this.findOne(id);
    return this.prisma.category.delete({
      where: { id },
    });
  }
}

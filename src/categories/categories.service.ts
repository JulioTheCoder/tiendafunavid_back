import { Injectable } from '@nestjs/common';
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
}

import { 
  Controller, 
  Get, 
  Post, 
  Body,
  ParseIntPipe,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  create(@Body() data: CreateCategoryDto) {
    return this.categoriesService.create(data);
  }

   @Delete(':id')
    @UseGuards(JwtAuthGuard)
    delete(@Param('id', ParseIntPipe) id: number) {
      return this.categoriesService.delete(id);
    }
}

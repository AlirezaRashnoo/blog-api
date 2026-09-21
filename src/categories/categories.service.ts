import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: createCategoryDto,
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Category name or slug already exists');
      }

      throw error;
    }
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    try {
      return await this.prisma.category.update({
        where: {
          id,
        },
        data: updateCategoryDto,
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Category name or slug already exists');
      }

      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      await this.prisma.category.delete({
        where: {
          id,
        },
      });

      return {
        message: 'Category deleted successfully',
      };
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2003') {
        throw new ConflictException(
          'Cannot delete category because it has posts',
        );
      }

      throw error;
    }
  }
}

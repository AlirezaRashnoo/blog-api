import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createPostDto: CreatePostDto) {
    try {
      return await this.prisma.post.create({
        data: {
          ...createPostDto,
          authorId: userId,
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Slug already exists');
      }

      throw error;
    }
  }

  async findPublished() {
    return this.prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findMine(userId: number) {
    return this.prisma.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllForAdmin() {
    return this.prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPublishedOne(id: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        status: 'PUBLISHED',
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findMineOne(id: number, userId: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        authorId: userId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await this.findMineOne(id, userId);

    try {
      return await this.prisma.post.update({
        where: { id },
        data: updatePostDto,
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Slug already exists');
      }

      throw error;
    }
  }

  async remove(id: number, userId: number) {
    await this.findMineOne(id, userId);

    await this.prisma.post.delete({
      where: { id },
    });

    return {
      message: 'Post deleted successfully',
    };
  }
}

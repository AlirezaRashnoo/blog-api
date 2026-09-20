import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

type UserRole = 'USER' | 'ADMIN';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createPostDto: CreatePostDto) {
    try {
      return await this.prisma.post.create({
        data: {
          ...createPostDto,
          status: 'DRAFT',
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

  // =========================
  // Public queries
  // =========================

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

  // =========================
  // User queries
  // =========================

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

  // =========================
  // Admin queries
  // =========================

  async findAllForAdmin() {
    return this.prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =========================
  // Internal resource lookup
  // =========================

  async findById(id: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  // =========================
  // Update
  // =========================

  async update(
    id: number,
    userId: number,
    role: UserRole,
    updatePostDto: UpdatePostDto,
  ) {
    const post = await this.findById(id);

    if (role !== 'ADMIN' && post.authorId !== userId) {
      throw new ForbiddenException('You can only modify your own posts');
    }

    const data: UpdatePostDto & {
      status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    } = {
      ...updatePostDto,
    };

    if (role !== 'ADMIN' && post.status === 'PUBLISHED') {
      data.status = 'DRAFT';
    }

    try {
      return await this.prisma.post.update({
        where: {
          id,
        },
        data,
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Slug already exists');
      }

      throw error;
    }
  }

  // =========================
  // Delete
  // =========================

  async remove(id: number, userId: number, role: UserRole) {
    const post = await this.findById(id);

    if (role !== 'ADMIN' && post.authorId !== userId) {
      throw new ForbiddenException('You can only modify your own posts');
    }

    await this.prisma.post.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Post deleted successfully',
    };
  }

  async publish(id: number) {
    const post = await this.findById(id);

    if (post.status !== 'DRAFT') {
      throw new ConflictException('Only draft posts can be published');
    }

    return this.prisma.post.update({
      where: {
        id,
      },
      data: {
        status: 'PUBLISHED',
      },
    });
  }

  async archive(id: number) {
    const post = await this.findById(id);

    if (post.status !== 'PUBLISHED') {
      throw new ConflictException('Only published posts can be archived');
    }

    return this.prisma.post.update({
      where: {
        id,
      },
      data: {
        status: 'ARCHIVED',
      },
    });
  }
}

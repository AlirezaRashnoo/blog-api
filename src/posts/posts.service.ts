import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FindPostsDto } from './dto/find-posts.dto';

type UserRole = 'USER' | 'ADMIN';

const postWithCategory = {
  category: true,
} as const;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // Create
  // =========================

  async create(userId: number, createPostDto: CreatePostDto) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: createPostDto.categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    try {
      return await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          slug: createPostDto.slug,
          content: createPostDto.content,
          categoryId: createPostDto.categoryId,
          status: 'DRAFT',
          authorId: userId,
        },
        include: postWithCategory,
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

  async findPublished(findPostsDto: FindPostsDto) {
    const { page, limit, search, categoryId } = findPostsDto;

    const skip = (page - 1) * limit;

    const where = {
      status: 'PUBLISHED' as const,

      ...(categoryId !== undefined
        ? {
            categoryId,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                content: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: postWithCategory,
      }),

      this.prisma.post.count({
        where,
      }),
    ]);

    return {
      data: posts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublishedOne(id: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        status: 'PUBLISHED',
      },
      include: postWithCategory,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  // =========================
  // User queries
  // =========================

  async findMine(userId: number, findPostsDto: FindPostsDto) {
    const { page, limit, search, categoryId } = findPostsDto;

    const skip = (page - 1) * limit;

    const where = {
      authorId: userId,

      ...(categoryId !== undefined
        ? {
            categoryId,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                content: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: postWithCategory,
      }),

      this.prisma.post.count({
        where,
      }),
    ]);

    return {
      data: posts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMineOne(id: number, userId: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        authorId: userId,
      },
      include: postWithCategory,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  // =========================
  // Admin queries
  // =========================

  async findAllForAdmin(findPostsDto: FindPostsDto) {
    const { page, limit, search, categoryId } = findPostsDto;

    const skip = (page - 1) * limit;

    const where = {
      ...(categoryId !== undefined
        ? {
            categoryId,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                content: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: postWithCategory,
      }),

      this.prisma.post.count({
        where,
      }),
    ]);

    return {
      data: posts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

    if (updatePostDto.categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: updatePostDto.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
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
        include: postWithCategory,
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

  // =========================
  // Publishing workflow
  // =========================

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
      include: postWithCategory,
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
      include: postWithCategory,
    });
  }
}

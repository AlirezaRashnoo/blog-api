import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async like(postId: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== 'PUBLISHED') {
      throw new ConflictException('Only published posts can be liked');
    }

    try {
      return await this.prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Post already liked');
      }

      throw error;
    }
  }

  async unlike(postId: number, userId: number) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.like.delete({
      where: {
        id: like.id,
      },
    });

    return {
      message: 'Post unliked successfully',
    };
  }

  async count(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const count = await this.prisma.like.count({
      where: {
        postId,
      },
    });

    return {
      count,
    };
  }
}

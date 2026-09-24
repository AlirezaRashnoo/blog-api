import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { FindBookmarksDto } from './dto/find-bookmarks.dto';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(postId: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== 'PUBLISHED') {
      throw new ConflictException('Only published posts can be bookmarked');
    }

    try {
      return await this.prisma.bookmark.create({
        data: {
          postId,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Post already bookmarked');
      }

      throw error;
    }
  }

  async remove(postId: number, userId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmark.delete({
      where: {
        id: bookmark.id,
      },
    });

    return {
      message: 'Bookmark removed successfully',
    };
  }

  async findMine(userId: number, findBookmarksDto: FindBookmarksDto) {
    const { page, limit } = findBookmarksDto;
    const skip = (page - 1) * limit;

    const where = {
      userId,
    };

    const [bookmarks, total] = await Promise.all([
      this.prisma.bookmark.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          post: {
            include: {
              category: true,
            },
          },
        },
      }),
      this.prisma.bookmark.count({
        where,
      }),
    ]);

    return {
      data: bookmarks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

type UserRole = 'USER' | 'ADMIN';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // Create comment / reply
  // =========================

  async create(
    postId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== 'PUBLISHED') {
      throw new ConflictException(
        'Comments are only allowed on published posts',
      );
    }

    if (createCommentDto.parentId !== undefined) {
      const parent = await this.prisma.comment.findUnique({
        where: {
          id: createCommentDto.parentId,
        },
      });

      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parent.postId !== postId) {
        throw new ConflictException(
          'Parent comment does not belong to this post',
        );
      }
    }

    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        postId,
        authorId: userId,
        parentId: createCommentDto.parentId,
      },
    });
  }

  // =========================
  // Find comments for a post
  // =========================

  async findByPost(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== 'PUBLISHED') {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    const commentMap = new Map<
      number,
      (typeof comments)[number] & {
        replies: Array<(typeof comments)[number]>;
      }
    >();

    for (const comment of comments) {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
      });
    }

    const rootComments: Array<(typeof comments)[number]> = [];

    for (const comment of comments) {
      const currentComment = commentMap.get(comment.id)!;

      if (comment.parentId === null) {
        rootComments.push(currentComment);
        continue;
      }

      const parentComment = commentMap.get(comment.parentId);

      if (parentComment) {
        parentComment.replies.push(currentComment);
      }
    }

    return rootComments;
  }

  // =========================
  // Internal lookup
  // =========================

  async findById(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  // =========================
  // Update
  // =========================

  async update(
    id: number,
    userId: number,
    role: UserRole,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.findById(id);

    if (role !== 'ADMIN' && comment.authorId !== userId) {
      throw new ForbiddenException('You can only modify your own comments');
    }

    return this.prisma.comment.update({
      where: {
        id,
      },
      data: {
        content: updateCommentDto.content,
      },
    });
  }

  // =========================
  // Delete
  // =========================

  async remove(id: number, userId: number, role: UserRole) {
    const comment = await this.findById(id);

    if (role !== 'ADMIN' && comment.authorId !== userId) {
      throw new ForbiddenException('You can only modify your own comments');
    }

    await this.prisma.comment.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Comment deleted successfully',
    };
  }
}

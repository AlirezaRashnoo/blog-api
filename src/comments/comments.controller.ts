import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    role: 'USER' | 'ADMIN';
  };
}

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req: AuthenticatedRequest,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(
      postId,
      req.user.userId,
      createCommentDto,
    );
  }

  @Get('posts/:postId/comments')
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.findByPost(postId);
  }

  @Patch('comments/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(
      id,
      req.user.userId,
      req.user.role,
      updateCommentDto,
    );
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.commentsService.remove(id, req.user.userId, req.user.role);
  }
}

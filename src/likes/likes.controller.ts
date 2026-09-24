import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LikesService } from './likes.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    role: 'USER' | 'ADMIN';
  };
}

@Controller('posts/:postId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  like(
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.likesService.like(postId, req.user.userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  unlike(
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.likesService.unlike(postId, req.user.userId);
  }

  @Get()
  count(@Param('postId', ParseIntPipe) postId: number) {
    return this.likesService.count(postId);
  }
}

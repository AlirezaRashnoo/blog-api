import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookmarksService } from './bookmarks.service';
import { FindBookmarksDto } from './dto/find-bookmarks.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    role: 'USER' | 'ADMIN';
  };
}

@Controller()
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post('posts/:postId/bookmark')
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.bookmarksService.create(postId, req.user.userId);
  }

  @Delete('posts/:postId/bookmark')
  remove(
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.bookmarksService.remove(postId, req.user.userId);
  }

  @Get('users/me/bookmarks')
  findMine(
    @Request() req: AuthenticatedRequest,
    @Query() findBookmarksDto: FindBookmarksDto,
  ) {
    return this.bookmarksService.findMine(req.user.userId, findBookmarksDto);
  }
}

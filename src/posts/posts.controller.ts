import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    role: 'USER' | 'ADMIN';
  };
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // =========================
  // Public endpoints
  // =========================

  @Get()
  findPublished() {
    return this.postsService.findPublished();
  }

  // =========================
  // Authenticated user endpoints
  // =========================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: AuthenticatedRequest) {
    return this.postsService.findMine(req.user.userId);
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  findMineOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.postsService.findMineOne(Number(id), req.user.userId);
  }

  // =========================
  // Admin endpoints
  // =========================

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAllForAdmin() {
    return this.postsService.findAllForAdmin();
  }

  // =========================
  // Public single post
  // =========================

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  publish(@Param('id') id: string) {
    return this.postsService.publish(Number(id));
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  archive(@Param('id') id: string) {
    return this.postsService.archive(Number(id));
  }

  @Get(':id')
  findPublishedOne(@Param('id') id: string) {
    return this.postsService.findPublishedOne(Number(id));
  }

  // =========================
  // Authenticated mutations
  // =========================

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(req.user.userId, createPostDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(
      Number(id),
      req.user.userId,
      req.user.role,
      updatePostDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.postsService.remove(Number(id), req.user.userId, req.user.role);
  }
}

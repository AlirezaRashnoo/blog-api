import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}

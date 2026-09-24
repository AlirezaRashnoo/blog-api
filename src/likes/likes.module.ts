import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}

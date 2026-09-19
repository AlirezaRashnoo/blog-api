import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, SessionsModule],
})
export class AppModule {}

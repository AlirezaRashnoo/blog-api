import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, expiresAt: Date) {
    const refreshToken = randomBytes(64).toString('hex');

    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt,
      },
    });

    return {
      sessionId: session.id,
      refreshToken,
    };
  }

  async validate(sessionId: string, refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session || session.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const isValid = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return session;
  }
}

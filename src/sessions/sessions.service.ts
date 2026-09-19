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

  async rotate(sessionId: string, refreshToken: string) {
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
      await this.revoke(sessionId);

      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const newRefreshToken = randomBytes(64).toString('hex');

    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 12);

    const updatedSession = await this.prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        refreshTokenHash: newRefreshTokenHash,
      },
    });

    return {
      session: updatedSession,
      refreshToken: newRefreshToken,
    };
  }

  async revoke(sessionId: string) {
    await this.prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}

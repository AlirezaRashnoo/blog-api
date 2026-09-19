import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { SessionsService } from '../sessions/sessions.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...registerDto,
          password: hashedPassword,
        },
      });

      const { password, ...result } = user;

      return result;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Username or email already exists');
      }

      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await this.sessionsService.create(user.id, expiresAt);

    return {
      access_token: accessToken,
      refresh_token: session.refreshToken,
      session_id: session.sessionId,
    };
  }

  async refresh(sessionId: string, refreshToken: string) {
    const session = await this.sessionsService.validate(
      sessionId,
      refreshToken,
    );

    const user = await this.prisma.user.findUnique({
      where: {
        id: session.userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    return {
      access_token: accessToken,
    };
  }
}

import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Current refresh token',
    minLength: 32,
  })
  @IsString()
  @MinLength(32)
  refreshToken: string;

  @ApiProperty({
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'Session identifier',
  })
  @IsString()
  @MinLength(1)
  sessionId: string;
}

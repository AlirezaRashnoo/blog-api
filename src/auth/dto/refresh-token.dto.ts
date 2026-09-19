import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @MinLength(32)
  refreshToken: string;

  @IsString()
  @MinLength(1)
  sessionId: string;
}

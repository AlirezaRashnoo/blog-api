import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'alireza',
    description: 'Unique username',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @ApiPropertyOptional({
    example: 'StrongPassword123!',
    description: 'New user password',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    example: 'Alireza',
    description: 'User first name',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Ahmadi',
    description: 'User last name',
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}

import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'ali@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'alireza',
    description: 'Unique username',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'User password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

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

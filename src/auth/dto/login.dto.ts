import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'ali@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'User password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}

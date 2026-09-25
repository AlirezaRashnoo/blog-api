import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
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

  @ApiProperty({
    example: 'Alireza',
    description: 'User first name',
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    example: 'Ahmadi',
    description: 'User last name',
    required: false,
  })
  lastName?: string;
}

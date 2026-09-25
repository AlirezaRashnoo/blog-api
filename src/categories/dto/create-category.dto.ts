import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Technology',
    description: 'Category name',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'technology',
    description: 'Unique URL-friendly category slug',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  slug: string;
}

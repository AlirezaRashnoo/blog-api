import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Technology',
    description: 'Category name',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({
    example: 'technology',
    description: 'Unique URL-friendly category slug',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;
}

import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional({
    example: 'Introduction to NestJS',
    description: 'Post title',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional({
    example: 'introduction-to-nestjs',
    description: 'Unique URL-friendly slug',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  slug?: string;

  @ApiPropertyOptional({
    example: 'Updated post content...',
    description: 'Post content',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID of the post category',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;
}

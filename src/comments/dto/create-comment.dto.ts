import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This is a very useful article!',
    description: 'Comment content',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiPropertyOptional({
    example: 12,
    description:
      'ID of the parent comment. Omit this field to create a top-level comment.',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentId?: number;
}

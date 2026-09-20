import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

import { PostStatus } from '../../generated/prisma/enums';

export class CreatePostDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(3)
  slug: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}

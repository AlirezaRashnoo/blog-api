import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

import { PostStatus } from '../../generated/prisma/enums';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}

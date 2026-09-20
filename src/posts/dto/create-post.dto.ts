import { IsString, MinLength } from 'class-validator';

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
}

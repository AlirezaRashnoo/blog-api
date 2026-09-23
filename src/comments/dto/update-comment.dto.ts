import { IsString, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  content: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great post!' })
  @IsNotEmpty()
  text!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  postId!: number;
}



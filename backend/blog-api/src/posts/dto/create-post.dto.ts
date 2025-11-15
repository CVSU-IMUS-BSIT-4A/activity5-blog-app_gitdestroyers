import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'My first post' })
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'This is the content of my first post.' })
  @IsNotEmpty()
  content!: string;
}



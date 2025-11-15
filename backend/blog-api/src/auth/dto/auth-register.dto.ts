import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthRegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @MinLength(6)
  password!: string;
}



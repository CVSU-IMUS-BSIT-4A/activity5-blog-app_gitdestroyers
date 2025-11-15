import { Body, Controller, Get, Param, Patch, Post, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { multerConfig } from '../config/multer.config';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.users.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.users.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.users.remove(Number(id));
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    const avatarPath = `/uploads/avatars/${file.filename}`;
    return this.users.update(Number(id), { avatar: avatarPath });
  }
}

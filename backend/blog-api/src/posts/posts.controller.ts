import { Controller, Get, Post as HttpPost, Patch, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.posts.findAll(Number(page) || 1, Number(pageSize) || 10);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.posts.findOne(Number(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpPost()
  create(@Body() body: CreatePostDto, @Req() req: any) {
    return this.posts.create(body, req.user?.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<{ title: string; content: string }>, @Req() req: any) {
    return this.posts.update(Number(id), body, req.user?.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.posts.remove(Number(id), req.user?.userId);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.posts.getHistory(Number(id));
  }
}



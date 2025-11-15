import { Controller, Get, Post as HttpPost, Patch, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.comments.findAll(Number(page) || 1, Number(pageSize) || 10);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comments.findOne(Number(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpPost()
  create(@Body() body: CreateCommentDto, @Req() req: any) {
    return this.comments.create(body as any, req.user?.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<{ text: string }>, @Req() req: any) {
    return this.comments.update(Number(id), body, req.user?.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.comments.remove(Number(id), req.user?.userId);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.comments.getHistory(Number(id));
  }
}



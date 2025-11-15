import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LikesService } from './likes.service';

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('toggle')
  async toggleLike(@Body() body: { postId: number; userId: number; isLike: boolean }) {
    const { postId, userId, isLike } = body;
    return await this.likesService.toggleLike(postId, userId, isLike);
  }

  @Get('post/:postId')
  async getPostLikeCounts(@Param('postId') postId: string) {
    return await this.likesService.getPostLikeCounts(Number(postId));
  }

  @Get('post/:postId/user/:userId')
  async getUserLikeStatus(@Param('postId') postId: string, @Param('userId') userId: string) {
    return await this.likesService.getUserLikeStatus(Number(postId), Number(userId));
  }

  // Comment Likes
  @Post('comment/toggle')
  async toggleCommentLike(@Body() body: { commentId: number; userId: number; isLike: boolean }) {
    const { commentId, userId, isLike } = body;
    return await this.likesService.toggleCommentLike(commentId, userId, isLike);
  }

  @Get('comment/:commentId')
  async getCommentLikeCounts(@Param('commentId') commentId: string) {
    return await this.likesService.getCommentLikeCounts(Number(commentId));
  }

  @Get('comment/:commentId/user/:userId')
  async getUserCommentLikeStatus(@Param('commentId') commentId: string, @Param('userId') userId: string) {
    return await this.likesService.getUserCommentLikeStatus(Number(commentId), Number(userId));
  }
}

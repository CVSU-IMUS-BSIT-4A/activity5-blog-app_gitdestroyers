import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Like } from '../entities/like.entity';
import { CommentLike } from '../entities/comment-like.entity';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    @InjectRepository(CommentLike) private readonly commentLikeRepo: Repository<CommentLike>,
    private readonly dataSource: DataSource,
  ) {}

  async toggleLike(postId: number, userId: number, isLike: boolean) {
    const postRepo = this.dataSource.getRepository(Post);
    const userRepo = this.dataSource.getRepository(User);
    
    const post = await postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingLike = await this.likeRepo.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (existingLike) {
      if (existingLike.isLike === isLike) {
        await this.likeRepo.remove(existingLike);
      } else {
        existingLike.isLike = isLike;
        await this.likeRepo.save(existingLike);
      }
    } else {
      const newLike = this.likeRepo.create({
        post: { id: postId },
        user: { id: userId },
        isLike,
      });
      await this.likeRepo.save(newLike);
    }

    return this.getPostLikeCounts(postId);
  }

  async getPostLikeCounts(postId: number) {
    const likes = await this.likeRepo.find({
      where: { post: { id: postId } },
    });

    const likeCount = likes.filter(l => l.isLike).length;
    const dislikeCount = likes.filter(l => !l.isLike).length;

    return { likeCount, dislikeCount };
  }

  async getUserLikeStatus(postId: number, userId: number) {
    const like = await this.likeRepo.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (!like) {
      return { isLiked: false, isDisliked: false };
    }

    return {
      isLiked: like.isLike,
      isDisliked: !like.isLike,
    };
  }

  // Comment Likes
  async toggleCommentLike(commentId: number, userId: number, isLike: boolean) {
    const commentRepo = this.dataSource.getRepository(Comment);
    const userRepo = this.dataSource.getRepository(User);
    
    const comment = await commentRepo.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingLike = await this.commentLikeRepo.findOne({
      where: { comment: { id: commentId }, user: { id: userId } },
    });

    if (existingLike) {
      if (existingLike.isLike === isLike) {
        await this.commentLikeRepo.remove(existingLike);
      } else {
        existingLike.isLike = isLike;
        await this.commentLikeRepo.save(existingLike);
      }
    } else {
      const newLike = this.commentLikeRepo.create({
        comment: { id: commentId },
        user: { id: userId },
        isLike,
      });
      await this.commentLikeRepo.save(newLike);
    }

    return this.getCommentLikeCounts(commentId);
  }

  async getCommentLikeCounts(commentId: number) {
    const likes = await this.commentLikeRepo.find({
      where: { comment: { id: commentId } },
    });

    const likeCount = likes.filter(l => l.isLike).length;
    const dislikeCount = likes.filter(l => !l.isLike).length;

    return { likeCount, dislikeCount };
  }

  async getUserCommentLikeStatus(commentId: number, userId: number) {
    const like = await this.commentLikeRepo.findOne({
      where: { comment: { id: commentId }, user: { id: userId } },
    });

    if (!like) {
      return { isLiked: false, isDisliked: false };
    }

    return {
      isLiked: like.isLike,
      isDisliked: !like.isLike,
    };
  }
}



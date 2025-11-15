import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { PostHistory } from '../entities/post-history.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, PostHistory])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}



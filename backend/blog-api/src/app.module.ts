import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { CommentLike } from './entities/comment-like.entity';
import { Notification } from './entities/notification.entity';
import { PostHistory } from './entities/post-history.entity';
import { CommentHistory } from './entities/comment-history.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'blog.db',
              entities: [User, Post, Comment, Like, CommentLike, Notification, PostHistory, CommentHistory],
      synchronize: true,
    }),
    UsersModule,
    PostsModule,
    CommentsModule,
    LikesModule,
    NotificationsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

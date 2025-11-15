import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { CommentHistory } from '../entities/comment-history.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { Post } from '../entities/post.entity'; // <-- make sure this exists

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly repo: Repository<Comment>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(CommentHistory) private readonly historyRepo: Repository<CommentHistory>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(page = 1, pageSize = 10) {
    if (page < 1 || pageSize < 1) {
      throw new BadRequestException('Invalid pagination params');
    }

    const [data, total] = await this.repo.findAndCount({
      relations: { author: true, post: { author: true } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' },
    });

    return { data, total, page, pageSize };
  }

  async findOne(id: number) {
    const comment = await this.repo.findOne({
      where: { id },
      relations: { author: true, post: { author: true } },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async create(
    data: { text: string; postId: number },
    authorId: number,
  ) {
    if (!data?.text?.trim()) {
      throw new BadRequestException('Text is required');
    }
    if (!data?.postId) {
      throw new BadRequestException('postId is required');
    }

    const [author, post] = await Promise.all([
      this.users.findOne({ where: { id: authorId } }),
      this.posts.findOne({
        where: { id: data.postId },
        relations: { author: true },
      }),
    ]);

    if (!author) throw new NotFoundException('Author not found');
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.repo.create({
      text: data.text.trim(),
      post,
      author,
    });

    const saved = await this.repo.save(comment);
    const fullComment = await this.findOne(saved.id);

    // Only notify the post author if different from the commenter
    const postAuthorId = post.author?.id;
    if (postAuthorId && postAuthorId !== authorId) {
      try {
        await this.notificationsService.createNotification(
          postAuthorId,
          authorId,
          NotificationType.COMMENT,
          post.id,
          saved.id,
        );
      } catch (error: any) {
        // Don’t fail the request if notifications fail
        // (optionally log with a logger)
      }
    }

    return fullComment;
  }

  async update(
    id: number,
    data: Partial<{ text: string }>,
    userId: number,
  ) {
    if (data.text !== undefined && !data.text.trim()) {
      throw new BadRequestException('Text cannot be empty');
    }

    const existing = await this.repo.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!existing) throw new NotFoundException('Comment not found');

    // Require ownership; if author is missing, disallow edits
    if (!existing.author || existing.author.id !== userId) {
      throw new ForbiddenException('Not your comment');
    }

    // Create history entry before updating
    const historyEntry = this.historyRepo.create({
      commentId: id,
      editorId: userId,
      previousContent: existing.text,
      newContent: data.text?.trim() || existing.text,
    });
    await this.historyRepo.save(historyEntry);

    await this.repo.update(id, { ...data, text: data.text?.trim() });
    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const existing = await this.repo.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!existing) throw new NotFoundException('Comment not found');

    // Require ownership; if author is missing, disallow deletes
    if (!existing.author || existing.author.id !== userId) {
      throw new ForbiddenException('Not your comment');
    }

    await this.repo.delete(id);
    return { deleted: true };
  }

  async getHistory(commentId: number) {
    return this.historyRepo.find({
      where: { commentId },
      relations: ['editor'],
      order: { editedAt: 'DESC' },
    });
  }
}

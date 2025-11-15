import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async createNotification(
    recipientId: number,
    actorId: number,
    type: NotificationType,
    postId?: number,
    commentId?: number,
  ): Promise<Notification> {
    
    const recipient = await this.userRepository.findOne({ where: { id: recipientId } });
    const actor = await this.userRepository.findOne({ where: { id: actorId } });
    
    
    if (!recipient) {
      throw new Error(`Recipient user with id ${recipientId} not found`);
    }
    
    if (!actor) {
      throw new Error(`Actor user with id ${actorId} not found`);
    }

    // Generate appropriate message based on notification type
    let message = '';
    switch (type) {
      case NotificationType.COMMENT:
        message = `${actor.name || actor.email} commented on your post`;
        break;
      case NotificationType.LIKE:
        message = `${actor.name || actor.email} liked your post`;
        break;
      case NotificationType.DISLIKE:
        message = `${actor.name || actor.email} disliked your post`;
        break;
      default:
        message = `${actor.name || actor.email} interacted with your post`;
    }


    const notification = this.notificationRepository.create({
      recipient,
      actor,
      type,
      message,
      post: postId ? { id: postId } as Post : null,
      comment: commentId ? { id: commentId } as Comment : null,
    });

    const saved = await this.notificationRepository.save(notification);
    
    return saved;
  }

  async getUserNotifications(userId: number, page = 1, pageSize = 10) {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { recipient: { id: userId } },
      relations: ['actor', 'post', 'comment'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return notifications;
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipient: { id: userId } },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepository.update(
      { recipient: { id: userId }, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { recipient: { id: userId }, isRead: false },
    });
  }

  async markAsUnread(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, recipient: { id: userId } },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = false;
    return this.notificationRepository.save(notification);
  }

  async deleteNotification(id: number, userId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, recipient: { id: userId } },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.notificationRepository.remove(notification);
  }
}

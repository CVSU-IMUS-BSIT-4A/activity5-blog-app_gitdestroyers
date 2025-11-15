import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';

export enum NotificationType {
  COMMENT = 'comment',
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  recipient!: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  actor?: User | null;

  @ManyToOne(() => Post, { nullable: true, onDelete: 'CASCADE' })
  post?: Post | null;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  comment?: Comment | null;

  @Column({
    type: 'text',
  })
  type!: NotificationType;

  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}



import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from './user.entity';

@Entity('comment_likes')
export class CommentLike {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Comment, comment => comment.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment!: Comment;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ default: true })
  isLike!: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}


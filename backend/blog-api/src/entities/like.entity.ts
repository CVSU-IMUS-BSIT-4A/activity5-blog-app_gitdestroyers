import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Post, post => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ default: true })
  isLike!: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}


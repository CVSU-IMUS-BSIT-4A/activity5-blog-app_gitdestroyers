import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';
import { CommentLike } from './comment-like.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  text!: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post!: Post;

  @ManyToOne(() => User, { nullable: true })
  author?: User | null;

  @OneToMany(() => CommentLike, commentLike => commentLike.comment)
  likes!: CommentLike[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}
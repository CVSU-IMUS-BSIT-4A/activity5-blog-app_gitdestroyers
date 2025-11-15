import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('post_history')
export class PostHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  postId!: number;

  @Column()
  editorId!: number;

  @Column({ type: 'text' })
  previousTitle!: string;

  @Column({ type: 'text' })
  previousContent!: string;

  @Column({ type: 'text' })
  newTitle!: string;

  @Column({ type: 'text' })
  newContent!: string;

  @CreateDateColumn()
  editedAt!: Date;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post?: Post;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'editorId' })
  editor?: User;
}

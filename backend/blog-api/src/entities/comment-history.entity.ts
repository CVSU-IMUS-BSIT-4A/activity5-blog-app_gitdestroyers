import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from './user.entity';

@Entity('comment_history')
export class CommentHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  commentId!: number;

  @Column()
  editorId!: number;

  @Column({ type: 'text' })
  previousContent!: string;

  @Column({ type: 'text' })
  newContent!: string;

  @CreateDateColumn()
  editedAt!: Date;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment?: Comment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'editorId' })
  editor?: User;
}

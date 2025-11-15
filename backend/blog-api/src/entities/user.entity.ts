import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Notification } from './notification.entity';
import { Like } from './like.entity';
import { CommentLike } from './comment-like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  password?: string | null;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @Column({ type: 'text', nullable: true })
  avatar?: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Notification, (n) => n.recipient)
  notifications?: Notification[];

  @OneToMany(() => Notification, (n) => n.actor)
  actorNotifications?: Notification[];

  @OneToMany(() => Like, (l) => l.user)
  likes?: Like[];

  @OneToMany(() => CommentLike, (cl) => cl.user)
  commentLikes?: CommentLike[];
}

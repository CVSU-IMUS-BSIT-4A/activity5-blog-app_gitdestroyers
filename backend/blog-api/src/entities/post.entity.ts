import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('text')
  content!: string;

  @ManyToOne(() => User, { nullable: true })
  author?: User | null;

  @OneToMany(() => Comment, (c) => c.post)
  comments?: Comment[];

  @OneToMany(() => Like, (l) => l.post)
  likes?: Like[];

  @CreateDateColumn()
  created_at!: Date;
}



import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { PostHistory } from '../entities/post-history.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly repo: Repository<Post>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(PostHistory) private readonly historyRepo: Repository<PostHistory>,
  ) {}

  async findAll(page = 1, pageSize = 10) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['author', 'comments', 'comments.author'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' },
    });
    return { data, total, page, pageSize };
  }

  async findOne(id: number) {
    const post = await this.repo.findOne({ where: { id }, relations: ['author', 'comments', 'comments.author'] });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async create(data: { title: string; content: string }, authorId: number) {
    const author = await this.users.findOne({ where: { id: authorId } });
    const post = this.repo.create({ ...data, author: author || null });
    const saved = await this.repo.save(post);
    return this.findOne(saved.id);
  }

  async update(id: number, data: Partial<{ title: string; content: string }>, userId: number) {
    const existing = await this.repo.findOne({ where: { id }, relations: ['author'] });
    if (!existing) throw new NotFoundException('Post not found');
    if (existing.author && existing.author.id !== userId) throw new ForbiddenException('Not your post');
    
    // Create history entry before updating
    const historyEntry = this.historyRepo.create({
      postId: id,
      editorId: userId,
      previousTitle: existing.title,
      previousContent: existing.content,
      newTitle: data.title || existing.title,
      newContent: data.content || existing.content,
    });
    await this.historyRepo.save(historyEntry);
    
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const existing = await this.repo.findOne({ where: { id }, relations: ['author'] });
    if (!existing) throw new NotFoundException('Post not found');
    if (existing.author && existing.author.id !== userId) throw new ForbiddenException('Not your post');
    await this.repo.delete(id);
    return { deleted: true };
  }

  async getHistory(postId: number) {
    return this.historyRepo.find({
      where: { postId },
      relations: ['editor'],
      order: { editedAt: 'DESC' },
    });
  }
}



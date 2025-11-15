import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: { email: string; name: string }) {
    const user = this.repo.create(data);
    return await this.repo.save(user);
  }

  async update(id: number, data: Partial<{ email: string; name: string; bio: string; avatar: string; password: string; currentPassword: string }>) {
    
    const updateData: any = {};
    
    // Only include fields that are actually provided
    if (data.email !== undefined) updateData.email = data.email;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    
    if (data.password) {
      // If currentPassword provided, validate against stored hash
      if (data.currentPassword) {
        const existing = await this.findOne(id);
        const matches = existing.password ? await bcrypt.compare(data.currentPassword, existing.password) : false;
        if (!matches) {
          throw new UnauthorizedException('Current password is incorrect');
        }
      }
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }
    
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}

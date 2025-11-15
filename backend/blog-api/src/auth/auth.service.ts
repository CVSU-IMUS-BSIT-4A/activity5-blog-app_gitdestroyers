import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(data: { email: string; name: string; password: string }) {
    const existing = await this.users.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already in use');
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = this.users.create({ email: data.email, name: data.name, password: passwordHash });
    await this.users.save(user);
    return { id: user.id, email: user.email, name: user.name };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.users.findOne({ where: { email: data.email } });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    return { accessToken };
  }
}



import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';

export interface GitHubProfile {
  id: string;
  username: string;
  displayName: string;
  emails: Array<{ value: string; primary?: boolean }>;
  photos: Array<{ value: string }>;
}

export interface JwtPayload {
  sub: string;
  username: string;
  email?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateOrCreateUser(
    githubId: string,
    username: string,
    email: string | null,
    avatarUrl: string | null,
    accessToken: string,
  ): Promise<User> {
    let user = await this.userRepository.findOne({ where: { githubId } });

    if (user) {
      user.accessToken = accessToken;
      if (username) user.username = username;
      if (email) user.email = email;
      if (avatarUrl) user.avatarUrl = avatarUrl;
      await this.userRepository.save(user);
    } else {
      user = this.userRepository.create({
        githubId,
        username,
        email: email || undefined,
        avatarUrl: avatarUrl || undefined,
        accessToken,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  generateJwtToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}

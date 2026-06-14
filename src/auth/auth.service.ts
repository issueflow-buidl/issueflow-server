import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';

export interface GitHubProfile {
  id: string;
  username: string;
  displayName: string;
  emails: Array<{ value: string; primary?: boolean }>;
  photos: Array<{ value: string }>;
  _json: {
    id: number;
    login: string;
    name: string;
    email: string;
    avatar_url: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateOrCreateUser(
    profile: GitHubProfile,
    accessToken: string,
  ): Promise<User> {
    const githubId = profile._json.id.toString();
    let user = await this.userRepository.findOne({ where: { githubId } });

    if (!user) {
      user = this.userRepository.create({
        githubId,
        username: profile._json.login,
        email: profile._json.email,
        avatarUrl: profile._json.avatar_url,
        accessToken,
      });
      await this.userRepository.save(user);
    } else {
      user.accessToken = accessToken;
      if (profile._json.email) {
        user.email = profile._json.email;
      }
      if (profile._json.avatar_url) {
        user.avatarUrl = profile._json.avatar_url;
      }
      await this.userRepository.save(user);
    }

    return user;
  }

  generateToken(user: User): { access_token: string; user: Partial<User> } {
    const payload = {
      sub: user.id,
      githubId: user.githubId,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        githubId: user.githubId,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}

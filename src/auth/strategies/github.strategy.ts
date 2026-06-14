import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService, GitHubProfile } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        'http://localhost:3000/auth/github/callback',
      scope: ['user:email', 'repo'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GitHubProfile,
  ): Promise<any> {
    if (!profile._json?.id) {
      throw new UnauthorizedException('Invalid GitHub profile');
    }

    const user = await this.authService.validateOrCreateUser(
      profile,
      accessToken,
    );
    return user;
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService, GitHubProfile } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        'http://localhost:3000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GitHubProfile,
  ): Promise<unknown> {
    const { id, username, emails, photos } = profile;

    const email = emails && emails.length > 0 ? emails[0].value : null;
    const avatarUrl = photos && photos.length > 0 ? photos[0].value : null;

    return await this.authService.validateOrCreateUser(
      String(id),
      username,
      email,
      avatarUrl,
      accessToken,
    );
  }
}

import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { User } from '../entities';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth(): void {
    // Initiates GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubAuthCallback(@Req() req: Request, @Res() res: Response): void {
    const user = req.user as User | undefined;
    if (!user) {
      throw new UnauthorizedException('GitHub authentication failed');
    }

    const token = this.authService.generateJwtToken(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;
    res.redirect(redirectUrl);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getCurrentUser(@Req() req: Request): {
    id: string;
    username: string;
    email: string | null;
    avatarUrl: string | null;
  } {
    const user = req.user as User;
    return {
      id: user.id,
      username: user.username,
      email: user.email ?? null,
      avatarUrl: user.avatarUrl ?? null,
    };
  }
}

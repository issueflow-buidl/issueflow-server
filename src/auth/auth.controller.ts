import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import type { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    // Guard redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubAuthCallback(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const user = req.user;
    const token = this.authService.generateToken(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token.access_token}&user=${encodeURIComponent(JSON.stringify(token.user))}`;

    res.redirect(redirectUrl);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}

import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { LoginDto } from '../../dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserRole } from '../../constants';

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

type RefreshTokenResponse = {
  access_token: string;
};

type JwtUser = {
  userId: string;
  email: string;
  role: UserRole;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  async refreshToken(
    @Req() req: Request & { user: JwtUser },
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(req.user);
  }
}

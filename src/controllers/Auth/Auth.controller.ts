import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { LoginDto } from '../../DTOs';
import { AuthService } from '../../services';
import { JwtAuthGuard } from '../../guards';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Login with email and password. Sets httpOnly cookies.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }
  
  @Post('refresh')
  @ApiOperation({ 
    summary: 'Refresh tokens',
    description:
      'Reads refresh_token from httpOnly cookie and issues new tokens.',
  })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  refreshToken(
    @Req() req: { cookies: { refresh_token: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    return this.authService.refreshToken(refreshToken, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description: 'Clears cookies and invalidates refresh token.',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  logout(
    @Req() req: { user: { id: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(req.user.id, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns authenticated user with role.',
  })
  @ApiResponse({ status: 200, description: 'User fetched successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getMe(@Req() req: { user: { id: string } }) {
    return this.authService.getMe(req.user.id);
  }
}

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { JwtPayload } from '../../strategy';
import { PrismaService } from '../PrismaService/Prisma.service';
import { LoginDto } from '../../DTOs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Generate Tokens ───────────────────────────────────────────────
  private async generateTokens(payload: JwtPayload) {
    const accessOptions: JwtSignOptions = {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: 900, // 15 minutes
    };

    const refreshOptions: JwtSignOptions = {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: 604800, // 7 days
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, accessOptions),
      this.jwt.signAsync(payload, refreshOptions),
    ]);

    return { accessToken, refreshToken };
  }

  // ─── Set Cookies ───────────────────────────────────────────────────
  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes in ms
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
  }

  // ─── Clear Cookies ─────────────────────────────────────────────────
  private clearCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  // ─── Hash & Store Refresh Token ────────────────────────────────────
  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hashed },
    });
  }

  // ─── Strip Sensitive Fields ────────────────────────────────────────
  private sanitizeUser(user: any) {
    const { password, hashedRefreshToken, ...safeUser } = user;
    return safeUser;
  }

  // ─── Login ─────────────────────────────────────────────────────────
  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('Invalid email or password.');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Your account is inactive.');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const tokens = await this.generateTokens(payload);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      message: 'Login successful.',
      data: {
        // user: this.sanitizeUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  // ─── Refresh Token ─────────────────────────────────────────────────
  async refreshToken(refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token not found. Please login again.',
      );
    }

    // verify refresh token signature & expiry
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired refresh token. Please login again.',
      );
    }

    // fetch user with role
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access denied. Please login again.');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Your account is inactive.');
    }

    // verify cookie token matches hashed value in DB (rotation check)
    const refreshTokenMatch = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!refreshTokenMatch) {
      // token reuse detected — wipe refresh token from DB as security measure
      await this.prisma.user.update({
        where: { id: user.id },
        data: { hashedRefreshToken: null },
      });
      this.clearCookies(res);
      throw new UnauthorizedException(
        'Refresh token reuse detected. Please login again.',
      );
    }

    // rotate both tokens
    const newPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const tokens = await this.generateTokens(newPayload);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      message: 'Tokens refreshed successfully.',
      data: {
        // user: this.sanitizeUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      },
    };
  }

  // ─── Logout ────────────────────────────────────────────────────────
  async logout(userId: string, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // invalidate refresh token in DB
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });

    this.clearCookies(res);

    return { message: 'Logged out successfully.' };
  }

  // ─── Get Me ────────────────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            isSystem: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return {
      message: 'User fetched successfully.',
      data: user,
    };
  }
}

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

type PrincipalType = 'user' | 'employee';

interface Principal {
  id: string;
  email: string;
  password: string;
  hashedRefreshToken: string | null;
  isActive: boolean;
  role: { name: string };
  type: PrincipalType;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Resolve Principal By Email (User first, then Employee) ────────
  private async findPrincipalByEmail(email: string): Promise<Principal | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (user) {
      return {
        id: user.id,
        email: user.email,
        password: user.password,
        hashedRefreshToken: user.hashedRefreshToken,
        isActive: user.status !== 'INACTIVE',
        role: { name: user.role.name },
        type: 'user',
      };
    }

    const employee = await this.prisma.employee.findUnique({
      where: { email },
      include: { role: true },
    });

    if (employee) {
      return {
        id: employee.id,
        email: employee.email,
        password: employee.password,
        hashedRefreshToken: employee.hashedRefreshToken,
        isActive: employee.isActive,
        role: { name: employee.role.name },
        type: 'employee',
      };
    }

    return null;
  }

  // ─── Resolve Principal By ID (User first, then Employee) ───────────
  private async findPrincipalById(id: string): Promise<Principal | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (user) {
      return {
        id: user.id,
        email: user.email,
        password: user.password,
        hashedRefreshToken: user.hashedRefreshToken,
        isActive: user.status !== 'INACTIVE',
        role: { name: user.role.name },
        type: 'user',
      };
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { role: true },
    });

    if (employee) {
      return {
        id: employee.id,
        email: employee.email,
        password: employee.password,
        hashedRefreshToken: employee.hashedRefreshToken,
        isActive: employee.isActive,
        role: { name: employee.role.name },
        type: 'employee',
      };
    }

    return null;
  }

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
  private async storeRefreshToken(
    type: PrincipalType,
    id: string,
    refreshToken: string,
  ) {
    const hashed = await bcrypt.hash(refreshToken, 10);

    if (type === 'user') {
      await this.prisma.user.update({
        where: { id },
        data: { hashedRefreshToken: hashed },
      });
    } else {
      await this.prisma.employee.update({
        where: { id },
        data: { hashedRefreshToken: hashed },
      });
    }
  }

  // ─── Clear Stored Refresh Token ─────────────────────────────────────
  private async clearRefreshToken(type: PrincipalType, id: string) {
    if (type === 'user') {
      await this.prisma.user.update({
        where: { id },
        data: { hashedRefreshToken: null },
      });
    } else {
      await this.prisma.employee.update({
        where: { id },
        data: { hashedRefreshToken: null },
      });
    }
  }

  // ─── Strip Sensitive Fields ────────────────────────────────────────
  private sanitizeUser(user: any) {
    const { password, hashedRefreshToken, ...safeUser } = user;
    return safeUser;
  }

  // ─── Login ─────────────────────────────────────────────────────────
  async login(dto: LoginDto, res: Response) {
    const principal = await this.findPrincipalByEmail(dto.email);

    if (!principal) {
      throw new NotFoundException('Invalid email or password.');
    }

    if (!principal.isActive) {
      throw new UnauthorizedException('Your account is inactive.');
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      principal.password,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload: JwtPayload = {
      sub: principal.id,
      email: principal.email,
      role: principal.role.name,
    };

    const tokens = await this.generateTokens(payload);
    await this.storeRefreshToken(
      principal.type,
      principal.id,
      tokens.refreshToken,
    );
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

    // fetch principal (User or Employee) with role
    const principal = await this.findPrincipalById(payload.sub);

    if (!principal || !principal.hashedRefreshToken) {
      throw new UnauthorizedException('Access denied. Please login again.');
    }

    if (!principal.isActive) {
      throw new UnauthorizedException('Your account is inactive.');
    }

    // verify cookie token matches hashed value in DB (rotation check)
    const refreshTokenMatch = await bcrypt.compare(
      refreshToken,
      principal.hashedRefreshToken,
    );

    if (!refreshTokenMatch) {
      // token reuse detected — wipe refresh token from DB as security measure
      await this.clearRefreshToken(principal.type, principal.id);
      this.clearCookies(res);
      throw new UnauthorizedException(
        'Refresh token reuse detected. Please login again.',
      );
    }

    // rotate both tokens
    const newPayload: JwtPayload = {
      sub: principal.id,
      email: principal.email,
      role: principal.role.name,
    };

    const tokens = await this.generateTokens(newPayload);
    await this.storeRefreshToken(
      principal.type,
      principal.id,
      tokens.refreshToken,
    );
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      message: 'Tokens refreshed successfully.',
      data: {
        // user: this.sanitizeUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  // ─── Logout ────────────────────────────────────────────────────────
  async logout(userId: string, res: Response) {
    const principal = await this.findPrincipalById(userId);

    if (!principal) {
      throw new NotFoundException('User not found.');
    }

    // invalidate refresh token in DB
    await this.clearRefreshToken(principal.type, principal.id);

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

    if (user) {
      return {
        message: 'User fetched successfully.',
        data: { ...user, type: 'user' },
      };
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        branchId: true,
        departmentId: true,
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

    if (!employee) {
      throw new NotFoundException('User not found.');
    }

    return {
      message: 'User fetched successfully.',
      data: { ...employee, type: 'employee' },
    };
  }
}

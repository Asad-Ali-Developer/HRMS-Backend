import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { ConfigService } from '@nestjs/config';
import { CreateAdminDto } from '../../DTOs';
import { PrismaService } from '../PrismaService/Prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createAdmin(secret: string, dto: CreateAdminDto) {
    const systemSecret =
      this.config.get<string>('ADMIN_SECRET') || 'ma-admin-hu';

    if (secret !== systemSecret) {
      throw new UnauthorizedException('Invalid admin secret.');
    }

    let role = await this.prisma.role.findUnique({
      where: { name: 'Admin' },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: { name: 'Admin', isSystem: true },
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user) {
      throw new ConflictException('Email already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const admin = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        roleId: role.id,
      },
      include: { role: true },
    });

    return {
      message: 'Admin created successfully.',
      data: admin,
    };
  }

  async getAdmins() {
    const admins = await this.prisma.user.findMany({
      where: {
        role: { name: 'Admin' },
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    });

    return {
      message: 'Admins fetched successfully.',
      data: admins,
    };
  }

  async deleteAdmin(secret: string, id: string) {
    const systemSecret =
      this.config.get<string>('ADMIN_SECRET') || 'ma-admin-hu';

    if (secret !== systemSecret) {
      throw new UnauthorizedException('Invalid admin secret.');
    }

    const admin = await this.prisma.user.findFirst({
      where: {
        id,
        role: { name: 'Admin' },
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'Admin deleted successfully.',
    };
  }
}

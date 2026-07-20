import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../PrismaService/Prisma.service';
import {
  CreateRolePermissionDto,
  UpdateRolePermissionDto,
} from '../../DTOs/RBAC/RolePermissions.dto';
import { verifyAdmin } from '../../utils';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRolePermissionDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!role) throw new NotFoundException('Role not found.');

    const subModule = await this.prisma.subModule.findUnique({
      where: { id: dto.subModuleId },
    });
    if (!subModule) throw new NotFoundException('Sub-module not found.');

    const exists = await this.prisma.rolePermission.findFirst({
      where: {
        roleId: dto.roleId,
        subModuleId: dto.subModuleId,
      },
    });

    if (exists) throw new ConflictException('Permission already assigned.');

    return this.prisma.rolePermission.create({
      data: dto,
      include: {
        role: true,
        subModule: {
          include: {
            module: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.rolePermission.findMany({
      include: {
        role: true,
        subModule: {
          include: {
            module: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const permission = await this.prisma.rolePermission.findUnique({
      where: {
        id,
      },
      include: {
        role: true,
        subModule: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!permission) throw new NotFoundException();

    return permission;
  }

  async update(id: string, dto: UpdateRolePermissionDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    await this.findOne(id);

    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: dto.roleId },
      });
      if (!role) throw new NotFoundException('Role not found.');
    }

    if (dto.subModuleId) {
      const subModule = await this.prisma.subModule.findUnique({
        where: { id: dto.subModuleId },
      });
      if (!subModule) throw new NotFoundException('Sub-module not found.');
    }

    return this.prisma.rolePermission.update({
      where: { id },
      data: dto,
      include: {
        role: true,
        subModule: {
          include: {
            module: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    await this.findOne(id);

    return this.prisma.rolePermission.delete({
      where: {
        id,
      },
    });
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../PrismaService/Prisma.service';
import { CreateRoleDto, UpdateRoleDto } from '../../DTOs';
import { verifyAdmin } from '../../utils';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    const exists = await this.prisma.role.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (exists) throw new ConflictException('Role already exists.');

    return this.prisma.role.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) throw new NotFoundException('Role not found.');

    return role;
  }

  async update(id: string, dto: UpdateRoleDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    await this.findOne(id);

    if (dto.name) {
      const exists = await this.prisma.role.findFirst({
        where: {
          name: dto.name,
          NOT: {
            id,
          },
        },
      });

      if (exists) throw new ConflictException('Role name already exists.');
    }

    return this.prisma.role.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    await this.findOne(id);

    return this.prisma.role.delete({
      where: {
        id,
      },
    });
  }

  async getPermissionMatrix(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const modules = await this.prisma.module.findMany({
      where: {
        isActive: true,
      },
      include: {
        subModules: {
          where: {
            isActive: true,
          },
          include: {
            permissions: {
              where: {
                roleId,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      modules: modules.map((module) => ({
        id: module.id,
        name: module.name,
        description: module.description,

        subModules: module.subModules.map((subModule) => ({
          id: subModule.id,
          name: subModule.name,
          description: subModule.description,

          assigned: subModule.permissions.length > 0,

          actions:
            subModule.permissions.length > 0
              ? subModule.permissions[0].actions
              : [],
        })),
      })),
    };
  }
}

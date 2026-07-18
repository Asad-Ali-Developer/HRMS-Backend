import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../PrismaService/Prisma.service';
import { CreateSubModuleDto, UpdateSubModuleDto } from '../../DTOs';
import { verifyAdmin } from '../../utils';

@Injectable()
export class SubModuleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubModuleDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    const moduleExists = await this.prisma.module.findUnique({
      where: {
        id: dto.moduleId,
      },
    });

    if (!moduleExists) throw new NotFoundException('Module not found.');

    const exists = await this.prisma.subModule.findFirst({
      where: {
        moduleId: dto.moduleId,
        name: dto.name,
      },
    });

    if (exists) throw new ConflictException('Sub module already exists.');

    return this.prisma.subModule.create({
      data: dto,
      include: {
        module: true,
      },
    });
  }

  async findAll() {
    return this.prisma.subModule.findMany({
      include: {
        module: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const subModule = await this.prisma.subModule.findUnique({
      where: {
        id,
      },
      include: {
        module: true,
      },
    });

    if (!subModule) throw new NotFoundException('Sub module not found.');

    return subModule;
  }

  async update(id: string, dto: UpdateSubModuleDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    await this.findOne(id);

    if (dto.name && dto.moduleId) {
      const exists = await this.prisma.subModule.findFirst({
        where: {
          moduleId: dto.moduleId,
          name: dto.name,
          NOT: {
            id,
          },
        },
      });

      if (exists) throw new ConflictException('Sub module already exists.');
    }

    return this.prisma.subModule.update({
      where: {
        id,
      },
      data: dto,
      include: {
        module: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    await this.findOne(id);

    return this.prisma.subModule.delete({
      where: {
        id,
      },
    });
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../PrismaService/Prisma.service';
import { CreateSystemModuleDto, UpdateSystemModuleDto } from '../../DTOs';
import { verifyAdmin } from '../../utils';

@Injectable()
export class ModuleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSystemModuleDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    const exists = await this.prisma.module.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (exists) throw new ConflictException('Module already exists.');

    return this.prisma.module.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.module.findMany({
      include: {
        subModules: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const module = await this.prisma.module.findUnique({
      where: {
        id,
      },
      include: {
        subModules: true,
      },
    });

    if (!module) throw new NotFoundException('Module not found.');

    return module;
  }

  async update(id: string, dto: UpdateSystemModuleDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    await this.findOne(id);

    if (dto.name) {
      const exists = await this.prisma.module.findFirst({
        where: {
          name: dto.name,
          NOT: {
            id,
          },
        },
      });

      if (exists) throw new ConflictException('Module name already exists.');
    }

    return this.prisma.module.update({
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

    return this.prisma.module.delete({
      where: {
        id,
      },
    });
  }
}

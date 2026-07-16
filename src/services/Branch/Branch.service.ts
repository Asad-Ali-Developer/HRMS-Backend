import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../PrismaService/Prisma.service';
import { CreateBranchDto, UpdateBranchDto } from '../../DTOs';

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Verify Admin Role ─────────────────────────────────────────────
  private async verifyAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.role.name !== 'Admin') {
      throw new ForbiddenException(
        'Only users with Admin role can perform this action.',
      );
    }

    return user;
  }

  // ─── Create Branch ─────────────────────────────────────────────────
  async createBranch(dto: CreateBranchDto, adminId: string) {
    await this.verifyAdmin(adminId);

    const existing = await this.prisma.branch.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('A branch with this email already exists.');
    }

    const branch = await this.prisma.branch.create({
      data: {
        name: dto.name,
        location: dto.location,
        email: dto.email,
        phone: dto.phone,
        landline: dto.landline,
        isActive: dto.isActive ?? true,
        createdById: adminId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      message: 'Branch created successfully.',
      data: branch,
    };
  }

  // ─── Get All Branches ──────────────────────────────────────────────
  async getAllBranches(page: number = 1, limit: number = 10) {
    // Validate page and limit parameters
    const pageNumber = Math.max(1, parseInt(String(page)) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(limit)) || 10));

    // Calculate skip value for pagination
    const skip = (pageNumber - 1) * pageSize;

    // Get total count for pagination metadata
    const totalCount = await this.prisma.branch.count();

    // Fetch paginated branches
    const branches = await this.prisma.branch.findMany({
      skip: skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    return {
      message: 'Branches fetched successfully.',
      data: branches,
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
      },
    };
  }

  // ─── Get Branch By ID ──────────────────────────────────────────────
  async getBranchById(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    return {
      message: 'Branch fetched successfully.',
      data: branch,
    };
  }

  // ─── Update Branch ─────────────────────────────────────────────────
  async updateBranch(id: string, dto: UpdateBranchDto, adminId: string) {
    await this.verifyAdmin(adminId);

    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    if (dto.email && dto.email !== branch.email) {
      const emailTaken = await this.prisma.branch.findUnique({
        where: { email: dto.email },
      });

      if (emailTaken) {
        throw new ConflictException('A branch with this email already exists.');
      }
    }

    const updated = await this.prisma.branch.update({
      where: { id },
      data: {
        ...dto,
        updatedById: adminId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      message: 'Branch updated successfully.',
      data: updated,
    };
  }

  // ─── Delete Branch ─────────────────────────────────────────────────
  async deleteBranch(id: string, adminId: string) {
    await this.verifyAdmin(adminId);

    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    await this.prisma.branch.delete({
      where: { id },
    });

    return {
      message: 'Branch deleted successfully.',
    };
  }

  // ─── Toggle Branch Status ──────────────────────────────────────────
  async toggleBranchStatus(id: string, adminId: string) {
    await this.verifyAdmin(adminId);

    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    const updated = await this.prisma.branch.update({
      where: { id },
      data: {
        isActive: !branch.isActive,
        updatedById: adminId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      message: `Branch ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: updated,
    };
  }
}

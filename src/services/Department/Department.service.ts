import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../PrismaService/Prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../../DTOs';
import { verifyAdmin } from '../../utils';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Create Department ─────────────────────────────────────────────
  async createDepartment(dto: CreateDepartmentDto, adminId: string) {
    // Verify Admin
    await verifyAdmin(adminId, this.prisma);

    // Check if department with same name already exists (case-insensitive)
    const existingByName = await this.prisma.department.findFirst({
      where: {
        name: {
          equals: dto.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingByName) {
      throw new ConflictException(
        'A department with this name already exists.',
      );
    }

    // Check if department code already exists (if provided)
    if (dto.code) {
      const existingByCode = await this.prisma.department.findUnique({
        where: { code: dto.code },
      });

      if (existingByCode) {
        throw new ConflictException(
          'A department with this code already exists.',
        );
      }
    }

    const department = await this.prisma.department.create({
      data: {
        name: dto.name,
        description: dto.description,
        code: dto.code,
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
      message: 'Department created successfully.',
      data: department,
    };
  }

  // ─── Get All Departments ──────────────────────────────────────────
  async getAllDepartments(page: number = 1, limit: number = 10) {
    // Validate page and limit parameters
    const pageNumber = Math.max(1, parseInt(String(page)) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(limit)) || 10));

    // Calculate skip value for pagination
    const skip = (pageNumber - 1) * pageSize;

    // Get total count for pagination metadata
    const totalCount = await this.prisma.department.count();

    // Fetch paginated departments
    const departments = await this.prisma.department.findMany({
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
      message: 'Departments fetched successfully.',
      data: departments,
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

  // ─── Get Active Departments ───────────────────────────────────────
  async getActiveDepartments() {
    const departments = await this.prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
      },
    });

    return {
      message: 'Active departments fetched successfully.',
      data: departments,
    };
  }

  // ─── Get Department By ID ─────────────────────────────────────────
  async getDepartmentById(id: string) {
    const department = await this.prisma.department.findUnique({
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

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    return {
      message: 'Department fetched successfully.',
      data: department,
    };
  }

  // ─── Get Department By Code ───────────────────────────────────────
  async getDepartmentByCode(code: string) {
    const department = await this.prisma.department.findUnique({
      where: { code },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    return {
      message: 'Department fetched successfully.',
      data: department,
    };
  }

  // ─── Update Department ────────────────────────────────────────────
  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto,
    adminId: string,
  ) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    // Check for duplicate name (if name is being updated)
    if (dto.name && dto.name !== department.name) {
      const existingByName = await this.prisma.department.findFirst({
        where: {
          name: {
            equals: dto.name,
            mode: 'insensitive',
          },
          id: { not: id }, // Exclude current department
        },
      });

      if (existingByName) {
        throw new ConflictException(
          'A department with this name already exists.',
        );
      }
    }

    // Check for duplicate code (if code is being updated)
    if (dto.code && dto.code !== department.code) {
      const existingByCode = await this.prisma.department.findUnique({
        where: { code: dto.code },
      });

      if (existingByCode) {
        throw new ConflictException(
          'A department with this code already exists.',
        );
      }
    }

    const updated = await this.prisma.department.update({
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
      message: 'Department updated successfully.',
      data: updated,
    };
  }

  // ─── Delete Department ────────────────────────────────────────────
  async deleteDepartment(id: string, adminId: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    // Optional: Check if department has associated records before deleting
    // Example: Check if there are employees in this department
    // const employeeCount = await this.prisma.employee.count({
    //   where: { departmentId: id },
    // });
    // if (employeeCount > 0) {
    //   throw new ConflictException('Cannot delete department with associated employees.');
    // }

    await this.prisma.department.delete({
      where: { id },
    });

    return {
      message: 'Department deleted successfully.',
    };
  }

  // ─── Toggle Department Status ─────────────────────────────────────
  async toggleDepartmentStatus(id: string, adminId: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    const updated = await this.prisma.department.update({
      where: { id },
      data: {
        isActive: !department.isActive,
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
      message: `Department ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: updated,
    };
  }
}

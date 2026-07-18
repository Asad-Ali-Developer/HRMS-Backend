import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../PrismaService/Prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../../DTOs';
import { verifyAdmin } from '../../utils';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  // Never leak the password hash back to the client
  private sanitize<T extends { password?: string }>(employee: T) {
    if (!employee) return employee;
    const { password, ...rest } = employee;
    return rest;
  }

  async create(dto: CreateEmployeeDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!role) throw new NotFoundException('Role not found.');

    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) throw new NotFoundException('Branch not found.');

    const emailExists = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });
    if (emailExists) throw new ConflictException('Email already exists.');

    const cnicExists = await this.prisma.employee.findUnique({
      where: { cnic: dto.cnic },
    });
    if (cnicExists) throw new ConflictException('CNIC already exists.');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const employee = await this.prisma.employee.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });

    return this.sanitize(employee);
  }

  async findAll(page = 1, limit = 10) {
    const currentPage = Number(page) || 1;
    const pageSize = Math.min(Number(limit) || 10, 100);
    const skip = (currentPage - 1) * pageSize;

    const [employees, totalCount] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          role: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      this.prisma.employee.count(),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return {
      data: employees.map((employee) => this.sanitize(employee)),
      pagination: {
        currentPage,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        role: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    if (!employee) throw new NotFoundException('Employee not found.');

    return this.sanitize(employee);
  }

  async update(id: string, dto: UpdateEmployeeDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    await this.findOne(id);

    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: dto.roleId },
      });
      if (!role) throw new NotFoundException('Role not found.');
    }

    if (dto.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: dto.branchId },
      });
      if (!branch) throw new NotFoundException('Branch not found.');
    }

    if (dto.email) {
      const emailExists = await this.prisma.employee.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (emailExists) throw new ConflictException('Email already exists.');
    }

    if (dto.cnic) {
      const cnicExists = await this.prisma.employee.findFirst({
        where: { cnic: dto.cnic, NOT: { id } },
      });
      if (cnicExists) throw new ConflictException('CNIC already exists.');
    }

    const data: Record<string, unknown> = { ...dto };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const employee = await this.prisma.employee.update({
      where: { id },
      data,
    });

    return this.sanitize(employee);
  }

  async remove(id: string, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    await this.findOne(id);

    const employee = await this.prisma.employee.delete({
      where: { id },
    });

    return this.sanitize(employee);
  }
}

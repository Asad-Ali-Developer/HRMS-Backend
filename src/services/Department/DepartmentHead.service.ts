import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../PrismaService/Prisma.service';
import { CreateDepartmentHeadDto, UpdateDepartmentHeadDto } from '../../DTOs';
import { verifyAdmin } from '../../utils';

@Injectable()
export class DepartmentHeadService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDepartmentHeadDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) throw new NotFoundException('Department not found.');

    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found.');

    const departmentTaken = await this.prisma.departmentHead.findUnique({
      where: { departmentId: dto.departmentId },
    });
    if (departmentTaken)
      throw new ConflictException(
        'This department already has a head assigned.',
      );

    const employeeTaken = await this.prisma.departmentHead.findUnique({
      where: { employeeId: dto.employeeId },
    });
    if (employeeTaken)
      throw new ConflictException(
        'This employee is already assigned as a department head.',
      );

    return this.prisma.departmentHead.create({
      data: dto,
    });
  }

  async findAll(page = 1, limit = 10) {
    const currentPage = Number(page) || 1;
    const pageSize = Math.min(Number(limit) || 10, 100);
    const skip = (currentPage - 1) * pageSize;

    const [departmentHeads, totalCount] = await this.prisma.$transaction([
      this.prisma.departmentHead.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          department: true,
          employee: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.departmentHead.count(),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return {
      data: departmentHeads,
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
    const departmentHead = await this.prisma.departmentHead.findUnique({
      where: { id },
      include: {
        department: true,
        employee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!departmentHead)
      throw new NotFoundException('Department head not found.');

    return departmentHead;
  }

  async findByDepartment(departmentId: string) {
    const departmentHead = await this.prisma.departmentHead.findUnique({
      where: { departmentId },
      include: {
        department: true,
        employee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!departmentHead)
      throw new NotFoundException('No head assigned for this department.');

    return departmentHead;
  }

  async update(id: string, dto: UpdateDepartmentHeadDto, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    const current = await this.findOne(id);

    if (dto.departmentId && dto.departmentId !== current.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department) throw new NotFoundException('Department not found.');

      const departmentTaken = await this.prisma.departmentHead.findUnique({
        where: { departmentId: dto.departmentId },
      });
      if (departmentTaken)
        throw new ConflictException(
          'This department already has a head assigned.',
        );
    }

    if (dto.employeeId && dto.employeeId !== current.employeeId) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: dto.employeeId },
      });
      if (!employee) throw new NotFoundException('Employee not found.');

      const employeeTaken = await this.prisma.departmentHead.findUnique({
        where: { employeeId: dto.employeeId },
      });
      if (employeeTaken)
        throw new ConflictException(
          'This employee is already assigned as a department head.',
        );
    }

    return this.prisma.departmentHead.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    // Check first for Admin
    await verifyAdmin(userId, this.prisma);

    await this.findOne(id);

    return this.prisma.departmentHead.delete({
      where: { id },
    });
  }
}

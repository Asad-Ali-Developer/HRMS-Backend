import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../../guards';
import { DepartmentService } from '../../services';
import { Roles } from '../../decorators';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../../DTOs';

@ApiTags('Department')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({
    summary: 'Create a department',
    description: 'Admin only. Creates a new department.',
  })
  @ApiBody({ type: CreateDepartmentDto })
  @ApiResponse({ status: 201, description: 'Department created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  @ApiResponse({
    status: 409,
    description: 'Department name or code already exists.',
  })
  createDepartment(
    @Body() dto: CreateDepartmentDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.departmentService.createDepartment(dto, req.user.id);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({
    summary: 'Get all departments',
    description: 'Admin only. Supports pagination.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Departments fetched successfully.',
    schema: {
      example: {
        message: 'Departments fetched successfully.',
        data: [
          {
            id: 'uuid-1',
            name: 'Engineering',
            description: 'Software development team',
            code: 'ENG-001',
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: {
              id: 'user-1',
              name: 'John Doe',
              email: 'john@example.com',
            },
            updatedBy: null,
          },
        ],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalCount: 25,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  getAllDepartments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.departmentService.getAllDepartments(page, limit);
  }

  @Get('active')
  @Roles('Admin', 'HR') // Allow both Admin and Manager roles
  @ApiOperation({
    summary: 'Get active departments',
    description:
      'Returns only active departments. Accessible by Admin and Manager.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active departments fetched successfully.',
  })
  getActiveDepartments() {
    return this.departmentService.getActiveDepartments();
  }

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Get department by ID',
    description: 'Admin only. Fetches a single department.',
  })
  @ApiParam({ name: 'id', description: 'Department UUID' })
  @ApiResponse({ status: 200, description: 'Department fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  getDepartmentById(@Param('id') id: string) {
    return this.departmentService.getDepartmentById(id);
  }

  @Get('code/:code')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Get department by code',
    description: 'Admin only. Fetches department by unique code.',
  })
  @ApiParam({ name: 'code', description: 'Department code' })
  @ApiResponse({ status: 200, description: 'Department fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  getDepartmentByCode(@Param('code') code: string) {
    return this.departmentService.getDepartmentByCode(code);
  }

  @Put(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Update a department',
    description: 'Admin only. Updates department information.',
  })
  @ApiParam({ name: 'id', description: 'Department UUID' })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({ status: 200, description: 'Department updated successfully.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  @ApiResponse({
    status: 409,
    description: 'Department name or code already exists.',
  })
  updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.departmentService.updateDepartment(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Delete a department',
    description: 'Admin only. Permanently deletes a department.',
  })
  @ApiParam({ name: 'id', description: 'Department UUID' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  deleteDepartment(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.departmentService.deleteDepartment(id, req.user.id);
  }

  @Patch(':id/toggle-status')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Toggle department active status',
    description: 'Admin only. Activates or deactivates a department.',
  })
  @ApiParam({ name: 'id', description: 'Department UUID' })
  @ApiResponse({ status: 200, description: 'Department status toggled.' })
  @ApiResponse({ status: 404, description: 'Department not found.' })
  toggleDepartmentStatus(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.departmentService.toggleDepartmentStatus(id, req.user.id);
  }
}

import {
  Req,
  Get,
  Body,
  Post,
  Param,
  Patch,
  Query,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import {
  ApiBody,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../../decorators';
import { DepartmentHeadService } from '../../services';
import { JwtAuthGuard, RolesGuard } from '../../guards';
import { CreateDepartmentHeadDto, UpdateDepartmentHeadDto } from '../../DTOs';

@ApiTags('Department Head')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('department-heads')
export class DepartmentHeadController {
  constructor(private readonly departmentHeadService: DepartmentHeadService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({
    summary: 'Assign a department head',
    description: 'Admin only.',
  })
  @ApiBody({ type: CreateDepartmentHeadDto })
  @ApiResponse({
    status: 201,
    description: 'Department head assigned successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can assign a department head.',
  })
  @ApiResponse({
    status: 404,
    description: 'Department or Employee not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Department already has a head, or employee is already a head elsewhere.',
  })
  create(
    @Body() dto: CreateDepartmentHeadDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.departmentHeadService.create(dto, req.user.id);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({
    summary: 'Get all department heads',
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
    description: 'Department heads fetched successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view department heads.',
  })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.departmentHeadService.findAll(page, limit);
  }

  @Get('department/:departmentId')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Get the head of a specific department',
    description: 'Admin only.',
  })
  @ApiParam({ name: 'departmentId', description: 'Department UUID' })
  @ApiResponse({
    status: 200,
    description: 'Department head fetched successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view a department head.',
  })
  @ApiResponse({
    status: 404,
    description: 'No head assigned for this department.',
  })
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.departmentHeadService.findByDepartment(departmentId);
  }

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Get department head by ID',
    description: 'Admin only.',
  })
  @ApiParam({ name: 'id', description: 'DepartmentHead UUID' })
  @ApiResponse({
    status: 200,
    description: 'Department head fetched successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view a department head.',
  })
  @ApiResponse({ status: 404, description: 'Department head not found.' })
  findOne(@Param('id') id: string) {
    return this.departmentHeadService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Update a department head assignment',
    description: 'Admin only.',
  })
  @ApiParam({ name: 'id', description: 'DepartmentHead UUID' })
  @ApiBody({ type: UpdateDepartmentHeadDto })
  @ApiResponse({
    status: 200,
    description: 'Department head updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can update a department head.',
  })
  @ApiResponse({
    status: 404,
    description: 'Department head, Department, or Employee not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Department already has a head, or employee is already a head elsewhere.',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentHeadDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.departmentHeadService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Remove a department head assignment',
    description: 'Admin only.',
  })
  @ApiParam({ name: 'id', description: 'DepartmentHead UUID' })
  @ApiResponse({
    status: 200,
    description: 'Department head removed successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can remove a department head.',
  })
  @ApiResponse({ status: 404, description: 'Department head not found.' })
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.departmentHeadService.remove(id, req.user.id);
  }
}

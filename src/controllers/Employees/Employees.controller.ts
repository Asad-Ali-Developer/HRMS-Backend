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
import { JwtAuthGuard, RolesGuard } from '../../guards';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../../DTOs';
import { EmployeeService } from '../../services';

@ApiTags('Employee')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create an employee', description: 'Admin only.' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: 201, description: 'Employee created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can create an employee.',
  })
  @ApiResponse({ status: 404, description: 'Role or Branch not found.' })
  @ApiResponse({
    status: 409,
    description: 'Employee email or CNIC already exists.',
  })
  create(@Body() dto: CreateEmployeeDto, @Req() req: { user: { id: string } }) {
    return this.employeeService.create(dto, req.user.id);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({
    summary: 'Get all employees',
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
    description: 'Employees fetched successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view employees.',
  })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.employeeService.findAll(page, limit);
  }

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get employee by ID', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'Employee fetched successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view an employee.',
  })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update an employee', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: 200, description: 'Employee updated successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can update an employee.',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee, Role, or Branch not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Employee email or CNIC already exists.',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.employeeService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete an employee', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can delete an employee.',
  })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.employeeService.remove(id, req.user.id);
  }
}

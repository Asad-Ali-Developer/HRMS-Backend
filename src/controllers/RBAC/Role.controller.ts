import {
  Req,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiTags,
  ApiParam,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../../decorators';
import { RoleService } from '../../services';
import { JwtAuthGuard, RolesGuard } from '../../guards';
import { CreateRoleDto, UpdateRoleDto } from '../../DTOs';

@ApiTags('Role')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a role', description: 'Admin only.' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can create a role.',
  })
  @ApiResponse({ status: 409, description: 'Role already exists.' })
  create(@Body() dto: CreateRoleDto, @Req() req: { user: { id: string } }) {
    return this.roleService.create(dto, req.user.id);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all roles', description: 'Admin only.' })
  @ApiResponse({ status: 200, description: 'Roles fetched successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view roles.',
  })
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get role by ID', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiResponse({ status: 200, description: 'Role fetched successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view a role.',
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update a role', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Role updated successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can update a role.',
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.roleService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete a role', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can delete a role.',
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.roleService.remove(id, req.user.id);
  }

  @Get(':roleId/permission-matrix')
  // @Roles('Admin')
  @ApiOperation({
    summary: 'Get role permission matrix',
    description: 'Admin only.',
  })
  @ApiParam({ name: 'roleId', description: 'Role UUID' })
  @ApiResponse({
    status: 200,
    description: 'Permission matrix fetched successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view the permission matrix.',
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  getPermissionMatrix(@Param('roleId') roleId: string) {
    return this.roleService.getPermissionMatrix(roleId);
  }
}

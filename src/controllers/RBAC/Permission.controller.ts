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
import { PermissionService } from '../../services';
import { JwtAuthGuard, RolesGuard } from '../../guards';
import {
  CreateRolePermissionDto,
  UpdateRolePermissionDto,
} from '../../DTOs/RBAC/RolePermissions.dto';

@ApiTags('Permission')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({
    summary: 'Create a role permission',
    description: 'Admin only.',
  })
  @ApiBody({ type: CreateRolePermissionDto })
  @ApiResponse({ status: 201, description: 'Permission created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can create a permission.',
  })
  @ApiResponse({ status: 409, description: 'Permission already exists.' })
  create(
    @Body()
    dto: CreateRolePermissionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.permissionService.create(dto, req.user.id);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions fetched successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view permissions.',
  })
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Get permission by ID',
    description: 'Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Permission UUID' })
  @ApiResponse({
    status: 200,
    description: 'Permission fetched successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view a permission.',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Update a role permission',
    description: 'Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Permission UUID' })
  @ApiBody({ type: UpdateRolePermissionDto })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can update a permission.',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  update(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateRolePermissionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.permissionService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Delete a role permission',
    description: 'Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Permission UUID' })
  @ApiResponse({
    status: 200,
    description: 'Permission deleted successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can delete a permission.',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  remove(
    @Param('id')
    id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.permissionService.remove(id, req.user.id);
  }
}

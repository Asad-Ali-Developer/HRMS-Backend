import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { CreateAdminDto } from '../../DTOs';
import { AdminService } from '../../services';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('system')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create-admin')
  @ApiOperation({
    summary: 'Create admin user',
    description:
      'Creates a new admin user. Requires a valid admin secret header.',
  })
  @ApiHeader({
    name: 'x-admin-secret',
    description: 'Secret key to authorize admin creation',
    required: true,
  })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: 'Admin created successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid admin secret.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  createAdmin(
    @Headers('x-admin-secret') secret: string,
    @Body() dto: CreateAdminDto,
  ) {
    return this.adminService.createAdmin(secret, dto);
  }

  @Get('admins')
  @ApiOperation({
    summary: 'Get all admins',
    description: 'Returns a list of all users with the Admin role.',
  })
  @ApiResponse({ status: 200, description: 'Admins fetched successfully.' })
  getAdmins() {
    return this.adminService.getAdmins();
  }

  @Delete('delete-admin/:id')
  @ApiOperation({
    summary: 'Delete an admin',
    description:
      'Deletes an admin user by ID. Requires a valid admin secret header.',
  })
  @ApiHeader({
    name: 'x-admin-secret',
    description: 'Secret key to authorize admin deletion',
    required: true,
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the admin to delete',
    example: 'cm9x1a2b3c4d5e6f7g8h9i0j',
  })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid admin secret.' })
  @ApiResponse({ status: 404, description: 'Admin not found.' })
  deleteAdmin(
    @Headers('x-admin-secret') secret: string,
    @Param('id') id: string,
  ) {
    return this.adminService.deleteAdmin(secret, id);
  }
}

import { Body, Controller, Headers, Post } from '@nestjs/common';
import { CreateAdminDto } from '../../DTOs';
import { AdminService } from '../../services';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('system')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('admins')
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
}

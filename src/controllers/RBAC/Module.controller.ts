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
import { ModuleService } from '../../services';
import { JwtAuthGuard, RolesGuard } from '../../guards';
import { CreateSystemModuleDto, UpdateSystemModuleDto } from '../../DTOs';

@ApiTags('Module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a module', description: 'Admin only.' })
  @ApiBody({ type: CreateSystemModuleDto })
  @ApiResponse({ status: 201, description: 'Module created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can create a module.',
  })
  @ApiResponse({ status: 409, description: 'Module already exists.' })
  create(
    @Body() dto: CreateSystemModuleDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.moduleService.create(dto, req.user.id);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all modules', description: 'Admin only.' })
  @ApiResponse({ status: 200, description: 'Modules fetched successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view modules.',
  })
  findAll() {
    return this.moduleService.findAll();
  }

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get module by ID', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Module UUID' })
  @ApiResponse({ status: 200, description: 'Module fetched successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view a module.',
  })
  @ApiResponse({ status: 404, description: 'Module not found.' })
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update a module', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Module UUID' })
  @ApiBody({ type: UpdateSystemModuleDto })
  @ApiResponse({ status: 200, description: 'Module updated successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can update a module.',
  })
  @ApiResponse({ status: 404, description: 'Module not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSystemModuleDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.moduleService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete a module', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Module UUID' })
  @ApiResponse({ status: 200, description: 'Module deleted successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can delete a module.',
  })
  @ApiResponse({ status: 404, description: 'Module not found.' })
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.moduleService.remove(id, req.user.id);
  }

  @Get('sidebar')
  @ApiOperation({
    summary: 'Get Sidebar Structure',
    description:
      'Fetches all active modules with their nested active submodules. Used for rendering the application sidebar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sidebar structure fetched successfully.',
    schema: {
      example: {
        message: 'Sidebar structure fetched successfully.',
        data: [
          {
            id: 'mod-1',
            name: 'Branch Management',
            description: 'Manage branches',
            isActive: true,
            subModules: [
              {
                id: 'sub-1',
                name: 'View Branches',
                description: 'List all branches',
              },
              {
                id: 'sub-2',
                name: 'Create Branch',
                description: 'Add new branch',
              },
            ],
          },
          {
            id: 'mod-2',
            name: 'User Management',
            description: 'Manage users and roles',
            isActive: true,
            subModules: [],
          },
        ],
      },
    },
  })
  getSidebarStructure() {
    return this.moduleService.getSidebarStructure();
  }
}

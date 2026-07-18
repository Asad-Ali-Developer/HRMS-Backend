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
import { SubModuleService } from '../../services';
import { JwtAuthGuard, RolesGuard } from '../../guards';
import { CreateSubModuleDto, UpdateSubModuleDto } from '../../DTOs';

@ApiTags('Sub-Module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sub-modules')
export class SubModuleController {
  constructor(private readonly subModuleService: SubModuleService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a sub-module', description: 'Admin only.' })
  @ApiBody({ type: CreateSubModuleDto })
  @ApiResponse({ status: 201, description: 'Sub-module created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can create a sub-module.',
  })
  @ApiResponse({ status: 409, description: 'Sub-module already exists.' })
  create(
    @Body() dto: CreateSubModuleDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.subModuleService.create(dto, req.user.id);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all sub-modules', description: 'Admin only.' })
  @ApiResponse({
    status: 200,
    description: 'Sub-modules fetched successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view sub-modules.',
  })
  findAll() {
    return this.subModuleService.findAll();
  }

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Get sub-module by ID',
    description: 'Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Sub-module UUID' })
  @ApiResponse({
    status: 200,
    description: 'Sub-module fetched successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can view a sub-module.',
  })
  @ApiResponse({ status: 404, description: 'Sub-module not found.' })
  findOne(@Param('id') id: string) {
    return this.subModuleService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update a sub-module', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Sub-module UUID' })
  @ApiBody({ type: UpdateSubModuleDto })
  @ApiResponse({
    status: 200,
    description: 'Sub-module updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can update a sub-module.',
  })
  @ApiResponse({ status: 404, description: 'Sub-module not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSubModuleDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.subModuleService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete a sub-module', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Sub-module UUID' })
  @ApiResponse({
    status: 200,
    description: 'Sub-module deleted successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can delete a sub-module.',
  })
  @ApiResponse({ status: 404, description: 'Sub-module not found.' })
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.subModuleService.remove(id, req.user.id);
  }
}

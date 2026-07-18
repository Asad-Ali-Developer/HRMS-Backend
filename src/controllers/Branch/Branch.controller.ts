import {
  Req,
  Get,
  Put,
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
import { BranchService } from '../../services';
import { JwtAuthGuard, RolesGuard } from '../../guards';
import { CreateBranchDto, UpdateBranchDto } from '../../DTOs';

@ApiTags('Branch')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a branch', description: 'Admin only.' })
  @ApiBody({ type: CreateBranchDto })
  @ApiResponse({ status: 201, description: 'Branch created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Branch email already exists.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can create a branch.',
  })
  createBranch(
    @Body() dto: CreateBranchDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.branchService.createBranch(dto, req.user.id);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({
    summary: 'Get all branches',
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
    description: 'Branches fetched successfully.',
    schema: {
      example: {
        message: 'Branches fetched successfully.',
        data: [
          {
            id: 1,
            name: 'Main Branch',
            location: 'New York',
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
            },
            updatedBy: {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
        ],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalCount: 50,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  getAllBranches(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.branchService.getAllBranches(page, limit);
  }

  @Get(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get branch by ID', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Branch fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  getBranchById(@Param('id') id: string) {
    return this.branchService.getBranchById(id);
  }

  @Put(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update a branch', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiBody({ type: UpdateBranchDto })
  @ApiResponse({ status: 200, description: 'Branch updated successfully.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  @ApiResponse({ status: 409, description: 'Branch email already exists.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can update branch.',
  })
  updateBranch(
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.branchService.updateBranch(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete a branch', description: 'Admin only.' })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Branch deleted successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can delete a branch.',
  })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  deleteBranch(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.branchService.deleteBranch(id, req.user.id);
  }

  @Patch(':id/toggle-status')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Toggle branch active status',
    description: 'Admin only. Activates or deactivates a branch.',
  })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({ status: 200, description: 'Branch status toggled.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  @ApiResponse({
    status: 403,
    description: 'Only Admin role can change branch status.',
  })
  toggleBranchStatus(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.branchService.toggleBranchStatus(id, req.user.id);
  }
}

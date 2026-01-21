import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums';
import { ServiceCategoryService } from '../services';
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  ServiceCategoryResponseDto,
  ServiceCategoryListResponseDto,
  ServiceCategoryApiResponseDto,
  ServiceCategoryListApiResponseDto,
} from '../dto';

@ApiTags('Service Categories')
@Controller('service-categories')
export class ServiceCategoryController {
  constructor(private readonly serviceCategoryService: ServiceCategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create a new service category (Admin only)',
    description: 'Create a new service category with optional image upload'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Service category data with optional image',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Hair Care' },
        description: { type: 'string', example: 'Professional hair care services' },
        isActive: { type: 'boolean', example: true },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Category image file (jpg, png, webp, gif)',
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Service category created successfully',
    type: ServiceCategoryApiResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Service category with this name already exists',
  })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createDto: CreateServiceCategoryDto,
    @UploadedFile() file?: any,
  ): Promise<ServiceCategoryApiResponseDto> {
    return this.serviceCategoryService.create(createDto, file);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all service categories' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Service categories retrieved successfully',
    type: ServiceCategoryListApiResponseDto,
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: boolean,
  ): Promise<ServiceCategoryListApiResponseDto> {
    return this.serviceCategoryService.findAll(
      page ? +page : 1,
      limit ? +limit : 10,
      isActive,
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get service category by ID' })
  @ApiParam({ name: 'id', description: 'Service category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service category retrieved successfully',
    type: ServiceCategoryApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service category not found',
  })
  async findOne(@Param('id') id: string): Promise<ServiceCategoryApiResponseDto> {
    return this.serviceCategoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update service category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service category updated successfully',
    type: ServiceCategoryApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Service category with this name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceCategoryDto,
  ): Promise<ServiceCategoryApiResponseDto> {
    return this.serviceCategoryService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Toggle service category active status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service category status toggled successfully',
    type: ServiceCategoryApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service category not found',
  })
  async toggleActive(@Param('id') id: string): Promise<ServiceCategoryApiResponseDto> {
    return this.serviceCategoryService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete service category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service category UUID' })
  @ApiResponse({
    status: 204,
    description: 'Service category deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service category not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete category with associated services',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.serviceCategoryService.remove(id);
  }

}
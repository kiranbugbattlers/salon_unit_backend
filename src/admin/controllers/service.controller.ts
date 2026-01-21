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
import { ServiceService } from '../services';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceResponseDto,
  ServiceListResponseDto,
  ServicesGroupedByCategoryResponseDto,
} from '../dto';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create a new service (Admin only)',
    description: 'Create a new service with optional image upload'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Service data with optional image',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Hair Cut' },
        description: { type: 'string', example: 'Professional hair cutting service' },
        categoryId: { type: 'string', example: 'uuid-category-id' },
        basePrice: { type: 'number', example: 25.00 },
        defaultDuration: { type: 'number', example: 30 },
        availableAtHome: { type: 'boolean', example: true },
        isActive: { type: 'boolean', example: true },
        gender: {
          type: 'string',
          enum: ['male', 'female', 'both'],
          example: 'both',
          description: 'Gender this service is available for'
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Service image file (jpg, png, webp, gif)',
        },
      },
      required: ['name', 'categoryId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service category not found or inactive',
  })
  @ApiResponse({
    status: 409,
    description: 'Service with this name already exists in the category',
  })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createDto: CreateServiceDto,
    @UploadedFile() file?: any,
  ): Promise<ServiceResponseDto> {
    return this.serviceService.create(createDto, file);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all services' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'availableAtHome', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Services retrieved successfully',
    type: ServiceListResponseDto,
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('availableAtHome') availableAtHome?: boolean,
  ): Promise<ServiceListResponseDto> {
    return this.serviceService.findAll(
      page ? +page : 1,
      limit ? +limit : 10,
      categoryId,
      isActive,
      availableAtHome,
    );
  }

  @Get('grouped-by-category')
  @Public()
  @ApiOperation({ summary: 'Get services grouped by categories' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'availableAtHome', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Services grouped by categories retrieved successfully',
    type: ServicesGroupedByCategoryResponseDto,
  })
  async findServicesGroupedByCategory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: boolean,
    @Query('availableAtHome') availableAtHome?: boolean,
  ): Promise<ServicesGroupedByCategoryResponseDto> {
    return this.serviceService.findServicesGroupedByCategory(
      page ? +page : 1,
      limit ? +limit : 10,
      isActive,
      availableAtHome,
    );
  }

  @Get('by-category/:categoryId')
  @Public()
  @ApiOperation({ summary: 'Get services by category ID' })
  @ApiParam({ name: 'categoryId', description: 'Service category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Services retrieved successfully',
    type: [ServiceResponseDto],
  })
  async findByCategory(@Param('categoryId') categoryId: string): Promise<ServiceResponseDto[]> {
    return this.serviceService.findByCategory(categoryId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service retrieved successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  async findOne(@Param('id') id: string): Promise<ServiceResponseDto> {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update service (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Service with this name already exists in the category',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.serviceService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Toggle service active status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service status toggled successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  async toggleActive(@Param('id') id: string): Promise<ServiceResponseDto> {
    return this.serviceService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete service (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({
    status: 204,
    description: 'Service deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete service with staff assignments',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.serviceService.remove(id);
  }

}
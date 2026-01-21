import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { BrowseService } from './browse.service';
import {
  ServicePackageListResponseDto,
  ServicePackageResponseWrapperDto,
} from '../business-owner/dto';

@ApiTags('Public Browse')
@Controller('browse')
export class BrowseController {
  constructor(private browseService: BrowseService) {}

  @Get('service-packages')
  @Public()
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Browse service packages (Public)',
    description: 'Browse all active service packages for a business using shop ID. No authentication required. 🔓 Click the lock icon to add JWT token for enhanced features.',
  })
  @ApiQuery({
    name: 'shopId',
    required: true,
    type: String,
    example: 'SH-123456',
    description: 'Shop ID of the business'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of packages per page'
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    example: true,
    description: 'Filter by active status (defaults to true for public access)'
  })
  @ApiResponse({
    status: 200,
    description: 'Service packages retrieved successfully',
    type: ServicePackageListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  async browseServicePackages(
    @Query('shopId') shopId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: boolean,
  ): Promise<ServicePackageListResponseDto> {
    return this.browseService.browseServicePackages(
      shopId,
      page ? +page : 1,
      limit ? +limit : 10,
      isActive !== undefined ? isActive : true,
    );
  }

  @Get('service-packages/:id')
  @Public()
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Browse service package by ID (Public)',
    description: 'Browse a specific active service package with all its services and pricing details. No authentication required. 🔓 Click the lock icon to add JWT token for enhanced features.',
  })
  @ApiParam({
    name: 'id',
    description: 'Service package UUID'
  })
  @ApiQuery({
    name: 'shopId',
    required: true,
    type: String,
    example: 'SH-123456',
    description: 'Shop ID of the business'
  })
  @ApiResponse({
    status: 200,
    description: 'Service package retrieved successfully',
    type: ServicePackageResponseWrapperDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service package not found or business not found',
  })
  async browseServicePackageById(
    @Param('id') packageId: string,
    @Query('shopId') shopId: string,
  ): Promise<ServicePackageResponseWrapperDto> {
    const packageData = await this.browseService.browseServicePackageById(shopId, packageId);
    return new ServicePackageResponseWrapperDto(
      200,
      true,
      'Service package retrieved successfully',
      packageData
    );
  }
}
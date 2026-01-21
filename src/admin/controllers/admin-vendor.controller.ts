import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { BusinessOwner } from '../../database/entities';
import { UpdateVendorStatusDto } from '../dto/update-vendor-status.dto';
import { AddVendorCreditDto, VendorCreditStatusDto } from '../dto/vendor-credit-management.dto';
import { VendorCreditManagementService } from '../services/vendor-credit-management.service';

@ApiTags('Admin - Vendor Management')
@Controller('admin/vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class AdminVendorController {
  constructor(
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    private readonly vendorCreditManagementService: VendorCreditManagementService,
  ) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search vendors by name, shop ID, or business owner ID',
    description: 'Search for vendors using name, shop ID, or business owner ID with pagination support.',
  })
  @ApiQuery({ name: 'query', description: 'Search term (business name, shop ID, or business owner ID)', required: true })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Vendors retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid search query' })
  async searchVendors(
    @Query('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query is required');
    }

    const searchTerm = query.trim();
    const skip = (page - 1) * limit;

    // Check if query is a UUID (business owner ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm);

    let whereConditions: any;
    
    if (isUUID) {
      // Search by exact business owner ID
      whereConditions = { id: searchTerm };
    } else {
      // Search by business name, shop ID, first name, or last name
      whereConditions = [
        { businessName: Like(`%${searchTerm}%`) },
        { shopId: Like(`%${searchTerm}%`) },
        { firstName: Like(`%${searchTerm}%`) },
        { lastName: Like(`%${searchTerm}%`) },
      ];
    }

    const [vendors, total] = await this.businessOwnerRepository.findAndCount({
      where: whereConditions,
      relations: ['user'],
      select: {
        id: true,
        shopId: true,
        businessName: true,
        firstName: true,
        lastName: true,
        isApproved: true,
        isActive: true,
        isDefaulter: true,
        vendorStatus: true,
        createdAt: true,
        user: {
          id: true,
          phone: true,
          email: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const enrichedVendors = vendors.map(vendor => ({
      id: vendor.id,
      shopId: vendor.shopId,
      businessName: vendor.businessName || 'N/A',
      ownerName: vendor.firstName && vendor.lastName
        ? `${vendor.firstName} ${vendor.lastName}`.trim()
        : vendor.businessName || 'N/A',
      phone: vendor.user?.phone || 'N/A',
      email: vendor.user?.email || 'N/A',
      vendorStatus: vendor.vendorStatus,
      isApproved: vendor.isApproved,
      isActive: vendor.isActive,
      isDefaulter: vendor.isDefaulter,
      createdAt: vendor.createdAt,
    }));

    return {
      code: 200,
      success: true,
      message: 'Vendors retrieved successfully',
      data: {
        vendors: enrichedVendors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  @Put(':businessOwnerId/status')
  @ApiOperation({
    summary: 'Update vendor account status',
    description: 'Allow admins to manually change vendor account status (hold/unhold)',
  })
  @ApiParam({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' })
  @ApiBody({ type: UpdateVendorStatusDto })
  @ApiResponse({ status: 200, description: 'Vendor status updated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async updateVendorStatus(
    @Param('businessOwnerId', ParseUUIDPipe) businessOwnerId: string,
    @Body() updateDto: UpdateVendorStatusDto,
  ): Promise<any> {
    const vendor = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['user'],
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const previousStatus = vendor.vendorStatus;
    vendor.vendorStatus = updateDto.vendorStatus;

    const updatedVendor = await this.businessOwnerRepository.save(vendor);

    return {
      code: 200,
      success: true,
      message: `Vendor status updated from ${previousStatus} to ${updateDto.vendorStatus}`,
      data: {
        id: updatedVendor.id,
        shopId: updatedVendor.shopId,
        businessName: updatedVendor.businessName,
        ownerName: updatedVendor.firstName && updatedVendor.lastName
          ? `${updatedVendor.firstName} ${updatedVendor.lastName}`.trim()
          : updatedVendor.businessName || 'N/A',
        phone: vendor.user?.phone || 'N/A',
        previousStatus,
        currentStatus: updatedVendor.vendorStatus,
        updatedAt: updatedVendor.updatedAt,
      },
    };
  }

  @Post(':businessOwnerId/credit')
  @ApiOperation({
    summary: 'Add credit points and activate vendor account',
    description: 'Add credit points to approved vendor and automatically activate their account',
  })
  @ApiParam({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' })
  @ApiBody({ type: AddVendorCreditDto })
  @ApiResponse({ status: 200, description: 'Credit points added and account activated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @ApiResponse({ status: 400, description: 'Vendor must be approved to add credit points' })
  async addVendorCredit(
    @Param('businessOwnerId', ParseUUIDPipe) businessOwnerId: string,
    @Body() addCreditDto: AddVendorCreditDto,
  ): Promise<any> {
    const result = await this.vendorCreditManagementService.addCreditToVendor(businessOwnerId, addCreditDto);

    return {
      code: 200,
      success: true,
      message: `Successfully added ${addCreditDto.creditPoints} credit points and activated vendor account`,
      data: result,
    };
  }

  @Get(':businessOwnerId/credit')
  @ApiOperation({
    summary: 'Get vendor credit information and status',
    description: 'Get credit limit, approval status, and account status for a specific vendor',
  })
  @ApiParam({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Vendor credit information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async getVendorCreditInfo(
    @Param('businessOwnerId', ParseUUIDPipe) businessOwnerId: string,
  ): Promise<any> {
    const result = await this.vendorCreditManagementService.getVendorCreditInfo(businessOwnerId);

    return {
      code: 200,
      success: true,
      message: 'Vendor credit information retrieved successfully',
      data: result,
    };
  }

  @Put(':businessOwnerId/credit-status')
  @ApiOperation({
    summary: 'Update vendor credit status',
    description: 'Manually update vendor credit status (active, overdue, suspended)',
  })
  @ApiParam({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' })
  @ApiBody({ type: VendorCreditStatusDto })
  @ApiResponse({ status: 200, description: 'Vendor credit status updated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async updateVendorCreditStatus(
    @Param('businessOwnerId', ParseUUIDPipe) businessOwnerId: string,
    @Body() statusDto: VendorCreditStatusDto,
  ): Promise<any> {
    const result = await this.vendorCreditManagementService.updateVendorCreditStatus(businessOwnerId, statusDto);

    return {
      code: 200,
      success: true,
      message: `Vendor credit status updated to ${statusDto.status}`,
      data: result,
    };
  }

  @Post('check-overdue')
  @ApiOperation({
    summary: 'Check and mark overdue vendors',
    description: 'Find vendors with 0 or negative credit and mark them as overdue',
  })
  @ApiResponse({ status: 200, description: 'Overdue vendors processed successfully' })
  async checkOverdueVendors(): Promise<any> {
    const result = await this.vendorCreditManagementService.checkAndUpdateOverdueVendors();

    return {
      code: 200,
      success: true,
      message: `Processed ${result.totalOverdue} overdue vendors`,
      data: result,
    };
  }

  @Get('credit-status/all')
  @ApiOperation({
    summary: 'Get all vendors credit status',
    description: 'Get credit status for all vendors with overdue indicators',
  })
  @ApiResponse({ status: 200, description: 'All vendors credit status retrieved successfully' })
  async getAllVendorsCreditStatus(): Promise<any> {
    const vendors = await this.vendorCreditManagementService.getAllVendorsCreditStatus();

    return {
      code: 200,
      success: true,
      message: 'All vendors credit status retrieved successfully',
      data: {
        vendors,
        total: vendors.length,
        overdueCount: vendors.filter(v => v.isOverdue).length,
        activeCount: vendors.filter(v => v.creditStatus === 'active').length,
        suspendedCount: vendors.filter(v => v.creditStatus === 'suspended').length,
      },
    };
  }
}

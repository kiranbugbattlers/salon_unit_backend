import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
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
import { VendorStatusService } from '../services/vendor-status.service';
import { VendorStatus } from '../../common/enums/vendor-status.enum';
import { UpdateVendorStatusDto } from '../dto/update-vendor-status.dto';

@ApiTags('Admin - Vendor Status')
@Controller('admin/vendor-status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class VendorStatusController {
  constructor(private readonly vendorStatusService: VendorStatusService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get vendor status statistics' })
  @ApiResponse({ status: 200, description: 'Vendor status statistics retrieved successfully' })
  async getVendorStatusStats(): Promise<any> {
    const stats = await this.vendorStatusService.getVendorStatusStats();
    
    return {
      code: 200,
      success: true,
      message: 'Vendor status statistics retrieved successfully',
      data: stats,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all business owners with their vendor status' })
  @ApiQuery({ name: 'status', enum: ['active', 'inactive', 'suspended'], required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Business owners retrieved successfully' })
  async getBusinessOwnersByVendorStatus(
    @Query('status') status?: VendorStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    // This would need to be implemented in the service
    // For now, return a placeholder response
    return {
      code: 200,
      success: true,
      message: 'Business owners retrieved successfully',
      data: {
        businessOwners: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      },
    };
  }

  @Put(':businessOwnerId/status')
  @ApiOperation({ summary: 'Update vendor status (Admin only)' })
  @ApiParam({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' })
  @ApiBody({
    description: 'Vendor status update data',
    type: UpdateVendorStatusDto,
  })
  @ApiResponse({ status: 200, description: 'Vendor status updated successfully' })
  @ApiResponse({ status: 404, description: 'Business owner not found' })
  @ApiResponse({ status: 400, description: 'Invalid status value' })
  async updateVendorStatus(
    @Param('businessOwnerId') businessOwnerId: string,
    @Body() updateDto: UpdateVendorStatusDto,
  ): Promise<any> {
    try {
      const result = await this.vendorStatusService.manuallyUpdateVendorStatus(
        businessOwnerId,
        updateDto.vendorStatus,
        updateDto.remarks,
      );

      return {
        code: 200,
        success: true,
        message: `Vendor status updated to ${updateDto.vendorStatus} successfully`,
        data: {
          businessOwnerId: result.businessOwner.id,
          businessName: result.businessOwner.businessName,
          oldStatus: result.oldStatus,
          newStatus: result.newStatus,
          remarks: updateDto.remarks,
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      if (error.message === 'Business owner not found') {
        throw new NotFoundException('Business owner not found');
      }
      throw error;
    }
  }
}

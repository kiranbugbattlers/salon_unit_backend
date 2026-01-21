import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { StaffServiceManagementService } from '../services/staff-service-management.service';
import {
  AssignServiceDto,
  UpdateStaffServiceDto,
  StaffServiceResponseDto,
  StaffServiceListResponseDto,
} from '../dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Staff Service Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUSINESS_OWNER)
@Controller('staff/:staffId/services')
export class StaffServiceManagementController {
  constructor(
    private readonly staffServiceManagementService: StaffServiceManagementService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Assign a service to staff member' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiResponse({
    status: 201,
    description: 'Service assigned successfully',
    type: StaffServiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff or service not found' })
  @ApiResponse({ status: 409, description: 'Service already assigned' })
  async assignService(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Body() assignServiceDto: AssignServiceDto,
  ): Promise<StaffServiceResponseDto> {
    return this.staffServiceManagementService.assignService(
      req.user.userId,
      staffId,
      assignServiceDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all services assigned to staff member' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff services retrieved successfully',
    type: StaffServiceListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  async getStaffServices(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
  ): Promise<StaffServiceListResponseDto> {
    return this.staffServiceManagementService.getStaffServices(req.user.userId, staffId);
  }

  @Patch(':serviceId')
  @ApiOperation({ summary: 'Update staff service assignment' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff service updated successfully',
    type: StaffServiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff or service assignment not found' })
  async updateStaffService(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Body() updateStaffServiceDto: UpdateStaffServiceDto,
  ): Promise<StaffServiceResponseDto> {
    return this.staffServiceManagementService.updateStaffService(
      req.user.userId,
      staffId,
      serviceId,
      updateStaffServiceDto,
    );
  }

  @Delete(':serviceId')
  @ApiOperation({ summary: 'Remove service from staff member' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({ status: 204, description: 'Service removed successfully' })
  @ApiResponse({ status: 404, description: 'Staff or service assignment not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeStaffService(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
  ): Promise<void> {
    return this.staffServiceManagementService.removeStaffService(
      req.user.userId,
      staffId,
      serviceId,
    );
  }
}
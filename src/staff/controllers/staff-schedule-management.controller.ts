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
  ApiExcludeController,
} from '@nestjs/swagger';
import { StaffScheduleManagementService } from '../services/staff-schedule-management.service';
import {
  CreateScheduleOverrideDto,
  UpdateScheduleOverrideDto,
  ScheduleOverrideResponseDto,
  ScheduleOverrideListResponseDto,
  CreateStaffBreakDto,
  UpdateStaffBreakDto,
  StaffBreakResponseDto,
  StaffBreakListResponseDto,
} from '../dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiExcludeController()
@ApiTags('Staff Schedule Management')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUSINESS_OWNER)
@Controller('staff/:staffId/schedule')
export class StaffScheduleManagementController {
  constructor(
    private readonly staffScheduleService: StaffScheduleManagementService,
  ) {}

  @Post('override')
  @ApiOperation({ summary: 'Create schedule override for staff member' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiResponse({
    status: 201,
    description: 'Schedule override created successfully',
    type: ScheduleOverrideResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  @ApiResponse({ status: 409, description: 'Override already exists for this date' })
  async createScheduleOverride(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Body() createOverrideDto: CreateScheduleOverrideDto,
  ): Promise<ScheduleOverrideResponseDto> {
    return this.staffScheduleService.createScheduleOverride(
      req.user.userId,
      staffId,
      createOverrideDto,
    );
  }

  @Get('override')
  @ApiOperation({ summary: 'Get all schedule overrides for staff member' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule overrides retrieved successfully',
    type: ScheduleOverrideListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  async getScheduleOverrides(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
  ): Promise<ScheduleOverrideListResponseDto> {
    return this.staffScheduleService.getScheduleOverrides(req.user.userId, staffId);
  }

  @Patch('override/:overrideId')
  @ApiOperation({ summary: 'Update schedule override' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiParam({ name: 'overrideId', description: 'Override ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule override updated successfully',
    type: ScheduleOverrideResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff or override not found' })
  async updateScheduleOverride(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Param('overrideId', ParseUUIDPipe) overrideId: string,
    @Body() updateOverrideDto: UpdateScheduleOverrideDto,
  ): Promise<ScheduleOverrideResponseDto> {
    return this.staffScheduleService.updateScheduleOverride(
      req.user.userId,
      staffId,
      overrideId,
      updateOverrideDto,
    );
  }

  @Delete('override/:overrideId')
  @ApiOperation({ summary: 'Delete schedule override' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiParam({ name: 'overrideId', description: 'Override ID' })
  @ApiResponse({ status: 204, description: 'Schedule override deleted successfully' })
  @ApiResponse({ status: 404, description: 'Staff or override not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteScheduleOverride(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Param('overrideId', ParseUUIDPipe) overrideId: string,
  ): Promise<void> {
    return this.staffScheduleService.deleteScheduleOverride(
      req.user.userId,
      staffId,
      overrideId,
    );
  }

  @Post('breaks')
  @ApiOperation({ summary: 'Create break schedule for staff member' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiResponse({
    status: 201,
    description: 'Staff break created successfully',
    type: StaffBreakResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  async createStaffBreak(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Body() createBreakDto: CreateStaffBreakDto,
  ): Promise<StaffBreakResponseDto> {
    return this.staffScheduleService.createStaffBreak(
      req.user.userId,
      staffId,
      createBreakDto,
    );
  }

  @Get('breaks')
  @ApiOperation({ summary: 'Get all break schedules for staff member' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff breaks retrieved successfully',
    type: StaffBreakListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  async getStaffBreaks(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
  ): Promise<StaffBreakListResponseDto> {
    return this.staffScheduleService.getStaffBreaks(req.user.userId, staffId);
  }

  @Patch('breaks/:breakId')
  @ApiOperation({ summary: 'Update staff break schedule' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiParam({ name: 'breakId', description: 'Break ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff break updated successfully',
    type: StaffBreakResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff or break not found' })
  async updateStaffBreak(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Param('breakId', ParseUUIDPipe) breakId: string,
    @Body() updateBreakDto: UpdateStaffBreakDto,
  ): Promise<StaffBreakResponseDto> {
    return this.staffScheduleService.updateStaffBreak(
      req.user.userId,
      staffId,
      breakId,
      updateBreakDto,
    );
  }

  @Delete('breaks/:breakId')
  @ApiOperation({ summary: 'Delete staff break schedule' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiParam({ name: 'breakId', description: 'Break ID' })
  @ApiResponse({ status: 204, description: 'Staff break deleted successfully' })
  @ApiResponse({ status: 404, description: 'Staff or break not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStaffBreak(
    @Req() req: any,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Param('breakId', ParseUUIDPipe) breakId: string,
  ): Promise<void> {
    return this.staffScheduleService.deleteStaffBreak(req.user.userId, staffId, breakId);
  }
}
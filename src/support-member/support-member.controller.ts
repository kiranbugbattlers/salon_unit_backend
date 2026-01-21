import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SupportMemberService } from './support-member.service';
import { AssignmentService } from './assignment.service';
import { CreateSupportMemberDto } from './dto/create-support-member.dto';
import { UpdateSupportMemberDto } from './dto/update-support-member.dto';
import { SupportMemberQueryDto } from './dto/support-member-query.dto';
import { AssignCustomerDto, ReassignCustomerDto } from './dto/assign-customer.dto';
import { AdminOnly } from '../common/decorators/admin-only.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@ApiTags('Support Management System')
@Controller('support-members')
export class SupportMemberController {
  constructor(
    private readonly supportMemberService: SupportMemberService,
    private readonly assignmentService: AssignmentService,
  ) {}

  // ============================================
  // ADMIN ENDPOINTS (7)
  // ============================================

  @Post()
  @AdminOnly()
  @ApiOperation({ summary: 'Create new support member (Admin only)' })
  @ApiResponse({ status: 201, description: 'Support member created successfully' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(
    @Body() createDto: CreateSupportMemberDto,
    @Request() req: any,
  ) {
    const adminId = req.admin?.id || req.user?.sub;
    return await this.supportMemberService.create(createDto, adminId);
  }

  @Get()
  @AdminOnly()
  @ApiOperation({ summary: 'Get all support members with filters (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of support members' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async findAll(@Query() queryDto: SupportMemberQueryDto) {
    return await this.supportMemberService.findAll(queryDto);
  }

  @Get('analytics')
  @AdminOnly()
  @ApiOperation({ summary: 'Get support team analytics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns analytics and statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAnalytics() {
    return await this.supportMemberService.getAnalytics();
  }

  @Get(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Get support member by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns support member details with assigned customers' })
  @ApiResponse({ status: 404, description: 'Support member not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async findOne(@Param('id') id: string) {
    return await this.supportMemberService.findOne(id);
  }

  @Patch(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update support member (Admin only)' })
  @ApiResponse({ status: 200, description: 'Support member updated successfully' })
  @ApiResponse({ status: 404, description: 'Support member not found' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSupportMemberDto,
  ) {
    return await this.supportMemberService.update(id, updateDto);
  }

  @Delete(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Delete support member (Admin only)' })
  @ApiResponse({ status: 200, description: 'Support member deleted successfully, customers reassigned' })
  @ApiResponse({ status: 404, description: 'Support member not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async remove(@Param('id') id: string) {
    await this.supportMemberService.remove(id);
    return { message: 'Support member deleted successfully, customers have been reassigned' };
  }

  @Patch(':id/toggle-active')
  @AdminOnly()
  @ApiOperation({ summary: 'Toggle support member active status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Support member not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async toggleActive(@Param('id') id: string) {
    return await this.supportMemberService.toggleActive(id);
  }

  // ============================================
  // BONUS ADMIN ENDPOINTS (Optional but useful)
  // ============================================

  @Post(':id/upload-profile-pic')
  @AdminOnly()
  @UseInterceptors(FileInterceptor('profilePic'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload support member profile picture (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['profilePic'],
      properties: {
        profilePic: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Profile picture uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Support member not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async uploadProfilePic(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Profile picture file is required');
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image format. Allowed: JPG, PNG, WEBP');
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File too large. Max size: 5MB');
    }

    return await this.supportMemberService.uploadProfilePic(id, file);
  }

  @Post('assign-customer')
  @AdminOnly()
  @ApiOperation({ summary: 'Manually assign customer to support member (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customer assigned successfully' })
  @ApiResponse({ status: 404, description: 'Customer or support member not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async assignCustomer(@Body() assignDto: AssignCustomerDto) {
    return await this.assignmentService.manualAssignCustomer(
      assignDto.customerId,
      assignDto.supportMemberId || null,
      assignDto.notes,
    );
  }

  @Post('reassign-customer')
  @AdminOnly()
  @ApiOperation({ summary: 'Reassign customer to different support member (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customer reassigned successfully' })
  @ApiResponse({ status: 404, description: 'Customer or support member not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async reassignCustomer(@Body() reassignDto: ReassignCustomerDto) {
    // If no new member specified, auto-assign
    if (!reassignDto.newSupportMemberId) {
      return await this.assignmentService.autoAssignCustomer(reassignDto.customerId);
    }

    return await this.assignmentService.manualAssignCustomer(
      reassignDto.customerId,
      reassignDto.newSupportMemberId,
      reassignDto.notes,
    );
  }

  @Post('rebalance')
  @AdminOnly()
  @ApiOperation({ summary: 'Rebalance customer assignments across all members (Admin only)' })
  @ApiResponse({ status: 200, description: 'Rebalancing completed' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async rebalanceAssignments() {
    return await this.assignmentService.rebalanceAssignments();
  }

  @Post('recalculate-counts')
  @AdminOnly()
  @ApiOperation({ summary: 'Recalculate customer counts for all members (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customer counts recalculated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async recalculateCounts() {
    return await this.assignmentService.recalculateAllCustomerCounts();
  }
}

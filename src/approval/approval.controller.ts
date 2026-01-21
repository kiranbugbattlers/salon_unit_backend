import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseEnumPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ApprovalService } from './approval.service';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole, ApprovalStatus } from '../common/enums';
import { BusinessOwner } from '../database/entities';
import {
  ApprovalRequestDto,
  ApproveBusinessDto,
  RejectBusinessDto,
  ApprovalListResponseDto,
  BusinessApprovalStatusDto,
  SendApprovalRequestResponseDto,
} from './dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Business Approval')
@Controller('approval')
@ApiBearerAuth('JWT')
export class ApprovalController {
  constructor(
    private approvalService: ApprovalService,
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
  ) {}

  // Agent Endpoints

  @Get('agent/requests')
  @Roles(UserRole.AGENT)
  @ApiOperation({
    summary: 'Get approval requests for agent',
    description: 'Retrieves all approval requests assigned to the authenticated agent',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, enum: ApprovalStatus, description: 'Filter by status' })
  @ApiResponse({
    status: 200,
    description: 'Approval requests retrieved successfully',
    type: ApprovalListResponseDto,
  })
  async getAgentApprovalRequests(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ApprovalStatus,
  ): Promise<ApprovalListResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    return this.approvalService.getAgentApprovalRequests(
      req.user.agentId,
      pageNum,
      limitNum,
      status,
    );
  }

  @Get('agent/requests/:id')
  @Roles(UserRole.AGENT)
  @ApiOperation({
    summary: 'Get approval request details',
    description: 'Get detailed information about a specific approval request',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval request details retrieved successfully',
    type: ApprovalRequestDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Approval request not found or not assigned to agent',
  })
  async getApprovalRequest(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApprovalRequestDto> {
    return this.approvalService.getApprovalRequest(id);
  }

  @Post('agent/requests/:id/approve')
  @Roles(UserRole.AGENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a business',
    description: 'Approve a business registration request. This will mark the business as approved and allow it to operate on the platform.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business approved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Approval already processed or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Approval request not found or not assigned to agent',
  })
  async approveBusiness(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveDto: ApproveBusinessDto,
    @Req() req,
  ): Promise<ApiResponseDto<null>> {
    return this.approvalService.approveBusiness(id, req.user.agentId, approveDto);
  }

  @Post('agent/requests/:id/reject')
  @Roles(UserRole.AGENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a business',
    description: 'Reject a business registration request with a reason. The business will not be approved to operate on the platform.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business rejected successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Approval already processed or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Approval request not found or not assigned to agent',
  })
  async rejectBusiness(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectDto: RejectBusinessDto,
    @Req() req,
  ): Promise<ApiResponseDto<null>> {
    return this.approvalService.rejectBusiness(id, req.user.agentId, rejectDto);
  }

  // Business Owner Endpoints

  @Get('business/status')
  @Roles(UserRole.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get business approval status',
    description: 'Get the current approval status for the authenticated business owner',
  })
  @ApiResponse({
    status: 200,
    description: 'Business approval status retrieved successfully',
    type: BusinessApprovalStatusDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  async getBusinessApprovalStatus(@Req() req): Promise<BusinessApprovalStatusDto> {
    // Find business owner from user ID first
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId: req.user.userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business not found');
    }

    return this.approvalService.getBusinessApprovalStatus(businessOwner.id);
  }

  // General Endpoints

  @Post('send-request/:businessOwnerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS_OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send approval request to nearest agent',
    description: 'Creates an approval request and assigns it to the nearest available agent. If no agents are available, returns admin info for manual processing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval request sent successfully',
    type: SendApprovalRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing business address or approval already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Approval request already exists for this business',
  })
  async sendApprovalRequest(
    @Param('businessOwnerId', ParseUUIDPipe) businessOwnerId: string,
  ): Promise<SendApprovalRequestResponseDto> {
    return this.approvalService.sendApprovalRequestWithResponse(businessOwnerId);
  }

  // Admin Endpoints

  @Get('admin/pending-businesses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get all pending business approvals (Admin only)',
    description: 'Retrieves all business approval requests that are pending admin review',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({
    status: 200,
    description: 'Pending business approvals retrieved successfully',
    type: ApprovalListResponseDto,
  })
  async getPendingBusinessApprovals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ApprovalListResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.approvalService.getAdminPendingApprovals(pageNum, limitNum);
  }

  @Get('admin/all-businesses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get all business approvals (Admin only)',
    description: 'Retrieves all business approval requests with optional status filter',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, enum: ApprovalStatus, description: 'Filter by approval status' })
  @ApiResponse({
    status: 200,
    description: 'Business approvals retrieved successfully',
    type: ApprovalListResponseDto,
  })
  async getAllBusinessApprovals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ApprovalStatus,
  ): Promise<ApprovalListResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.approvalService.getAdminAllApprovals(pageNum, limitNum, status);
  }

  @Post('admin/approve/:businessOwnerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a business (Admin only)',
    description: 'Approve a business registration request. This will mark the business as approved and allow it to operate on the platform.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business approved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Business already approved or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  async adminApproveBusiness(
    @Param('businessOwnerId', ParseUUIDPipe) businessOwnerId: string,
    @Body() approveDto: ApproveBusinessDto,
    @Req() req,
  ): Promise<ApiResponseDto<null>> {
    return this.approvalService.adminApproveBusiness(businessOwnerId, req.user.sub, approveDto);
  }

  @Post('admin/reject/:businessOwnerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a business (Admin only)',
    description: 'Reject a business registration request with a reason. The business will not be approved to operate on the platform.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business rejected successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Business already processed or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  async adminRejectBusiness(
    @Param('businessOwnerId', ParseUUIDPipe) businessOwnerId: string,
    @Body() rejectDto: RejectBusinessDto,
    @Req() req,
  ): Promise<ApiResponseDto<null>> {
    return this.approvalService.adminRejectBusiness(businessOwnerId, req.user.sub, rejectDto);
  }

  // Comprehensive Business Approval Details Endpoints

  @Get('admin/businesses/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get all businesses with comprehensive details (Admin only)',
    description: 'Retrieves all businesses with media, info, owner info, documents, bank details, and reviews',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, enum: ApprovalStatus, description: 'Filter by approval status' })
  @ApiResponse({
    status: 200,
    description: 'Businesses with comprehensive details retrieved successfully',
  })
  async getAllBusinessesWithDetails(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ApprovalStatus,
  ): Promise<any> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.approvalService.getAllBusinessesWithDetails(pageNum, limitNum, status);
  }

  @Get('admin/businesses/:businessOwnerId/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get business by ID with comprehensive details (Admin only)',
    description: 'Retrieves a specific business with media, info, owner info, documents, bank details, and reviews',
  })
  @ApiResponse({
    status: 200,
    description: 'Business with comprehensive details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  async getBusinessByIdWithDetails(
    @Param('businessOwnerId', ParseUUIDPipe) businessOwnerId: string,
  ): Promise<any> {
    return this.approvalService.getBusinessByIdWithDetails(businessOwnerId);
  }

  @Put('admin/businesses/:businessOwnerId/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update business approval details (Admin only)',
    description: 'Updates business details including media, info, owner info, documents, bank details. Email and mobile number cannot be changed.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business approval details updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or trying to change restricted fields',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  async updateBusinessApprovalDetails(
    @Param('businessOwnerId', ParseUUIDPipe) businessOwnerId: string,
    @Body() updateDto: any,
    @Req() req,
  ): Promise<any> {
    return this.approvalService.updateBusinessApproval(businessOwnerId, updateDto, req.user.sub);
  }

  // Approved Business Owners Endpoints

  @Get('admin/approved-business-owners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get all approved business owners (Admin only)',
    description: 'Retrieves all approved business owners with their details',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({
    status: 200,
    description: 'Approved business owners retrieved successfully',
  })
  async getApprovedBusinessOwners(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.approvalService.getApprovedBusinessOwners(pageNum, limitNum);
  }

  @Get('admin/approved-business-owners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get approved business owner by ID (Admin only)',
    description: 'Retrieves a specific approved business owner with their details',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved business owner retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async getApprovedBusinessOwnerById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<any> {
    return this.approvalService.getApprovedBusinessOwnerById(id);
  }

}
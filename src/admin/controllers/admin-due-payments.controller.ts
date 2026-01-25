import {
  Controller,
  Get,
  Post,
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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { VendorDuePayment, DuePaymentStatus, BusinessOwner } from '../../database/entities';
import { VendorStatusService } from '../services/vendor-status.service';
import { Logger } from '@nestjs/common';

@ApiTags('Admin - Due Payments')
@Controller('admin/due-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class AdminDuePaymentsController {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(VendorDuePayment)
    private readonly vendorDuePaymentRepository: Repository<VendorDuePayment>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    private readonly vendorStatusService: VendorStatusService,
  ) {
    this.logger = new Logger(AdminDuePaymentsController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all due payments with filtering options',
    description: 'Retrieve all vendor due payments with comprehensive filtering and pagination.',
  })
  @ApiQuery({ name: 'status', enum: ['pending', 'overdue', 'paid', 'partially_paid'], required: false })
  @ApiQuery({ name: 'businessOwnerId', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', enum: ['dueDate', 'dueAmount', 'createdAt'], required: false })
  @ApiQuery({ name: 'sortOrder', enum: ['ASC', 'DESC'], required: false })
  @ApiResponse({ status: 200, description: 'Due payments retrieved successfully' })
  async getAllDuePayments(
    @Query('status') status?: DuePaymentStatus,
    @Query('businessOwnerId') businessOwnerId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sortBy') sortBy: string = 'dueDate',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<any> {
    const whereConditions: any = {};

    if (status) whereConditions.status = status;
    if (businessOwnerId) whereConditions.businessOwnerId = businessOwnerId;
    
    if (fromDate && toDate) {
      whereConditions.dueDate = Between(new Date(fromDate), new Date(toDate));
    } else if (fromDate) {
      whereConditions.dueDate = MoreThanOrEqual(new Date(fromDate));
    } else if (toDate) {
      whereConditions.dueDate = LessThanOrEqual(new Date(toDate));
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [duePayments, total] = await this.vendorDuePaymentRepository.findAndCount({
      where: whereConditions,
      relations: ['businessOwner', 'businessOwner.user'],
      order: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const enrichedPayments = duePayments.map(payment => ({
      ...payment,
      businessName: payment.businessOwner?.businessName || 'N/A',
      ownerName: payment.businessOwner?.firstName && payment.businessOwner?.lastName
        ? `${payment.businessOwner.firstName} ${payment.businessOwner.lastName}`.trim()
        : payment.businessOwner?.businessName || 'N/A',
      mobileNumber: payment.businessOwner?.user?.phone || 'N/A',
    }));

    const summary = await this.getDuePaymentsSummary(whereConditions);

    return {
      code: 200,
      success: true,
      message: 'Due payments retrieved successfully',
      data: {
        duePayments: enrichedPayments,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        summary,
      },
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get due payments summary statistics' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  async getDuePaymentsSummaryEndpoint(
    @Query('businessOwnerId') businessOwnerId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<any> {
    const whereConditions: any = {};

    if (businessOwnerId) whereConditions.businessOwnerId = businessOwnerId;
    
    if (fromDate && toDate) {
      whereConditions.dueDate = Between(new Date(fromDate), new Date(toDate));
    } else if (fromDate) {
      whereConditions.dueDate = MoreThanOrEqual(new Date(fromDate));
    } else if (toDate) {
      whereConditions.dueDate = LessThanOrEqual(new Date(toDate));
    }

    const summary = await this.getDuePaymentsSummary(whereConditions);

    return {
      code: 200,
      success: true,
      message: 'Summary retrieved successfully',
      data: summary,
    };
  }

  @Get('credit-usage/:businessOwnerId')
  @ApiOperation({ summary: 'Get credit usage details for a vendor' })
  @ApiParam({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Credit usage retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Business owner not found' })
  async getCreditUsage(@Param('businessOwnerId') businessOwnerId: string): Promise<any> {
    try {
      const creditUsage = await this.vendorStatusService.calculateCreditUsage(businessOwnerId);
      
      return {
        code: 200,
        success: true,
        message: 'Credit usage retrieved successfully',
        data: creditUsage,
      };
    } catch (error) {
      if (error.message === 'Business owner not found') {
        throw new NotFoundException('Business owner not found');
      }
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific due payment details' })
  @ApiParam({ name: 'id', description: 'Due payment ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Due payment details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Due payment not found' })
  async getDuePaymentById(@Param('id') id: string): Promise<any> {
    const duePayment = await this.vendorDuePaymentRepository.findOne({
      where: { id },
      relations: ['businessOwner', 'businessOwner.user', 'createdByAdmin', 'updatedByAdmin'],
    });

    if (!duePayment) {
      throw new NotFoundException('Due payment not found');
    }

    const enrichedPayment = {
      ...duePayment,
      businessName: duePayment.businessOwner?.businessName || 'N/A',
      ownerName: duePayment.businessOwner?.firstName && duePayment.businessOwner?.lastName
        ? `${duePayment.businessOwner.firstName} ${duePayment.businessOwner.lastName}`.trim()
        : duePayment.businessOwner?.businessName || 'N/A',
      mobileNumber: duePayment.businessOwner?.user?.phone || 'N/A',
      email: duePayment.businessOwner?.user?.email || 'N/A',
    };

    return {
      code: 200,
      success: true,
      message: 'Due payment details retrieved successfully',
      data: enrichedPayment,
    };
  }

  @Post('check-credit-status/:businessOwnerId')
  @ApiOperation({ summary: 'Check and update vendor status based on credit usage' })
  @ApiParam({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Credit status check completed' })
  @ApiResponse({ status: 404, description: 'Business owner not found' })
  async checkCreditStatus(@Param('businessOwnerId') businessOwnerId: string): Promise<any> {
    try {
      // Only check credit usage, never change vendor status
      const creditUsage = await this.vendorStatusService.calculateCreditUsage(businessOwnerId);
      
      return {
        code: 200,
        success: true,
        message: 'Credit status check completed',
        data: {
          businessOwnerId,
          creditUsage,
          note: 'Vendor status remains unchanged - only admin can modify vendor status'
        }
      };
    } catch (error) {
      if (error.message === 'Business owner not found') {
        throw new NotFoundException('Business owner not found');
      }
      throw error;
    }
  }

  @Post('set-credit-limit/:businessOwnerId')
  @ApiOperation({ summary: 'Set credit limit and remarks for vendor before approval' })
  @ApiParam({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' })
  @ApiBody({
    description: 'Credit limit and remarks for vendor',
    schema: {
      example: {
        creditLimit: 10000.00,
        remarks: 'Initial credit limit assigned before approval',
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Credit limit set successfully' })
  @ApiResponse({ status: 404, description: 'Business owner not found' })
  async setCreditLimit(
    @Param('businessOwnerId') businessOwnerId: string,
    @Body() setCreditDto: { creditLimit: number; remarks?: string }
  ): Promise<any> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const previousCreditLimit = businessOwner.creditLimit || 0;
    
    // Update credit limit and add remarks
    await this.businessOwnerRepository.update(
      { id: businessOwnerId },
      { 
        creditLimit: parseFloat(setCreditDto.creditLimit.toString()),
      }
    );

    // Log the credit limit assignment/admin/vendors/:id/credit
    this.logger.log(
      `Credit limit set for business owner ${businessOwnerId}: ` +
      `₹${previousCreditLimit} → ₹${setCreditDto.creditLimit} ${setCreditDto.remarks ? `(${setCreditDto.remarks})` : ''}`
    );

    return {
      code: 200,
      success: true,
      message: `Credit limit set to ₹${parseFloat(setCreditDto.creditLimit.toString()).toFixed(2)} successfully`,
      data: {
        businessOwnerId,
        previousCreditLimit,
        newCreditLimit: parseFloat(setCreditDto.creditLimit.toString()),
        remarks: setCreditDto.remarks,
      },
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new due payment' })
  @ApiBody({
    description: 'Due payment creation data. Note: Creating a due payment will automatically increase the vendor\'s credit limit by the due amount.',
    schema: {
      example: {
        businessOwnerId: '456e7890-e12b-34c5-d678-901234567890',
        dueAmount: 1500.00,
        dueDate: '2024-01-15',
        description: 'Monthly commission payment for December 2023',
        adminRemarks: 'Auto-generated from daily settlement',
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Due payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or business owner not found' })
  async createDuePayment(@Body() createDto: any): Promise<any> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: createDto.businessOwnerId },
      relations: ['user'],
    });

    if (!businessOwner) {
      throw new BadRequestException('Business owner not found');
    }

    const duePayment = this.vendorDuePaymentRepository.create({
      businessOwnerId: createDto.businessOwnerId,
      dueAmount: createDto.dueAmount,
      paidAmount: 0,
      remainingAmount: createDto.dueAmount,
      dueDate: new Date(createDto.dueDate),
      description: createDto.description,
      adminRemarks: createDto.adminRemarks,
      salonName: businessOwner.businessName,
      ownerName: businessOwner?.firstName && businessOwner?.lastName
        ? `${businessOwner.firstName} ${businessOwner.lastName}`.trim()
        : businessOwner?.businessName || 'N/A',
      mobileNumber: businessOwner.user?.phone || 'N/A',
      isBusinessEnabled: businessOwner?.isActive || true,
      status: DuePaymentStatus.PENDING,
    });

    const savedPayment = await this.vendorDuePaymentRepository.save(duePayment);

    // Update business owner's credit limit based on due amount
    const currentCreditLimit = businessOwner.creditLimit || 0;
    const newCreditLimit = currentCreditLimit + parseFloat(createDto.dueAmount);
    
    await this.businessOwnerRepository.update(
      { id: createDto.businessOwnerId },
      { 
        creditLimit: newCreditLimit,
        // Preserve vendor status - ensure payment creation doesn't change vendor status
      }
    );

    // Preserve vendor status - ensure payment creation doesn't change vendor status
    await this.vendorStatusService.preserveVendorStatusOnPayment(createDto.businessOwnerId);

    // Note: We do NOT check credit usage for status changes anymore
    // Vendor status remains unchanged regardless of payment status

    return {
      code: 201,
      success: true,
      message: `Due payment created successfully. Vendor credit points increased by ₹${parseFloat(createDto.dueAmount).toFixed(2)}`,
      data: {
        ...savedPayment,
        previousCreditPoints: currentCreditLimit,
        newCreditPoints: newCreditLimit,
        creditPointsIncrease: parseFloat(createDto.dueAmount),
      },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update due payment status and amounts' })
  @ApiParam({ name: 'id', description: 'Due payment ID (UUID)' })
  @ApiBody({
    description: 'Due payment update data',
    schema: {
      example: {
        paidAmount: 750.00,
        status: 'partially_paid',
        adminRemarks: 'Partial payment received via bank transfer',
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Due payment updated successfully' })
  @ApiResponse({ status: 404, description: 'Due payment not found' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  async updateDuePayment(@Param('id') id: string, @Body() updateDto: any): Promise<any> {
    this.logger.log(`Updating due payment with ID: ${id}`);
    this.logger.log(`Update data: ${JSON.stringify(updateDto)}`);

    // Validate ID format
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid due payment ID format');
    }

    const duePayment = await this.vendorDuePaymentRepository.findOne({
      where: { id },
    });

    if (!duePayment) {
      this.logger.warn(`Due payment not found with ID: ${id}`);
      throw new NotFoundException('Due payment not found');
    }

    this.logger.log(`Found due payment: ${JSON.stringify({
      id: duePayment.id,
      dueAmount: duePayment.dueAmount,
      paidAmount: duePayment.paidAmount,
      status: duePayment.status
    })}`);

    // Validate paidAmount
    if (updateDto.paidAmount !== undefined) {
      if (typeof updateDto.paidAmount !== 'number' || updateDto.paidAmount < 0) {
        throw new BadRequestException('Paid amount must be a non-negative number');
      }
      
      if (updateDto.paidAmount > duePayment.dueAmount) {
        throw new BadRequestException('Paid amount cannot exceed due amount');
      }

      duePayment.paidAmount = updateDto.paidAmount;
      duePayment.remainingAmount = duePayment.dueAmount - updateDto.paidAmount;
      
      this.logger.log(`Updated amounts - Paid: ${duePayment.paidAmount}, Remaining: ${duePayment.remainingAmount}`);
    }

    // Validate status
    if (updateDto.status) {
      const validStatuses = Object.values(DuePaymentStatus);
      if (!validStatuses.includes(updateDto.status)) {
        throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      duePayment.status = updateDto.status;
      
      if (updateDto.status === DuePaymentStatus.OVERDUE && !duePayment.markedOverdueAt) {
        duePayment.markedOverdueAt = new Date();
      }
      
      this.logger.log(`Updated status to: ${duePayment.status}`);
    }

    // Update admin remarks
    if (updateDto.adminRemarks !== undefined) {
      duePayment.adminRemarks = updateDto.adminRemarks;
      this.logger.log(`Updated admin remarks: ${duePayment.adminRemarks}`);
    }

    // Update business enabled status
    if (updateDto.isBusinessEnabled !== undefined) {
      duePayment.isBusinessEnabled = updateDto.isBusinessEnabled;
      this.logger.log(`Updated business enabled: ${duePayment.isBusinessEnabled}`);
    }

    try {
      const updatedPayment = await this.vendorDuePaymentRepository.save(duePayment);
      this.logger.log(`Successfully updated due payment: ${updatedPayment.id}`);

      // Preserve vendor status - ensure payment updates don't change vendor status
      if (duePayment.businessOwnerId) {
        await this.vendorStatusService.preserveVendorStatusOnPayment(duePayment.businessOwnerId);
      }

      return {
        code: 200,
        success: true,
        message: 'Due payment updated successfully',
        data: {
          ...updatedPayment,
          businessName: duePayment.businessOwner?.businessName || 'N/A',
          ownerName: duePayment.businessOwner?.firstName && duePayment.businessOwner?.lastName
            ? `${duePayment.businessOwner.firstName} ${duePayment.businessOwner.lastName}`.trim()
            : duePayment.businessOwner?.businessName || 'N/A',
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update due payment: ${error.message}`);
      throw new BadRequestException(`Failed to update due payment: ${error.message}`);
    }
  }

  private async getDuePaymentsSummary(whereConditions: any = {}) {
    const summary = await this.vendorDuePaymentRepository
      .createQueryBuilder('payment')
      .select('payment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.dueAmount)', 'totalDueAmount')
      .addSelect('SUM(payment.paidAmount)', 'totalPaidAmount')
      .addSelect('SUM(payment.remainingAmount)', 'totalRemainingAmount')
      .where(whereConditions)
      .groupBy('payment.status')
      .getRawMany();

    const totals = await this.vendorDuePaymentRepository
      .createQueryBuilder('payment')
      .select('COUNT(*)', 'totalCount')
      .addSelect('SUM(payment.dueAmount)', 'totalDueAmount')
      .addSelect('SUM(payment.paidAmount)', 'totalPaidAmount')
      .addSelect('SUM(payment.remainingAmount)', 'totalRemainingAmount')
      .where(whereConditions)
      .getRawOne();

    return {
      byStatus: summary,
      totals: totals || {
        totalCount: 0,
        totalDueAmount: 0,
        totalPaidAmount: 0,
        totalRemainingAmount: 0,
      },
    };
  }
}

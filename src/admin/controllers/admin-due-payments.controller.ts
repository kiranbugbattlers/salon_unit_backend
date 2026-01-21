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
      message: 'Due payments summary retrieved successfully',
      data: summary,
    };
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
        data: {
          ...creditUsage,
          businessOwnerId,
        },
      };
    } catch (error) {
      if (error.message === 'Business owner not found') {
        throw new NotFoundException('Business owner not found');
      }
      throw error;
    }
  }

  @Post('check-credit-status/:businessOwnerId')
  @ApiOperation({ summary: 'Check and update vendor status based on credit usage' })
  @ApiParam({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Credit status check completed' })
  @ApiResponse({ status: 404, description: 'Business owner not found' })
  async checkCreditStatus(@Param('businessOwnerId') businessOwnerId: string): Promise<any> {
    try {
      const statusUpdate = await this.vendorStatusService.checkAndUpdateVendorStatusBasedOnCreditUsage(businessOwnerId);
      
      return {
        code: 200,
        success: true,
        message: statusUpdate.previousStatus !== statusUpdate.newStatus 
          ? `Vendor status updated from ${statusUpdate.previousStatus} to ${statusUpdate.newStatus}`
          : `Vendor status remains ${statusUpdate.previousStatus}`,
        data: {
          businessOwnerId,
          previousStatus: statusUpdate.previousStatus,
          newStatus: statusUpdate.newStatus,
          creditUsage: statusUpdate.creditUsage,
          statusChanged: statusUpdate.previousStatus !== statusUpdate.newStatus,
        },
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

    // Log the credit limit assignment
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

    // Check and update vendor status based on credit usage
    await this.vendorStatusService.checkAndUpdateVendorStatusBasedOnCreditUsage(createDto.businessOwnerId);

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
  async updateDuePayment(@Param('id') id: string, @Body() updateDto: any): Promise<any> {
    const duePayment = await this.vendorDuePaymentRepository.findOne({
      where: { id },
    });

    if (!duePayment) {
      throw new NotFoundException('Due payment not found');
    }

    if (updateDto.paidAmount !== undefined) {
      duePayment.paidAmount = updateDto.paidAmount;
      duePayment.remainingAmount = duePayment.dueAmount - updateDto.paidAmount;
    }

    if (updateDto.status) {
      duePayment.status = updateDto.status;
      
      if (updateDto.status === DuePaymentStatus.OVERDUE && !duePayment.markedOverdueAt) {
        duePayment.markedOverdueAt = new Date();
      }
    }

    if (updateDto.adminRemarks !== undefined) {
      duePayment.adminRemarks = updateDto.adminRemarks;
    }

    if (updateDto.isBusinessEnabled !== undefined) {
      duePayment.isBusinessEnabled = updateDto.isBusinessEnabled;
    }

    const updatedPayment = await this.vendorDuePaymentRepository.save(duePayment);

    // Preserve vendor status - ensure payment updates don't change vendor status
    if (duePayment.businessOwnerId) {
      await this.vendorStatusService.preserveVendorStatusOnPayment(duePayment.businessOwnerId);
    }

    return {
      code: 200,
      success: true,
      message: 'Due payment updated successfully',
      data: updatedPayment,
    };
  }

  @Post('check-overdue')
  @ApiOperation({ summary: 'Mark pending payments as overdue' })
  @ApiResponse({ status: 200, description: 'Overdue check completed successfully' })
  async checkOverduePayments(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingPayments = await this.vendorDuePaymentRepository.find({
      where: {
        status: DuePaymentStatus.PENDING,
        dueDate: LessThanOrEqual(today),
      },
      relations: ['businessOwner'],
    });

    let newlyMarkedOverdue = 0;
    const processedPayments = [];

    for (const payment of pendingPayments) {
      payment.status = DuePaymentStatus.OVERDUE;
      payment.markedOverdueAt = new Date();
      await this.vendorDuePaymentRepository.save(payment);
      
      // Preserve vendor status - ensure overdue doesn't change vendor status
      if (payment.businessOwnerId) {
        await this.vendorStatusService.preserveVendorStatusOnOverdue(payment.businessOwnerId);
      }
      
      newlyMarkedOverdue++;
      processedPayments.push({
        id: payment.id,
        businessName: payment.businessOwner?.businessName || 'N/A',
        dueAmount: payment.dueAmount,
        dueDate: payment.dueDate,
        markedOverdueAt: payment.markedOverdueAt,
      });
    }

    const totalOverduePayments = await this.vendorDuePaymentRepository.count({
      where: { status: DuePaymentStatus.OVERDUE },
    });

    return {
      code: 200,
      success: true,
      message: `Overdue check completed. ${newlyMarkedOverdue} payments marked as overdue.`,
      data: {
        newlyMarkedOverdue,
        totalOverduePayments,
        processedPayments,
      },
    };
  }

  private async getDuePaymentsSummary(whereConditions: any = {}) {
    const payments = await this.vendorDuePaymentRepository.find({
      where: whereConditions,
    });

    const summary = {
      totalRecords: payments.length,
      totalDueAmount: 0,
      totalPaidAmount: 0,
      totalRemainingAmount: 0,
      statusBreakdown: {
        pending: { count: 0, amount: 0 },
        overdue: { count: 0, amount: 0 },
        paid: { count: 0, amount: 0 },
        partiallyPaid: { count: 0, amount: 0 },
      },
      businessStatusBreakdown: {
        enabled: { count: 0, amount: 0 },
        disabled: { count: 0, amount: 0 },
      },
      overdueSummary: {
        totalOverdueAmount: 0,
        averageOverdueDays: 0,
        oldestOverdueDate: null as string | null,
      },
    };

    const overduePayments = [];
    let totalOverdueDays = 0;

    for (const payment of payments) {
      summary.totalDueAmount += Number(payment.dueAmount);
      summary.totalPaidAmount += Number(payment.paidAmount);
      summary.totalRemainingAmount += Number(payment.remainingAmount);

      const status = payment.status;
      if (summary.statusBreakdown[status]) {
        summary.statusBreakdown[status].count++;
        summary.statusBreakdown[status].amount += Number(payment.dueAmount);
      }

      const businessStatus = payment.isBusinessEnabled ? 'enabled' : 'disabled';
      summary.businessStatusBreakdown[businessStatus].count++;
      summary.businessStatusBreakdown[businessStatus].amount += Number(payment.dueAmount);

      if (payment.status === DuePaymentStatus.OVERDUE) {
        summary.overdueSummary.totalOverdueAmount += Number(payment.dueAmount);
        overduePayments.push(payment);
        
        if (payment.markedOverdueAt) {
          const daysOverdue = Math.floor(
            (new Date().getTime() - new Date(payment.markedOverdueAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          totalOverdueDays += daysOverdue;
        }
      }
    }

    if (overduePayments.length > 0) {
      summary.overdueSummary.averageOverdueDays = Math.round(totalOverdueDays / overduePayments.length);
      
      const oldestPayment = overduePayments.reduce((oldest, current) => {
        const currentDate = new Date(current.dueDate);
        const oldestDate = new Date(oldest.dueDate);
        return currentDate < oldestDate ? current : oldest;
      });
      summary.overdueSummary.oldestOverdueDate = new Date(oldestPayment.dueDate).toISOString().split('T')[0];
    }

    return summary;
  }
}

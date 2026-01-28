import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, IsNull, Not } from 'typeorm';
import {
  Booking,
  BookingRequest,
  Customer,
  BusinessOwner,
  Staff,
  Service,
  Payment,
  CommissionTransaction,
  BookingStatus,
  BookingRequestStatus,
} from '../../database/entities';
import {
  AdminBookingQueryDto,
  AdminBookingRequestQueryDto,
  AdminBookingDetailDto,
  AdminBookingRequestDetailDto,
  ForceCancelBookingDto,
  ForceCompleteBookingDto,
  BookingAnalyticsDto,
  AdminAnalyticsQueryDto,
  AdminCustomerInfoDto,
  AdminBusinessInfoDto,
  AdminStaffInfoDto,
  AdminServiceInfoDto,
  AdminPaymentInfoDto,
  AdminCommissionInfoDto,
  BusinessPerformanceReportQueryDto,
  BusinessPerformanceDto,
  BusinessPerformanceMetricsDto,
  BusinessReportSummaryDto,
  BusinessPerformanceReportDataDto,
} from '../dto/admin-booking.dto';
import { PaymentMethodType } from '../../database/entities/settlement-transaction.entity';

@Injectable()
export class AdminBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingRequest)
    private readonly bookingRequestRepository: Repository<BookingRequest>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(CommissionTransaction)
    private readonly commissionTransactionRepository: Repository<CommissionTransaction>,
  ) {}

  async getAllBookings(query: AdminBookingQueryDto): Promise<{ bookings: AdminBookingDetailDto[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('booking.businessOwner', 'businessOwner')
      .leftJoinAndSelect('businessOwner.user', 'businessOwnerUser')
      .leftJoinAndSelect('businessOwner.addresses', 'businessAddresses')
      .leftJoinAndSelect('booking.staff', 'staff')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.bookingServices', 'bookingServices')
      .leftJoinAndSelect('booking.bookingRequest', 'bookingRequest')
      .leftJoinAndSelect('bookingRequest.payment', 'payment')
      .leftJoinAndSelect('booking.commissionTransaction', 'commissionTransaction');

    // Apply filters
    if (query.status) {
      queryBuilder.andWhere('booking.status = :status', { status: query.status });
    }

    if (query.businessOwnerId) {
      queryBuilder.andWhere('booking.businessOwnerId = :businessOwnerId', { businessOwnerId: query.businessOwnerId });
    }

    if (query.customerId) {
      queryBuilder.andWhere('booking.customerId = :customerId', { customerId: query.customerId });
    }

    if (query.staffId) {
      queryBuilder.andWhere('booking.staffId = :staffId', { staffId: query.staffId });
    }

    if (query.serviceLocation) {
      queryBuilder.andWhere('booking.serviceLocation = :serviceLocation', { serviceLocation: query.serviceLocation });
    }

    if (query.dateFrom && query.dateTo) {
      queryBuilder.andWhere('booking.appointmentDate BETWEEN :dateFrom AND :dateTo', {
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      });
    } else if (query.dateFrom) {
      queryBuilder.andWhere('booking.appointmentDate >= :dateFrom', { dateFrom: query.dateFrom });
    } else if (query.dateTo) {
      queryBuilder.andWhere('booking.appointmentDate <= :dateTo', { dateTo: query.dateTo });
    }

    queryBuilder
      .orderBy('booking.createdAt', 'DESC')
      .addOrderBy('booking.appointmentDate', 'DESC')
      .skip(skip)
      .take(limit);

    const [bookings, total] = await queryBuilder.getManyAndCount();

    const transformedBookings = bookings.map(booking => this.transformToAdminBookingDetail(booking));

    return { bookings: transformedBookings, total };
  }

  async getAllBookingRequests(query: AdminBookingRequestQueryDto): Promise<{ requests: AdminBookingRequestDetailDto[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.bookingRequestRepository
      .createQueryBuilder('bookingRequest')
      .leftJoinAndSelect('bookingRequest.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('bookingRequest.businessOwner', 'businessOwner')
      .leftJoinAndSelect('businessOwner.user', 'businessOwnerUser')
      .leftJoinAndSelect('businessOwner.addresses', 'businessAddresses')
      .leftJoinAndSelect('bookingRequest.requestedStaff', 'requestedStaff')
      .leftJoinAndSelect('bookingRequest.assignedStaff', 'assignedStaff')
      .leftJoinAndSelect('bookingRequest.bookingRequestServices', 'bookingRequestServices')
      .leftJoinAndSelect('bookingRequestServices.businessService', 'businessService')
      .leftJoinAndSelect('businessService.service', 'service')
      .leftJoinAndSelect('bookingRequest.confirmedBooking', 'confirmedBooking')
      .leftJoinAndSelect('bookingRequest.payment', 'payment');

    // Apply filters
    if (query.status) {
      // Handle both database and virtual statuses
      switch (query.status) {
        case BookingRequestStatus.PENDING:
          queryBuilder.andWhere('bookingRequest.status = :status', { status: 'pending' });
          break;
        case BookingRequestStatus.STAFF_ASSIGNED:
          queryBuilder
            .andWhere('bookingRequest.status = :status', { status: 'pending' })
            .andWhere('bookingRequest.assignedStaffId IS NOT NULL');
          break;
        case BookingRequestStatus.APPROVED:
          queryBuilder.andWhere('bookingRequest.status = :status', { status: 'approved' });
          break;
        case BookingRequestStatus.REJECTED:
          queryBuilder.andWhere('bookingRequest.status = :status', { status: 'rejected' });
          break;
        default:
          queryBuilder.andWhere('bookingRequest.status = :status', { status: query.status });
      }
    }

    if (query.businessOwnerId) {
      queryBuilder.andWhere('bookingRequest.businessOwnerId = :businessOwnerId', { businessOwnerId: query.businessOwnerId });
    }

    if (query.customerId) {
      queryBuilder.andWhere('bookingRequest.customerId = :customerId', { customerId: query.customerId });
    }

    if (query.dateFrom && query.dateTo) {
      queryBuilder.andWhere('bookingRequest.requestedDate BETWEEN :dateFrom AND :dateTo', {
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      });
    } else if (query.dateFrom) {
      queryBuilder.andWhere('bookingRequest.requestedDate >= :dateFrom', { dateFrom: query.dateFrom });
    } else if (query.dateTo) {
      queryBuilder.andWhere('bookingRequest.requestedDate <= :dateTo', { dateTo: query.dateTo });
    }

    queryBuilder
      .orderBy('bookingRequest.createdAt', 'DESC')
      .addOrderBy('bookingRequest.requestedDate', 'DESC')
      .skip(skip)
      .take(limit);

    const [requests, total] = await queryBuilder.getManyAndCount();

    const transformedRequests = requests.map(request => this.transformToAdminBookingRequestDetail(request));

    return { requests: transformedRequests, total };
  }

  async getBookingDetails(bookingId: string): Promise<AdminBookingDetailDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: [
        'customer',
        'customer.user',
        'businessOwner',
        'businessOwner.user',
        'businessOwner.addresses',
        'staff',
        'service',
        'bookingServices',
        'bookingRequest',
        'bookingRequest.payment',
        'commissionTransaction',
      ],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.transformToAdminBookingDetail(booking);
  }

  async getBookingRequestDetails(bookingRequestId: string): Promise<AdminBookingRequestDetailDto> {
    const bookingRequest = await this.bookingRequestRepository.findOne({
      where: { id: bookingRequestId },
      relations: [
        'customer',
        'customer.user',
        'businessOwner',
        'businessOwner.user',
        'businessOwner.addresses',
        'requestedStaff',
        'assignedStaff',
        'bookingRequestServices',
        'bookingRequestServices.businessService',
        'bookingRequestServices.businessService.service',
        'confirmedBooking',
        'payment',
      ],
    });

    if (!bookingRequest) {
      throw new NotFoundException('Booking request not found');
    }

    return this.transformToAdminBookingRequestDetail(bookingRequest);
  }

  async forceCancelBooking(bookingId: string, adminId: string, cancelDto: ForceCancelBookingDto): Promise<AdminBookingDetailDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: [
        'customer',
        'customer.user',
        'businessOwner',
        'businessOwner.user',
        'businessOwner.addresses',
        'staff',
        'service',
        'bookingServices',
        'bookingRequest',
        'bookingRequest.payment',
        'commissionTransaction',
      ],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    // Store original status for audit
    const originalStatus = booking.status;

    // Update booking status
    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = `[ADMIN OVERRIDE] ${cancelDto.reason}`;
    booking.cancelledAt = new Date();

    await this.bookingRepository.save(booking);

    // TODO: Implement refund logic if refundRequired is true
    // This would involve:
    // 1. Check payment method
    // 2. If online payment, initiate Razorpay refund
    // 3. Update wallet balances
    // 4. Reverse commission transactions
    // 5. Update settlement records

    // TODO: Implement notification logic
    // Send notifications to customer and business owner based on flags

    // TODO: Create audit log entry
    // Log admin action with reason, before/after states

    return this.transformToAdminBookingDetail(booking);
  }

  async forceCompleteBooking(bookingId: string, adminId: string, completeDto: ForceCompleteBookingDto): Promise<AdminBookingDetailDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: [
        'customer',
        'customer.user',
        'businessOwner',
        'businessOwner.user',
        'businessOwner.addresses',
        'staff',
        'service',
        'bookingServices',
        'bookingRequest',
        'bookingRequest.payment',
        'commissionTransaction',
      ],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Booking is already completed');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete a cancelled booking');
    }

    // Update booking status
    booking.status = BookingStatus.COMPLETED;
    booking.serviceCompletedAt = new Date();

    // Add admin override note
    const adminNote = `[ADMIN OVERRIDE] ${completeDto.reason}`;
    if (completeDto.notes) {
      booking.specialRequests = booking.specialRequests
        ? `${booking.specialRequests}\n\n${adminNote}\nNotes: ${completeDto.notes}`
        : `${adminNote}\nNotes: ${completeDto.notes}`;
    } else {
      booking.specialRequests = booking.specialRequests
        ? `${booking.specialRequests}\n\n${adminNote}`
        : adminNote;
    }

    // If service was not started, mark it as started
    if (!booking.serviceStartedAt) {
      booking.serviceStartedAt = new Date();
    }

    // If OTP was not verified, mark it as verified
    if (!booking.otpVerifiedAt) {
      booking.otpVerifiedAt = new Date();
    }

    await this.bookingRepository.save(booking);

    // TODO: Implement commission calculation if calculateCommission is true
    // This would involve calling the commission service to calculate and apply commission

    // TODO: Create audit log entry

    return this.transformToAdminBookingDetail(booking);
  }

  async getBookingAnalytics(query: AdminAnalyticsQueryDto): Promise<BookingAnalyticsDto> {
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking');

    // Apply date filters
    if (query.dateFrom && query.dateTo) {
      queryBuilder.andWhere('booking.appointmentDate BETWEEN :dateFrom AND :dateTo', {
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      });
    } else if (query.dateFrom) {
      queryBuilder.andWhere('booking.appointmentDate >= :dateFrom', { dateFrom: query.dateFrom });
    } else if (query.dateTo) {
      queryBuilder.andWhere('booking.appointmentDate <= :dateTo', { dateTo: query.dateTo });
    }

    // Apply business owner filter
    if (query.businessOwnerId) {
      queryBuilder.andWhere('booking.businessOwnerId = :businessOwnerId', { businessOwnerId: query.businessOwnerId });
    }

    const allBookings = await queryBuilder
      .leftJoinAndSelect('booking.businessOwner', 'businessOwner')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.bookingServices', 'bookingServices')
      .leftJoinAndSelect('booking.commissionTransaction', 'commissionTransaction')
      .getMany();

    // Calculate statistics
    const totalBookings = allBookings.length;

    const byStatus = {
      pending: allBookings.filter(b => b.status === BookingStatus.PENDING).length,
      confirmed: allBookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
      inProgress: allBookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length,
      completed: allBookings.filter(b => b.status === BookingStatus.COMPLETED).length,
      cancelled: allBookings.filter(b => b.status === BookingStatus.CANCELLED).length,
    };

    const byPaymentMethod = {
      online: allBookings.filter(b => b.paymentMethod === PaymentMethodType.ONLINE || !b.paymentMethod).length,
      cod: allBookings.filter(b => b.paymentMethod === PaymentMethodType.COD).length,
    };

    const completedBookings = allBookings.filter(b => b.status === BookingStatus.COMPLETED);
    const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const averageBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

    const totalCommission = completedBookings.reduce((sum, b) => {
      if (b.commissionTransaction) {
        return sum + Number(b.commissionTransaction.businessOwnerCommissionAmount || 0);
      }
      return sum;
    }, 0);

    const completionRate = totalBookings > 0 ? byStatus.completed / totalBookings : 0;
    const cancellationRate = totalBookings > 0 ? byStatus.cancelled / totalBookings : 0;

    // Top businesses by booking count
    const businessMap = new Map<string, { name: string; count: number; revenue: number }>();
    completedBookings.forEach(booking => {
      const bizId = booking.businessOwnerId;
      if (!businessMap.has(bizId)) {
        businessMap.set(bizId, {
          name: booking.businessOwner?.businessName || 'Unknown',
          count: 0,
          revenue: 0,
        });
      }
      const biz = businessMap.get(bizId);
      biz.count++;
      biz.revenue += Number(booking.totalAmount);
    });

    const topBusinesses = Array.from(businessMap.entries())
      .map(([id, data]) => ({
        businessId: id,
        businessName: data.name,
        bookingCount: data.count,
        totalRevenue: data.revenue,
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 10);

    // Top customers by booking count
    const customerMap = new Map<string, { name: string; count: number; spent: number }>();
    completedBookings.forEach(booking => {
      const custId = booking.customerId;
      if (!customerMap.has(custId)) {
        customerMap.set(custId, {
          name: booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : 'Unknown',
          count: 0,
          spent: 0,
        });
      }
      const cust = customerMap.get(custId);
      cust.count++;
      cust.spent += Number(booking.totalAmount);
    });

    const topCustomers = Array.from(customerMap.entries())
      .map(([id, data]) => ({
        customerId: id,
        customerName: data.name,
        bookingCount: data.count,
        totalSpent: data.spent,
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 10);

    // Bookings by day
    const bookingsByDay: Record<string, number> = {};
    const revenueByDay: Record<string, number> = {};

    allBookings.forEach(booking => {
      const date = booking.appointmentDate instanceof Date
        ? booking.appointmentDate.toISOString().split('T')[0]
        : booking.appointmentDate;

      bookingsByDay[date] = (bookingsByDay[date] || 0) + 1;

      if (booking.status === BookingStatus.COMPLETED) {
        revenueByDay[date] = (revenueByDay[date] || 0) + Number(booking.totalAmount);
      }
    });

    return {
      totalBookings,
      byStatus,
      byPaymentMethod,
      averageBookingValue,
      totalRevenue,
      totalCommission,
      completionRate,
      cancellationRate,
      topBusinesses,
      topCustomers,
      bookingsByDay,
      revenueByDay,
    };
  }

  // Transformation helpers
  private transformToAdminBookingDetail(booking: Booking): AdminBookingDetailDto {
    const customer: AdminCustomerInfoDto = {
      id: booking.customer.id,
      firstName: booking.customer.firstName,
      lastName: booking.customer.lastName,
      email: booking.customer.user?.email || '',
      phone: booking.customer.user?.phone || '',
      profilePic: undefined,
    };

    const business: AdminBusinessInfoDto = {
      id: booking.businessOwner.id,
      shopId: booking.businessOwner.shopId,
      businessName: booking.businessOwner.businessName,
      address: booking.businessOwner.addresses && booking.businessOwner.addresses.length > 0
        ? `${booking.businessOwner.addresses[0].streetAddress}, ${booking.businessOwner.addresses[0].city}, ${booking.businessOwner.addresses[0].state}`
        : 'Address not available',
      phone: booking.businessOwner.user?.phone || '',
      email: booking.businessOwner.user?.email,
    };

    const staff: AdminStaffInfoDto = {
      id: booking.staff.id,
      firstName: booking.staff.firstName,
      lastName: booking.staff.lastName,
      profilePic: booking.staff.profilePic,
      phone: booking.staff.phone,
    };

    const service: AdminServiceInfoDto = {
      id: booking.service.id,
      name: booking.service.name,
      description: booking.service.description || '',
      basePrice: booking.service.basePrice || 0,
      defaultDuration: booking.service.defaultDuration || 0,
    };

    let paymentInfo: AdminPaymentInfoDto | undefined;
    if (booking.bookingRequest?.payment) {
      const payment = booking.bookingRequest.payment;
      paymentInfo = {
        paymentId: payment.id,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.status,
        amount: payment.amount,
        razorpayPaymentId: payment.razorpayPaymentId,
        razorpayOrderId: payment.razorpayOrderId,
        paymentCompletedAt: payment.paymentCompletedAt,
      };
    }

    let commissionInfo: AdminCommissionInfoDto | undefined;
    if (booking.commissionTransaction) {
      const commission = booking.commissionTransaction;
      commissionInfo = {
        commissionTransactionId: commission.id,
        businessOwnerCommission: commission.businessOwnerCommissionAmount,
        gstAmount: commission.gstAmount,
        commissionPercent: commission.businessOwnerCommissionPercent,
        gstPercent: commission.gstPercent,
      };
    }

    // Transform booking services
    const bookingServices = booking.bookingServices?.map(bs => ({
      id: bs.id,
      serviceName: bs.serviceName,
      servicePrice: Number(bs.servicePrice),
      serviceDuration: bs.serviceDuration,
      isAddOn: bs.isAddOn,
      addedAt: bs.addedAt,
    })) || [];

    return {
      id: booking.id,
      appointmentDate: booking.appointmentDate instanceof Date
        ? booking.appointmentDate.toISOString().split('T')[0]
        : booking.appointmentDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      serviceLocation: booking.serviceLocation,
      totalAmount: Number(booking.totalAmount),
      deliveryCharge: booking.deliveryCharge ? Number(booking.deliveryCharge) : undefined,
      deliveryDistance: booking.deliveryDistance ? Number(booking.deliveryDistance) : undefined,
      addOnServicesTotal: booking.addOnServicesTotal ? Number(booking.addOnServicesTotal) : undefined,
      paymentCompleted: booking.paymentCompleted,
      specialRequests: booking.specialRequests,
      otpCode: booking.otpCode,
      otpVerifiedAt: booking.otpVerifiedAt,
      serviceStartedAt: booking.serviceStartedAt,
      serviceCompletedAt: booking.serviceCompletedAt,
      cancellationReason: booking.cancellationReason,
      cancelledAt: booking.cancelledAt,
      bookingRequestId: booking.bookingRequestId,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      customer,
      business,
      staff,
      service,
      bookingServices,
      paymentInfo,
      commissionInfo,
    };
  }

  private transformToAdminBookingRequestDetail(bookingRequest: BookingRequest): AdminBookingRequestDetailDto {
    const customer: AdminCustomerInfoDto = {
      id: bookingRequest.customer.id,
      firstName: bookingRequest.customer.firstName,
      lastName: bookingRequest.customer.lastName,
      email: bookingRequest.customer.user?.email || '',
      phone: bookingRequest.customer.user?.phone || '',
      profilePic: undefined,
    };

    const business: AdminBusinessInfoDto = {
      id: bookingRequest.businessOwner.id,
      shopId: bookingRequest.businessOwner.shopId,
      businessName: bookingRequest.businessOwner.businessName,
      address: bookingRequest.businessOwner.addresses && bookingRequest.businessOwner.addresses.length > 0
        ? `${bookingRequest.businessOwner.addresses[0].streetAddress}, ${bookingRequest.businessOwner.addresses[0].city}`
        : 'Address not available',
      phone: bookingRequest.businessOwner.user?.phone || '',
      email: bookingRequest.businessOwner.user?.email,
    };

    const requestedStaff: AdminStaffInfoDto | undefined = bookingRequest.requestedStaff ? {
      id: bookingRequest.requestedStaff.id,
      firstName: bookingRequest.requestedStaff.firstName,
      lastName: bookingRequest.requestedStaff.lastName,
      profilePic: bookingRequest.requestedStaff.profilePic,
      phone: bookingRequest.requestedStaff.phone,
    } : undefined;

    const assignedStaff: AdminStaffInfoDto | undefined = bookingRequest.assignedStaff ? {
      id: bookingRequest.assignedStaff.id,
      firstName: bookingRequest.assignedStaff.firstName,
      lastName: bookingRequest.assignedStaff.lastName,
      profilePic: bookingRequest.assignedStaff.profilePic,
      phone: bookingRequest.assignedStaff.phone,
    } : undefined;

    const services = bookingRequest.bookingRequestServices?.map(brs => ({
      id: brs.id,
      quantity: brs.quantity,
      estimatedPrice: brs.estimatedPrice,
      estimatedDuration: brs.estimatedDuration,
      businessService: {
        id: brs.businessService.id,
        customPrice: brs.businessService.customPrice,
        customDurationMinutes: brs.businessService.customDurationMinutes,
        service: {
          id: brs.businessService.service.id,
          name: brs.businessService.service.name,
          description: brs.businessService.service.description || '',
        },
      },
    })) || [];

    let paymentInfo: AdminPaymentInfoDto | undefined;
    if (bookingRequest.payment) {
      const payment = bookingRequest.payment;
      paymentInfo = {
        paymentId: payment.id,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.status,
        amount: payment.amount,
        razorpayPaymentId: payment.razorpayPaymentId,
        razorpayOrderId: payment.razorpayOrderId,
        paymentCompletedAt: payment.paymentCompletedAt,
      };
    }

    return {
      id: bookingRequest.id,
      requestedDate: bookingRequest.requestedDate instanceof Date
        ? bookingRequest.requestedDate.toISOString().split('T')[0]
        : bookingRequest.requestedDate,
      requestedStartTime: bookingRequest.requestedStartTime,
      requestedEndTime: bookingRequest.requestedEndTime,
      status: bookingRequest.status,
      totalEstimatedPrice: Number(bookingRequest.totalEstimatedPrice),
      totalEstimatedDuration: bookingRequest.totalEstimatedDuration,
      approvedStartTime: bookingRequest.approvedStartTime,
      approvedEndTime: bookingRequest.approvedEndTime,
      finalPrice: bookingRequest.finalPrice ? Number(bookingRequest.finalPrice) : undefined,
      rejectionReason: bookingRequest.rejectionReason,
      businessNotes: bookingRequest.businessNotes,
      createdAt: bookingRequest.createdAt,
      updatedAt: bookingRequest.updatedAt,
      customer,
      business,
      requestedStaff,
      assignedStaff,
      services,
      confirmedBookingId: bookingRequest.confirmedBooking?.id,
      paymentInfo,
    };
  }

  async getBusinessPerformanceReport(query: BusinessPerformanceReportQueryDto): Promise<{ data: BusinessPerformanceReportDataDto; total: number }> {
    // Validate date range
    const dateFrom = new Date(query.dateFrom);
    const dateTo = new Date(query.dateTo);

    if (dateFrom > dateTo) {
      throw new BadRequestException('dateFrom must be before or equal to dateTo');
    }

    // Validate max date range (366 days)
    const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 366) {
      throw new BadRequestException('Date range cannot exceed 366 days');
    }

    // Build base query
    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.businessOwner', 'businessOwner')
      .leftJoinAndSelect('businessOwner.user', 'businessOwnerUser')
      .leftJoinAndSelect('booking.bookingServices', 'bookingServices')
      .leftJoinAndSelect('booking.commissionTransaction', 'commission')
      .where('booking.appointmentDate BETWEEN :dateFrom AND :dateTo', {
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      });

    // Filter by shopId if provided
    if (query.shopId) {
      queryBuilder.andWhere('businessOwner.shopId = :shopId', { shopId: query.shopId });
    }

    // Fetch all bookings
    const allBookings = await queryBuilder.getMany();

    // Group bookings by business and period
    const businessMap = new Map<string, Map<string, Booking[]>>();

    allBookings.forEach(booking => {
      const businessId = booking.businessOwnerId;

      // Determine period based on report type
      const appointmentDate = booking.appointmentDate instanceof Date
        ? booking.appointmentDate
        : new Date(booking.appointmentDate);

      let period: string;
      if (query.reportType === 'daily') {
        period = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        // Monthly: YYYY-MM
        const year = appointmentDate.getFullYear();
        const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
        period = `${year}-${month}`;
      }

      if (!businessMap.has(businessId)) {
        businessMap.set(businessId, new Map());
      }

      const periodMap = businessMap.get(businessId);
      if (!periodMap.has(period)) {
        periodMap.set(period, []);
      }

      periodMap.get(period).push(booking);
    });

    // Calculate metrics for each business-period combination
    const businessPerformanceList: BusinessPerformanceDto[] = [];

    businessMap.forEach((periodMap, businessId) => {
      periodMap.forEach((bookings, period) => {
        const business = bookings[0].businessOwner;

        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED);
        const cancelledBookings = bookings.filter(b => b.status === BookingStatus.CANCELLED);

        const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
        const totalCommission = completedBookings.reduce((sum, b) => {
          if (b.commissionTransaction) {
            return sum + Number(b.commissionTransaction.businessOwnerCommissionAmount || 0);
          }
          return sum;
        }, 0);

        const averageBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;
        const completionRate = totalBookings > 0 ? completedBookings.length / totalBookings : 0;
        const cancellationRate = totalBookings > 0 ? cancelledBookings.length / totalBookings : 0;

        const metrics: BusinessPerformanceMetricsDto = {
          totalBookings,
          completedBookings: completedBookings.length,
          cancelledBookings: cancelledBookings.length,
          totalRevenue,
          totalCommission,
          averageBookingValue,
          completionRate,
          cancellationRate,
        };

        businessPerformanceList.push({
          businessId,
          shopId: business.shopId,
          businessName: business.businessName,
          period,
          metrics,
          contact: {
            email: business.user?.email,
            phone: business.user?.phone,
          },
        });
      });
    });

    // Sort the results
    const sortBy = query.sortBy || 'revenue';
    const sortOrder = query.sortOrder || 'desc';

    businessPerformanceList.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'revenue':
          compareValue = a.metrics.totalRevenue - b.metrics.totalRevenue;
          break;
        case 'bookings':
          compareValue = a.metrics.totalBookings - b.metrics.totalBookings;
          break;
        case 'commission':
          compareValue = a.metrics.totalCommission - b.metrics.totalCommission;
          break;
        case 'businessName':
          compareValue = a.businessName.localeCompare(b.businessName);
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    // Calculate summary
    const uniqueBusinesses = new Set(businessPerformanceList.map(b => b.businessId));
    const totalBookings = businessPerformanceList.reduce((sum, b) => sum + b.metrics.totalBookings, 0);
    const totalRevenue = businessPerformanceList.reduce((sum, b) => sum + b.metrics.totalRevenue, 0);
    const totalCommission = businessPerformanceList.reduce((sum, b) => sum + b.metrics.totalCommission, 0);
    const averageRevenuePerBusiness = uniqueBusinesses.size > 0 ? totalRevenue / uniqueBusinesses.size : 0;

    const summary: BusinessReportSummaryDto = {
      totalBusinesses: uniqueBusinesses.size,
      totalBookings,
      totalRevenue,
      totalCommission,
      averageRevenuePerBusiness,
    };

    // Paginate results
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;
    const total = businessPerformanceList.length;

    const paginatedBusinesses = businessPerformanceList.slice(skip, skip + limit);

    const data: BusinessPerformanceReportDataDto = {
      reportType: query.reportType,
      period: {
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      },
      summary,
      businesses: paginatedBusinesses,
    };

    return { data, total };
  }
}

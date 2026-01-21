import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  Booking,
  Customer,
  BusinessOwner,
  BusinessService,
  Staff,
  Service,
  StaffWorkingHours,
  BusinessOperatingHours,
  BookingStatus,
  BookingRequest,
  BookingRequestService as BookingRequestServiceEntity,
  BookingRequestStatus,
  ServicePackage,
  ServicePackageItem,
  BookingService as BookingServiceEntity,
} from '../database/entities';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingResponseDto,
  BookingListResponseDto,
  BookingDto,
  BookingQueryDto,
  CustomerDto,
  BusinessDto,
  StaffDto,
  ServiceDto,
  AddServicesDto,
} from './dto';
import {
  CustomerTransactionHistoryResponseDto,
  DayWiseTransactionHistoryDto,
  TransactionHistoryItemDto,
  PaymentMethod,
} from './dto/customer-transaction-history.dto';
import {
  AdminTransactionHistoryResponseDto,
  DayWiseAdminTransactionHistoryDto,
  AdminTransactionHistoryItemDto,
  TransactionType,
  TransactionStatus,
  SettlementType,
} from './dto/admin-transaction-history.dto';
import { CommissionService } from '../wallet/commission.service';
import { PaymentMethodType } from '../database/entities/settlement-transaction.entity';
import { DeliveryChargeService } from './delivery-charge.service';
import { ServiceLocation } from '../common/enums/booking.enum';
import { NotificationService } from '../notification/notification.service';
import { UserType } from '../notification/entities/device-token.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(BusinessService)
    private readonly businessServiceRepository: Repository<BusinessService>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(StaffWorkingHours)
    private readonly staffWorkingHoursRepository: Repository<StaffWorkingHours>,
    @InjectRepository(BusinessOperatingHours)
    private readonly businessOperatingHoursRepository: Repository<BusinessOperatingHours>,
    @InjectRepository(BookingRequest)
    private readonly bookingRequestRepository: Repository<BookingRequest>,
    @InjectRepository(BookingRequestServiceEntity)
    private readonly bookingRequestServiceRepository: Repository<BookingRequestServiceEntity>,
    @InjectRepository(ServicePackage)
    private readonly servicePackageRepository: Repository<ServicePackage>,
    @InjectRepository(ServicePackageItem)
    private readonly servicePackageItemRepository: Repository<ServicePackageItem>,
    @InjectRepository(BookingServiceEntity)
    private readonly bookingServiceRepository: Repository<BookingServiceEntity>,
    @Inject(forwardRef(() => CommissionService))
    private readonly commissionService: CommissionService,
    private readonly deliveryChargeService: DeliveryChargeService,
    private readonly notificationService: NotificationService,
  ) {}

  async createBooking(userId: string, createBookingDto: CreateBookingDto): Promise<any> {
    // Find customer by userId (same pattern as customer service)
    const customer = await this.customerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const customerId = customer.id;

    // Validate business owner exists
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: createBookingDto.businessOwnerId },
    });
    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // If staffId is provided, validate staff exists and belongs to the business (optional preference)
    if (createBookingDto.requestedStaffId) {
      const staff = await this.staffRepository.findOne({
        where: {
          id: createBookingDto.requestedStaffId,
          businessOwnerId: createBookingDto.businessOwnerId
        },
      });
      if (!staff) {
        throw new NotFoundException('Staff not found or does not belong to this business');
      }
    }

    // Validate that at least one service or package is provided
    if (!createBookingDto.businessServiceIds?.length && !createBookingDto.servicePackageIds?.length) {
      throw new BadRequestException('At least one business service or service package must be selected');
    }

    // Validate business services exist and belong to the business (if provided)
    let businessServices = [];
    if (Array.isArray(createBookingDto.businessServiceIds) && createBookingDto.businessServiceIds.length > 0) {
      businessServices = await this.businessServiceRepository.find({
        where: {
          id: In(createBookingDto.businessServiceIds),
          businessOwnerId: createBookingDto.businessOwnerId,
          isActive: true
        },
        relations: ['service']
      });

      if (businessServices.length !== createBookingDto.businessServiceIds.length) {
        throw new NotFoundException('One or more business services not found or inactive');
      }
    }

    // Validate service packages exist and belong to the business (if provided)
    let servicePackages = [];
    let packageBusinessServices = [];
    if (Array.isArray(createBookingDto.servicePackageIds) && createBookingDto.servicePackageIds.length > 0) {
      servicePackages = await this.servicePackageRepository.find({
        where: {
          id: In(createBookingDto.servicePackageIds),
          businessOwnerId: createBookingDto.businessOwnerId,
          isActive: true
        },
        relations: ['packageItems', 'packageItems.businessService', 'packageItems.businessService.service']
      });

      if (servicePackages.length !== createBookingDto.servicePackageIds.length) {
        throw new NotFoundException('One or more service packages not found or inactive');
      }

      // Extract all business services from packages
      for (const pkg of servicePackages) {
        for (const item of pkg.packageItems) {
          if (item.businessService && item.businessService.isActive) {
            packageBusinessServices.push({
              businessService: item.businessService,
              packageId: pkg.id,
              packageName: pkg.name,
              discountPercentage: pkg.discountPercentage
            });
          }
        }
      }
    }

    // Merge business services from individual selections and packages, removing duplicates
    const serviceMap = new Map();
    
    // Add individual services to map
    for (const businessService of businessServices) {
      if (!serviceMap.has(businessService.id)) {
        serviceMap.set(businessService.id, {
          businessService,
          packageId: null,
          packageName: null,
          discountPercentage: 0
        });
      }
    }
    
    // Add package services to map (if not already added as individual service)
    for (const pkgService of packageBusinessServices) {
      if (!serviceMap.has(pkgService.businessService.id)) {
        serviceMap.set(pkgService.businessService.id, pkgService);
      }
    }
    
    const allServices = Array.from(serviceMap.values());

    // Calculate total estimated amount and duration
    let totalEstimatedAmount = 0;
    let totalEstimatedDuration = 0;

    // Calculate totals from all services (individual + package services with discounts)
    for (const serviceData of allServices) {
      const businessService = serviceData.businessService;
      const servicePriceRaw = businessService.customPrice || businessService.service.basePrice || 0;
      let servicePrice = typeof servicePriceRaw === 'string' ? parseFloat(servicePriceRaw) : Number(servicePriceRaw);

      // Apply package discount if service is from a package
      if (serviceData.discountPercentage > 0) {
        const discountAmount = (servicePrice * serviceData.discountPercentage) / 100;
        servicePrice = servicePrice - discountAmount;
      }

      totalEstimatedAmount += servicePrice;
      totalEstimatedDuration += businessService.customDurationMinutes || businessService.service.defaultDuration || 0;
    }

    // Handle delivery charges for at-home services
    let deliveryCharge = 0;
    let deliveryDistance = 0;
    let customerAddress = null;

    if (createBookingDto.serviceLocation === ServiceLocation.AT_HOME) {
      // Validate that customer address is provided for at-home services
      if (!createBookingDto.customerAddress) {
        throw new BadRequestException('Customer address is required for at-home services');
      }

      // Validate address has required fields
      if (!createBookingDto.customerAddress.latitude || !createBookingDto.customerAddress.longitude) {
        throw new BadRequestException('Customer address must include latitude and longitude for delivery charge calculation');
      }

      // Calculate delivery charges
      try {
        const deliveryCalculation = await this.deliveryChargeService.calculateDeliveryCharge(
          createBookingDto.businessOwnerId,
          createBookingDto.customerAddress.latitude,
          createBookingDto.customerAddress.longitude,
          totalEstimatedAmount,
        );

        deliveryCharge = deliveryCalculation.totalDeliveryCharge;
        deliveryDistance = deliveryCalculation.distanceKm;

        // Store customer address for the booking
        customerAddress = createBookingDto.customerAddress;
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException(`Failed to calculate delivery charges: ${error.message}`);
      }

      // Add delivery charge to total
      totalEstimatedAmount += deliveryCharge;
    }

    // Validate business hours
    await this.validateBusinessHours(createBookingDto);

    // Create booking request instead of direct booking
    const bookingRequest = this.bookingRequestRepository.create({
      customerId,
      businessOwnerId: createBookingDto.businessOwnerId,
      requestedStaffId: createBookingDto.requestedStaffId, // Optional staff preference
      requestedDate: new Date(createBookingDto.requestedDate),
      requestedStartTime: createBookingDto.requestedStartTime,
      requestedEndTime: createBookingDto.requestedEndTime,
      serviceLocation: createBookingDto.serviceLocation, // Optional service location preference
      specialRequests: createBookingDto.specialRequests, // Optional customer notes
      totalEstimatedPrice: totalEstimatedAmount,
      totalEstimatedDuration: totalEstimatedDuration,
      status: BookingRequestStatus.PENDING,
      customerAddress: customerAddress, // Store customer address for at-home services
      deliveryCharge: deliveryCharge, // Store delivery charge (0 for free delivery, >0 for paid)
      deliveryDistance: deliveryDistance || 0, // Store delivery distance (0 for in-salon)
    });

    const savedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);

    // Create booking request services from all services (individual + package services)
    if (allServices.length > 0) {
      const bookingRequestServices = allServices.map(serviceData => {
        const businessService = serviceData.businessService;
        const estimatedPriceRaw = businessService.customPrice || businessService.service.basePrice || 0;
        let estimatedPrice = typeof estimatedPriceRaw === 'string' ? parseFloat(estimatedPriceRaw) : Number(estimatedPriceRaw);
        
        // Apply package discount if service is from a package
        if (serviceData.discountPercentage > 0) {
          const discountAmount = (estimatedPrice * serviceData.discountPercentage) / 100;
          estimatedPrice = estimatedPrice - discountAmount;
        }
        
        return this.bookingRequestServiceRepository.create({
          bookingRequestId: savedBookingRequest.id,
          businessServiceId: businessService.id,
          estimatedPrice: estimatedPrice,
          estimatedDuration: businessService.customDurationMinutes || businessService.service.defaultDuration || 0,
        });
      });

      await this.bookingRequestServiceRepository.save(bookingRequestServices);
    }

    // Send notifications to customer and business owner
    try {
      const serviceNames = allServices.map(s => s.businessService.service.name).join(', ');
      const dateTime = `${createBookingDto.requestedDate} at ${createBookingDto.requestedStartTime}`;

      // Notify customer - booking request submitted
      await this.notificationService.sendToCustomer(
        customer.userId,
        'BOOKING_REQUEST_CREATED',
        {
          bookingId: savedBookingRequest.id,
          dateTime,
          salonName: businessOwner.businessName,
        }
      );

      // Notify business owner - new booking request
      await this.notificationService.sendToBusinessOwner(
        businessOwner.userId,
        'BOOKING_REQUEST_CREATED',
        {
          bookingId: savedBookingRequest.id,
          customerName: `${customer.firstName} ${customer.lastName}`,
          dateTime,
          services: serviceNames,
          serviceLocation: createBookingDto.serviceLocation,
        }
      );
    } catch (error) {
      console.error('Failed to send booking request created notifications:', error);
    }

    // Return booking request response
    const bookingRequestWithRelations = await this.bookingRequestRepository.findOne({
      where: { id: savedBookingRequest.id },
      relations: [
        'customer',
        'customer.user',
        'businessOwner',
        'businessOwner.user',
        'requestedStaff',
        'bookingRequestServices',
        'bookingRequestServices.businessService',
        'bookingRequestServices.businessService.service',
      ],
    });

    return {
      success: true,
      message: 'Booking request created successfully. Business owner will review and assign staff.',
      data: {
        id: bookingRequestWithRelations.id,
        status: bookingRequestWithRelations.status,
        appointmentDate: typeof bookingRequestWithRelations.requestedDate === 'string'
          ? bookingRequestWithRelations.requestedDate
          : bookingRequestWithRelations.requestedDate.toISOString().split('T')[0],
        startTime: bookingRequestWithRelations.requestedStartTime,
        endTime: bookingRequestWithRelations.requestedEndTime,
        serviceLocation: bookingRequestWithRelations.serviceLocation,
        specialRequests: bookingRequestWithRelations.specialRequests,
        estimatedAmount: bookingRequestWithRelations.totalEstimatedPrice,
        estimatedDuration: bookingRequestWithRelations.totalEstimatedDuration,
        deliveryCharge: bookingRequestWithRelations.deliveryCharge,
        deliveryDistance: bookingRequestWithRelations.deliveryDistance,
        customerAddress: bookingRequestWithRelations.customerAddress,
        createdAt: bookingRequestWithRelations.createdAt,
        customer: {
          id: bookingRequestWithRelations.customer.id,
          firstName: bookingRequestWithRelations.customer.firstName,
          lastName: bookingRequestWithRelations.customer.lastName,
          email: bookingRequestWithRelations.customer.user?.email || '',
          phone: bookingRequestWithRelations.customer.user?.phone || '',
        },
        business: {
          id: bookingRequestWithRelations.businessOwner.id,
          businessName: bookingRequestWithRelations.businessOwner.businessName,
        },
        requestedStaff: bookingRequestWithRelations.requestedStaff ? {
          id: bookingRequestWithRelations.requestedStaff.id,
          firstName: bookingRequestWithRelations.requestedStaff.firstName,
          lastName: bookingRequestWithRelations.requestedStaff.lastName,
        } : null,
        services: bookingRequestWithRelations.bookingRequestServices?.map(brs => ({
          businessServiceId: brs.businessServiceId,
          serviceName: brs.businessService.service.name,
          estimatedPrice: brs.estimatedPrice,
          estimatedDuration: brs.estimatedDuration,
        })) || [],
      },
    };
  }

  async getCustomerBookings(customerId: string, query: BookingQueryDto): Promise<BookingListResponseDto> {
    // Validate customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('booking.businessOwner', 'businessOwner')
      .leftJoinAndSelect('businessOwner.addresses', 'businessAddresses')
      .leftJoinAndSelect('booking.staff', 'staff')
      .leftJoinAndSelect('booking.service', 'service')
      .where('booking.customerId = :customerId', { customerId });

    // Apply filters
    if (query.status) {
      queryBuilder.andWhere('booking.status = :status', { status: query.status });
    }

    if (query.appointmentDate) {
      queryBuilder.andWhere('booking.appointmentDate = :appointmentDate', {
        appointmentDate: query.appointmentDate,
      });
    }

    if (query.fromDate && query.toDate) {
      queryBuilder.andWhere('booking.appointmentDate BETWEEN :fromDate AND :toDate', {
        fromDate: query.fromDate,
        toDate: query.toDate,
      });
    } else if (query.fromDate) {
      queryBuilder.andWhere('booking.appointmentDate >= :fromDate', {
        fromDate: query.fromDate,
      });
    } else if (query.toDate) {
      queryBuilder.andWhere('booking.appointmentDate <= :toDate', {
        toDate: query.toDate,
      });
    }

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder
      .orderBy('booking.createdAt', 'DESC')
      .addOrderBy('booking.appointmentDate', 'DESC')
      .addOrderBy('booking.startTime', 'DESC')
      .skip(skip)
      .take(limit);

    const [bookings, total] = await queryBuilder.getManyAndCount();

    return {
      code: 200,
      success: true,
      message: 'Customer bookings retrieved successfully',
      data: bookings.map(booking => this.transformToBookingDto(booking)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateBooking(
    bookingId: string,
    userId: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<BookingResponseDto> {
    // Find customer by userId
    const customer = await this.customerRepository.findOne({
      where: { userId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const booking = await this.getBookingWithRelations(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify ownership
    if (booking.customerId !== customer.id) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    // Check if booking can be updated (not completed or cancelled)
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot update completed or cancelled bookings');
    }

    // If updating time or date, validate availability
    if (updateBookingDto.appointmentDate || updateBookingDto.startTime || updateBookingDto.endTime) {
      const updatedBookingData = {
        businessOwnerId: booking.businessOwnerId,
        staffId: booking.staffId,
        serviceId: booking.serviceId,
        appointmentDate: updateBookingDto.appointmentDate || booking.appointmentDate.toISOString().split('T')[0],
        startTime: updateBookingDto.startTime || booking.startTime,
        endTime: updateBookingDto.endTime || booking.endTime,
        serviceLocation: booking.serviceLocation,
        totalAmount: booking.totalAmount,
      };

      await this.validateTimeSlotAvailability(updatedBookingData, bookingId);
      await this.validateWorkingHours(updatedBookingData);
    }

    // Update booking
    Object.assign(booking, {
      ...updateBookingDto,
      appointmentDate: updateBookingDto.appointmentDate ? new Date(updateBookingDto.appointmentDate) : booking.appointmentDate,
    });

    const updatedBooking = await this.bookingRepository.save(booking);
    const fullBooking = await this.getBookingWithRelations(updatedBooking.id);

    return {
      code: 200,
      success: true,
      message: 'Booking updated successfully',
      data: this.transformToBookingDto(fullBooking),
    };
  }

  async cancelBooking(bookingId: string, userId: string): Promise<BookingResponseDto> {
    // Find customer by userId
    const customer = await this.customerRepository.findOne({
      where: { userId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const booking = await this.getBookingWithRelations(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify ownership
    if (booking.customerId !== customer.id) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    // Check if booking can be cancelled
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot cancel completed or already cancelled bookings');
    }

    // Update status to cancelled
    booking.status = BookingStatus.CANCELLED;
    const updatedBooking = await this.bookingRepository.save(booking);
    const fullBooking = await this.getBookingWithRelations(updatedBooking.id);

    // Send notification to business owner - customer cancelled booking
    try {
      const dateTime = `${fullBooking.appointmentDate instanceof Date
        ? fullBooking.appointmentDate.toISOString().split('T')[0]
        : fullBooking.appointmentDate} at ${fullBooking.startTime}`;

      await this.notificationService.sendToBusinessOwner(
        fullBooking.businessOwner.userId,
        'BOOKING_CANCELLED',
        {
          bookingId: fullBooking.id,
          customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName}`,
          dateTime,
          reason: fullBooking.specialRequests || 'No reason provided',
        }
      );
    } catch (error) {
      console.error('Failed to send booking cancelled notification:', error);
    }

    return {
      code: 200,
      success: true,
      message: 'Booking cancelled successfully',
      data: this.transformToBookingDto(fullBooking),
    };
  }

  private async validateBookingEntities(createBookingDto: CreateBookingDto): Promise<void> {
    // Validate business exists
    const business = await this.businessOwnerRepository.findOne({
      where: { id: createBookingDto.businessOwnerId },
    });
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Validate staff exists and belongs to business
    const staff = await this.staffRepository.findOne({
      where: { id: createBookingDto.requestedStaffId, businessOwnerId: createBookingDto.businessOwnerId },
    });
    if (!staff) {
      throw new NotFoundException('Staff member not found or does not belong to this business');
    }

    // Service validation is done through business services validation
  }

  private async validateTimeSlotAvailability(
    bookingData: Partial<CreateBookingDto>,
    excludeBookingId?: string,
  ): Promise<void> {
    const appointmentDate = new Date(bookingData.requestedDate);

    // Check for conflicting bookings
    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.staffId = :staffId', { staffId: bookingData.requestedStaffId })
      .andWhere('booking.appointmentDate = :appointmentDate', { appointmentDate })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS],
      })
      .andWhere(
        '(booking.startTime < :endTime AND booking.endTime > :startTime)',
        {
          startTime: bookingData.requestedStartTime,
          endTime: bookingData.requestedEndTime,
        },
      );

    if (excludeBookingId) {
      queryBuilder.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    const conflictingBooking = await queryBuilder.getOne();

    if (conflictingBooking) {
      throw new BadRequestException(
        `Time slot is not available. Conflicts with existing booking from ${conflictingBooking.startTime} to ${conflictingBooking.endTime}`,
      );
    }
  }

  private async validateWorkingHours(bookingData: Partial<CreateBookingDto>): Promise<void> {
    const appointmentDate = new Date(bookingData.requestedDate);
    const dayOfWeek = appointmentDate.getDay();

    // Check business operating hours
    const businessHours = await this.businessOperatingHoursRepository.findOne({
      where: { businessOwnerId: bookingData.businessOwnerId, dayOfWeek },
    });

    if (!businessHours || businessHours.isClosed) {
      throw new BadRequestException('Business is closed on this day');
    }

    if (bookingData.requestedStartTime < businessHours.openTime || bookingData.requestedEndTime > businessHours.closeTime) {
      throw new BadRequestException(
        `Booking time is outside business hours (${businessHours.openTime} - ${businessHours.closeTime})`,
      );
    }

    // Check staff working hours
    const staffWorkingHours = await this.staffWorkingHoursRepository.findOne({
      where: { staffId: bookingData.requestedStaffId, dayOfWeek, isActive: true },
    });

    if (!staffWorkingHours) {
      throw new BadRequestException('Staff member is not available on this day');
    }

    if (bookingData.requestedStartTime < staffWorkingHours.startTime || bookingData.requestedEndTime > staffWorkingHours.endTime) {
      throw new BadRequestException(
        `Booking time is outside staff working hours (${staffWorkingHours.startTime} - ${staffWorkingHours.endTime})`,
      );
    }
  }

  private async getBookingWithRelations(bookingId: string): Promise<Booking> {
    return this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: [
        'customer',
        'customer.user',
        'businessOwner',
        'businessOwner.user',
        'businessOwner.addresses',
        'staff',
        'service',
      ],
    });
  }

  private calculateDurationMinutes(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    return endTotalMinutes - startTotalMinutes;
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyOtpAndStartService(
    bookingId: string,
    otpCode: string,
    businessOwnerId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.getBookingWithRelations(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify the booking belongs to this business owner
    if (booking.businessOwnerId !== businessOwnerId) {
      throw new ForbiddenException('This booking does not belong to your business');
    }

    // Check booking status - must be CONFIRMED
    if (booking.status !== BookingStatus.CONFIRMED) {
      if (booking.status === BookingStatus.IN_PROGRESS) {
        throw new BadRequestException('Service has already been started');
      }
      if (booking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException('Service has already been completed');
      }
      throw new BadRequestException('Booking must be in confirmed status to verify OTP');
    }

    // Verify OTP code
    if (booking.otpCode !== otpCode) {
      throw new BadRequestException('Invalid OTP code');
    }

    // Update booking status to IN_PROGRESS and set timestamps
    booking.status = BookingStatus.IN_PROGRESS;
    booking.otpVerifiedAt = new Date();
    booking.serviceStartedAt = new Date();

    const updatedBooking = await this.bookingRepository.save(booking);
    const fullBooking = await this.getBookingWithRelations(updatedBooking.id);

    // Send notification to customer - service started
    try {
      await this.notificationService.sendToCustomer(
        fullBooking.customer.userId,
        'SERVICE_STARTED',
        {
          bookingId: fullBooking.id,
          salonName: fullBooking.businessOwner.businessName,
          staffName: fullBooking.staff ? `${fullBooking.staff.firstName} ${fullBooking.staff.lastName}` : undefined,
        }
      );
    } catch (error) {
      console.error('Failed to send service started notification:', error);
    }

    return {
      code: 200,
      success: true,
      message: 'OTP verified successfully. Service started.',
      data: this.transformToBookingDto(fullBooking),
    };
  }

  async completeService(
    bookingId: string,
    businessOwnerId: string,
    notes?: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.getBookingWithRelations(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify the booking belongs to this business owner
    if (booking.businessOwnerId !== businessOwnerId) {
      throw new ForbiddenException('This booking does not belong to your business');
    }

    // Check booking status - must be IN_PROGRESS
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      if (booking.status === BookingStatus.CONFIRMED) {
        throw new BadRequestException('Service has not been started yet. Please verify OTP first.');
      }
      if (booking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException('Service has already been completed');
      }
      throw new BadRequestException('Booking must be in progress to complete service');
    }

    // IMPORTANT: Validate that payment has been completed before marking service as complete
    if (!booking.paymentCompleted) {
      throw new BadRequestException(
        'Payment must be completed before marking service as complete. Please ask the customer to complete payment first.'
      );
    }

    // Update booking status to COMPLETED and set completion timestamp
    booking.status = BookingStatus.COMPLETED;
    booking.serviceCompletedAt = new Date();
    if (notes) {
      booking.specialRequests = booking.specialRequests
        ? `${booking.specialRequests}\n\nCompletion Notes: ${notes}`
        : `Completion Notes: ${notes}`;
    }

    const updatedBooking = await this.bookingRepository.save(booking);
    const fullBooking = await this.getBookingWithRelations(updatedBooking.id);

    // Calculate and apply commission after booking completion
    try {
      // Determine payment method from booking or default to ONLINE
      const paymentMethod = booking.paymentMethod || PaymentMethodType.ONLINE;
      await this.commissionService.calculateAndApplyCommission(
        updatedBooking.id,
        paymentMethod,
      );
    } catch (error) {
      // Log error but don't fail the booking completion
      console.error(`Failed to calculate commission for booking ${updatedBooking.id}:`, error);
    }

    // Send notifications to customer and business owner - service completed
    try {
      await this.notificationService.sendToCustomer(
        fullBooking.customer.userId,
        'SERVICE_COMPLETED',
        {
          bookingId: fullBooking.id,
          salonName: fullBooking.businessOwner.businessName,
          totalAmount: String(fullBooking.totalAmount),
        }
      );

      // Optional: notify business owner about completion
      await this.notificationService.sendToBusinessOwner(
        fullBooking.businessOwner.userId,
        'SERVICE_COMPLETED',
        {
          bookingId: fullBooking.id,
          customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName}`,
          totalAmount: String(fullBooking.totalAmount),
        }
      );
    } catch (error) {
      console.error('Failed to send service completed notifications:', error);
    }

    return {
      code: 200,
      success: true,
      message: 'Service completed successfully. Commission has been applied.',
      data: this.transformToBookingDto(fullBooking),
    };
  }

  async addServicesToBooking(
    bookingId: string,
    businessOwnerId: string,
    addServicesDto: AddServicesDto,
    customerId?: string,
  ): Promise<any> {
    // Validate booking exists
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['bookingServices'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify ownership - either business owner OR customer
    if (customerId) {
      // Customer adding services to their own booking
      if (booking.customerId !== customerId) {
        throw new ForbiddenException('You can only add services to your own bookings');
      }
      // Use booking's businessOwnerId for service validation
      businessOwnerId = booking.businessOwnerId;
    } else {
      // Business owner adding services
      if (booking.businessOwnerId !== businessOwnerId) {
        throw new ForbiddenException('This booking does not belong to your business');
      }
    }

    // Check booking status - must be IN_PROGRESS
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Add-on services can only be added to bookings that are in progress');
    }

    // For customers, payment must not be completed yet
    if (customerId && booking.paymentCompleted) {
      throw new BadRequestException('Cannot add services after payment has been completed. Please contact the salon for assistance.');
    }

    // Validate that at least one service or package is provided
    if (!addServicesDto.businessServiceIds?.length && !addServicesDto.servicePackageIds?.length) {
      throw new BadRequestException('At least one business service or service package must be selected');
    }

    // Get existing service IDs to prevent duplicates
    const existingServiceIds = new Set(
      booking.bookingServices?.map(bs => bs.businessServiceId) || []
    );

    // Validate business services exist and belong to the business (if provided)
    let businessServices = [];
    let duplicateServices = [];
    if (Array.isArray(addServicesDto.businessServiceIds) && addServicesDto.businessServiceIds.length > 0) {
      businessServices = await this.businessServiceRepository.find({
        where: {
          id: In(addServicesDto.businessServiceIds),
          businessOwnerId: businessOwnerId,
          isActive: true
        },
        relations: ['service']
      });

      if (businessServices.length !== addServicesDto.businessServiceIds.length) {
        throw new NotFoundException('One or more business services not found or inactive');
      }

      // Check for duplicates
      businessServices.forEach(bs => {
        if (existingServiceIds.has(bs.id)) {
          duplicateServices.push(bs.service.name);
        }
      });
    }

    // Validate service packages exist and belong to the business (if provided)
    let servicePackages = [];
    let packageBusinessServices = [];
    if (Array.isArray(addServicesDto.servicePackageIds) && addServicesDto.servicePackageIds.length > 0) {
      servicePackages = await this.servicePackageRepository.find({
        where: {
          id: In(addServicesDto.servicePackageIds),
          businessOwnerId: businessOwnerId,
          isActive: true
        },
        relations: ['packageItems', 'packageItems.businessService', 'packageItems.businessService.service']
      });

      if (servicePackages.length !== addServicesDto.servicePackageIds.length) {
        throw new NotFoundException('One or more service packages not found or inactive');
      }

      // Extract all business services from packages and check for duplicates
      for (const pkg of servicePackages) {
        for (const item of pkg.packageItems) {
          if (item.businessService && item.businessService.isActive) {
            if (existingServiceIds.has(item.businessService.id)) {
              duplicateServices.push(`${item.businessService.service.name} (from package: ${pkg.name})`);
            } else {
              packageBusinessServices.push({
                businessService: item.businessService,
                packageId: pkg.id,
                packageName: pkg.name,
                discountPercentage: pkg.discountPercentage
              });
            }
          }
        }
      }
    }

    // Report duplicates if any
    if (duplicateServices.length > 0) {
      return {
        success: false,
        message: 'Same services are already in the booking',
        duplicateServices: duplicateServices,
      };
    }

    // Merge business services from individual selections and packages
    const serviceMap = new Map();

    // Add individual services to map
    for (const businessService of businessServices) {
      if (!serviceMap.has(businessService.id) && !existingServiceIds.has(businessService.id)) {
        serviceMap.set(businessService.id, {
          businessService,
          packageId: null,
          packageName: null,
          discountPercentage: 0
        });
      }
    }

    // Add package services to map (if not already added)
    for (const pkgService of packageBusinessServices) {
      if (!serviceMap.has(pkgService.businessService.id) && !existingServiceIds.has(pkgService.businessService.id)) {
        serviceMap.set(pkgService.businessService.id, pkgService);
      }
    }

    const newServices = Array.from(serviceMap.values());

    if (newServices.length === 0) {
      return {
        success: false,
        message: 'No new services to add - all selected services are already in the booking',
      };
    }

    // Calculate total add-on amount
    let addOnTotal = 0;
    const bookingServicesToCreate = [];

    for (const serviceData of newServices) {
      const businessService = serviceData.businessService;
      const servicePriceRaw = businessService.customPrice || businessService.service.basePrice || 0;
      let servicePrice = typeof servicePriceRaw === 'string' ? parseFloat(servicePriceRaw) : Number(servicePriceRaw);

      // Apply package discount if service is from a package
      if (serviceData.discountPercentage > 0) {
        const discountAmount = (servicePrice * serviceData.discountPercentage) / 100;
        servicePrice = servicePrice - discountAmount;
      }

      // Determine if this service should be auto-approved
      // Customer adding = auto-approve, Business owner adding = pending approval
      const isCustomerAdding = !!customerId;
      const shouldAutoApprove = isCustomerAdding;

      // Only add to total if auto-approved (customer adding)
      if (shouldAutoApprove) {
        addOnTotal += servicePrice;
      }

      bookingServicesToCreate.push(
        this.bookingServiceRepository.create({
          bookingId: booking.id,
          businessServiceId: businessService.id,
          serviceId: businessService.serviceId,
          serviceName: businessService.service.name,
          price: servicePrice,
          servicePrice: servicePrice,
          durationMinutes: businessService.customDurationMinutes || businessService.service.defaultDuration || 0,
          serviceDuration: businessService.customDurationMinutes || businessService.service.defaultDuration || 0,
          isAddOn: true,
          addedAt: new Date(),
          customerApproved: shouldAutoApprove, // false for business owner, true for customer
          approvedAt: shouldAutoApprove ? new Date() : null, // Set if auto-approved
          packageId: serviceData.packageId,
          packageName: serviceData.packageName,
        })
      );
    }

    // Save new booking services
    await this.bookingServiceRepository.save(bookingServicesToCreate);

    // Only update booking amounts if services were auto-approved (customer adding)
    if (addOnTotal > 0) {
      // Reload booking without bookingServices relation to avoid cascade issues
      const bookingToUpdate = await this.bookingRepository.findOne({
        where: { id: bookingId },
      });

      // Update booking's add-on total and total amount
      const currentAddOnTotal = Number(bookingToUpdate.addOnServicesTotal) || 0;
      bookingToUpdate.addOnServicesTotal = currentAddOnTotal + addOnTotal;
      bookingToUpdate.totalAmount = Number(bookingToUpdate.totalAmount) + addOnTotal;
      await this.bookingRepository.save(bookingToUpdate);
    }

    // Fetch updated booking with all relations
    const updatedBooking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['bookingServices'],
    });

    const isCustomerAdding = !!customerId;
    const statusMessage = isCustomerAdding
      ? `Successfully added ${newServices.length} add-on service(s) to the booking`
      : `Successfully added ${newServices.length} add-on service(s) pending customer approval`;

    // Send notifications based on who added the service
    try {
      // Fetch full booking with relations for notifications
      const fullBooking = await this.bookingRepository.findOne({
        where: { id: bookingId },
        relations: ['customer', 'businessOwner', 'customer.user', 'businessOwner.user'],
      });

      const serviceNames = newServices.map(s => s.businessService.service.name).join(', ');

      if (isCustomerAdding) {
        // Customer added service - notify business owner
        await this.notificationService.sendToBusinessOwner(
          fullBooking.businessOwner.userId,
          'ADDON_SERVICE_ADDED_BY_CUSTOMER',
          {
            bookingId: booking.id,
            customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName}`,
            serviceName: serviceNames,
            price: String(addOnTotal),
            newTotal: String(updatedBooking.totalAmount),
          }
        );
      } else {
        // Business owner added service - notify customer for approval
        const calculatedPrice = newServices.reduce((sum, s) => {
          const price = s.businessService.customPrice || s.businessService.service.basePrice || 0;
          return sum + (typeof price === 'string' ? parseFloat(price) : Number(price));
        }, 0);
        await this.notificationService.sendToCustomer(
          fullBooking.customer.userId,
          'ADDON_SERVICE_PENDING_APPROVAL',
          {
            bookingId: booking.id,
            serviceName: serviceNames,
            price: String(calculatedPrice),
            salonName: fullBooking.businessOwner.businessName,
          }
        );
      }
    } catch (error) {
      console.error('Failed to send add-on service notification:', error);
    }

    return {
      success: true,
      message: statusMessage,
      data: {
        bookingId: booking.id,
        addedServices: bookingServicesToCreate.map(bs => ({
          serviceName: bs.serviceName,
          price: bs.price,
          duration: bs.durationMinutes,
          packageName: bs.packageName,
          customerApproved: bs.customerApproved,
        })),
        addOnTotal: addOnTotal,
        newTotalAmount: updatedBooking.totalAmount,
        pendingApproval: !isCustomerAdding,
      },
    };
  }

  async approveAddOnService(customerId: string, bookingId: string, serviceId: string): Promise<any> {
    // Fetch booking service with relations
    const bookingService = await this.bookingServiceRepository.findOne({
      where: { id: serviceId, bookingId },
      relations: ['booking'],
    });

    if (!bookingService) {
      throw new NotFoundException('Service not found in this booking');
    }

    // Verify customer owns the booking
    if (bookingService.booking.customerId !== customerId) {
      throw new ForbiddenException('You can only approve services for your own bookings');
    }

    // Verify booking is in progress
    if (bookingService.booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Can only approve services for bookings that are in progress');
    }

    // Verify payment not completed
    if (bookingService.booking.paymentCompleted) {
      throw new BadRequestException('Cannot approve services after payment has been completed');
    }

    // Verify this is an add-on service
    if (!bookingService.isAddOn) {
      throw new BadRequestException('Can only approve add-on services, not original booking services');
    }

    // Verify service is pending approval
    if (bookingService.customerApproved) {
      throw new BadRequestException('This service has already been approved');
    }

    // Update service approval status
    bookingService.customerApproved = true;
    bookingService.approvedAt = new Date();
    await this.bookingServiceRepository.save(bookingService);

    // Update booking amounts
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    const servicePrice = Number(bookingService.price);
    const currentAddOnTotal = Number(booking.addOnServicesTotal) || 0;
    const currentTotalAmount = Number(booking.totalAmount);

    booking.addOnServicesTotal = currentAddOnTotal + servicePrice;
    booking.totalAmount = currentTotalAmount + servicePrice;
    await this.bookingRepository.save(booking);

    // Send notifications to both customer and business owner
    try {
      // Fetch full booking with relations for notifications
      const fullBooking = await this.bookingRepository.findOne({
        where: { id: bookingId },
        relations: ['customer', 'businessOwner', 'customer.user', 'businessOwner.user'],
      });

      // Notify customer - confirmation of approval
      await this.notificationService.sendToCustomer(
        fullBooking.customer.userId,
        'ADDON_SERVICE_APPROVED_BY_CUSTOMER',
        {
          bookingId: booking.id,
          serviceName: bookingService.serviceName,
          newTotal: String(booking.totalAmount),
        }
      );

      // Notify business owner - customer approved the add-on service
      await this.notificationService.sendToBusinessOwner(
        fullBooking.businessOwner.userId,
        'ADDON_SERVICE_APPROVED_BY_CUSTOMER',
        {
          bookingId: booking.id,
          customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName}`,
          serviceName: bookingService.serviceName,
          price: String(bookingService.servicePrice),
        }
      );
    } catch (error) {
      console.error('Failed to send add-on service approval notifications:', error);
    }

    // Return response in the specified format
    return {
      code: 200,
      success: true,
      message: `Add-on service "${bookingService.serviceName}" approved successfully`,
      data: {
        bookingId: booking.id,
        totalAmount: Number(booking.totalAmount),
        addOnServicesTotal: Number(booking.addOnServicesTotal),
        approvedService: {
          id: bookingService.id,
          serviceName: bookingService.serviceName,
          servicePrice: Number(bookingService.servicePrice),
          customerApproved: true,
          approvedAt: bookingService.approvedAt,
        },
      },
    };
  }

  async rejectAddOnService(customerId: string, bookingId: string, serviceId: string): Promise<any> {
    // Fetch booking service with relations
    const bookingService = await this.bookingServiceRepository.findOne({
      where: { id: serviceId, bookingId },
      relations: ['booking'],
    });

    if (!bookingService) {
      throw new NotFoundException('Service not found in this booking');
    }

    // Verify customer owns the booking
    if (bookingService.booking.customerId !== customerId) {
      throw new ForbiddenException('You can only reject services for your own bookings');
    }

    // Verify booking is in progress
    if (bookingService.booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Can only reject services for bookings that are in progress');
    }

    // Verify payment not completed
    if (bookingService.booking.paymentCompleted) {
      throw new BadRequestException('Cannot reject services after payment has been completed');
    }

    // Verify this is an add-on service
    if (!bookingService.isAddOn) {
      throw new BadRequestException('Can only reject add-on services, not original booking services');
    }

    // Verify service is pending approval
    if (bookingService.customerApproved) {
      throw new BadRequestException('Cannot reject a service that has already been approved');
    }

    // Store service details before deletion
    const serviceDetails = {
      id: bookingService.id,
      serviceName: bookingService.serviceName,
      servicePrice: Number(bookingService.servicePrice),
    };

    // Get booking for response
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    // Permanently delete the service record
    await this.bookingServiceRepository.remove(bookingService);

    // Send notifications to both customer and business owner
    try {
      // Fetch full booking with relations for notifications
      const fullBooking = await this.bookingRepository.findOne({
        where: { id: bookingId },
        relations: ['customer', 'businessOwner', 'customer.user', 'businessOwner.user'],
      });

      // Notify customer - confirmation of rejection
      await this.notificationService.sendToCustomer(
        fullBooking.customer.userId,
        'ADDON_SERVICE_REJECTED_BY_CUSTOMER',
        {
          bookingId: booking.id,
          serviceName: serviceDetails.serviceName,
        }
      );

      // Notify business owner - customer rejected the add-on service
      await this.notificationService.sendToBusinessOwner(
        fullBooking.businessOwner.userId,
        'ADDON_SERVICE_REJECTED_BY_CUSTOMER',
        {
          bookingId: booking.id,
          customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName}`,
          serviceName: serviceDetails.serviceName,
        }
      );
    } catch (error) {
      console.error('Failed to send add-on service rejection notifications:', error);
    }

    // Return response in the specified format
    // Note: No amount changes needed as pending services were not added to totals
    return {
      code: 200,
      success: true,
      message: `Add-on service "${serviceDetails.serviceName}" rejected and removed successfully`,
      data: {
        bookingId: booking.id,
        totalAmount: Number(booking.totalAmount),
        addOnServicesTotal: Number(booking.addOnServicesTotal),
        removedService: serviceDetails,
      },
    };
  }

  async getStaffBookings(staffId: string, query: BookingQueryDto): Promise<BookingListResponseDto> {
    // Validate staff exists
    const staff = await this.staffRepository.findOne({
      where: { id: staffId },
    });
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('booking.businessOwner', 'businessOwner')
      .leftJoinAndSelect('businessOwner.addresses', 'businessAddresses')
      .leftJoinAndSelect('booking.staff', 'staff')
      .leftJoinAndSelect('booking.service', 'service')
      .where('booking.staffId = :staffId', { staffId });

    // Apply filters
    if (query.status) {
      queryBuilder.andWhere('booking.status = :status', { status: query.status });
    }

    if (query.appointmentDate) {
      queryBuilder.andWhere('booking.appointmentDate = :appointmentDate', {
        appointmentDate: query.appointmentDate,
      });
    }

    if (query.fromDate && query.toDate) {
      queryBuilder.andWhere('booking.appointmentDate BETWEEN :fromDate AND :toDate', {
        fromDate: query.fromDate,
        toDate: query.toDate,
      });
    } else if (query.fromDate) {
      queryBuilder.andWhere('booking.appointmentDate >= :fromDate', {
        fromDate: query.fromDate,
      });
    } else if (query.toDate) {
      queryBuilder.andWhere('booking.appointmentDate <= :toDate', {
        toDate: query.toDate,
      });
    }

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder
      .orderBy('booking.createdAt', 'DESC')
      .addOrderBy('booking.appointmentDate', 'DESC')
      .addOrderBy('booking.startTime', 'DESC')
      .skip(skip)
      .take(limit);

    const [bookings, total] = await queryBuilder.getManyAndCount();

    return {
      code: 200,
      success: true,
      message: 'Staff bookings retrieved successfully',
      data: bookings.map(booking => this.transformToBookingDto(booking)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async validateBusinessHours(createBookingDto: CreateBookingDto): Promise<void> {
    const appointmentDate = new Date(createBookingDto.requestedDate);
    const dayOfWeek = appointmentDate.getDay();

    const businessHours = await this.businessOperatingHoursRepository.findOne({
      where: { businessOwnerId: createBookingDto.businessOwnerId, dayOfWeek },
    });

    if (!businessHours || businessHours.isClosed) {
      throw new BadRequestException('Business is closed on this day');
    }

    if (createBookingDto.requestedStartTime < businessHours.openTime || createBookingDto.requestedEndTime > businessHours.closeTime) {
      throw new BadRequestException(
        `Booking time is outside business hours (${businessHours.openTime} - ${businessHours.closeTime})`,
      );
    }
  }

  private async validateStaffAvailability(
    staffId: string,
    appointmentDate: Date,
    startTime: string,
    endTime: string,
  ): Promise<void> {
    const dayOfWeek = appointmentDate.getDay();

    const staffWorkingHours = await this.staffWorkingHoursRepository.findOne({
      where: { staffId, dayOfWeek, isActive: true },
    });

    if (!staffWorkingHours) {
      throw new BadRequestException('Staff member is not available on this day');
    }

    if (startTime < staffWorkingHours.startTime || endTime > staffWorkingHours.endTime) {
      throw new BadRequestException(
        `Booking time is outside staff working hours (${staffWorkingHours.startTime} - ${staffWorkingHours.endTime})`,
      );
    }
  }

  private transformToBookingDto(booking: Booking): BookingDto {
    const customer: CustomerDto = {
      id: booking.customer.id,
      firstName: booking.customer.firstName,
      lastName: booking.customer.lastName,
      email: booking.customer.user?.email || '',
      phone: booking.customer.user?.phone || '',
    };

    const business: BusinessDto = {
      id: booking.businessOwner.id,
      shopId: booking.businessOwner.shopId,
      businessName: booking.businessOwner.businessName,
      address: booking.businessOwner.addresses && booking.businessOwner.addresses.length > 0 ?
        `${booking.businessOwner.addresses[0].streetAddress}, ${booking.businessOwner.addresses[0].city}, ${booking.businessOwner.addresses[0].state}` :
        'Address not available',
      phone: booking.businessOwner.user?.phone || '',
    };

    const staff: StaffDto = {
      id: booking.staff.id,
      firstName: booking.staff.firstName,
      lastName: booking.staff.lastName,
      profilePic: booking.staff.profilePic,
      profilePicCdnUrl: booking.staff.profilePicCdnUrl,
    };

    const service: ServiceDto = {
      id: booking.service.id,
      name: booking.service.name,
      description: booking.service.description || '',
      defaultDuration: booking.service.defaultDuration || 0,
      basePrice: booking.service.basePrice || 0,
    };

    return {
      id: booking.id,
      appointmentDate: booking.appointmentDate instanceof Date
        ? booking.appointmentDate.toISOString().split('T')[0]
        : booking.appointmentDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      serviceLocation: booking.serviceLocation,
      totalAmount: booking.totalAmount,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      customer,
      business,
      staff,
      service,
    };
  }

  async previewDeliveryCharge(
    businessOwnerId: string,
    customerLatitude: number,
    customerLongitude: number,
    businessServiceIds?: string[],
    servicePackageIds?: string[],
  ): Promise<any> {
    // Calculate estimated order amount from services
    let estimatedOrderAmount = 0;

    // Calculate from service packages
    if (servicePackageIds && servicePackageIds.length > 0) {
      const servicePackages = await this.servicePackageRepository.find({
        where: {
          id: In(servicePackageIds),
          businessOwnerId,
          isActive: true,
        },
        relations: ['packageItems', 'packageItems.businessService'],
      });

      for (const servicePackage of servicePackages) {
        const packageServices = servicePackage.packageItems
          .filter(item => item.businessService?.isActive)
          .map(item => item.businessService);

        for (const businessService of packageServices) {
          const finalPrice = businessService.customPrice * (1 - servicePackage.discountPercentage / 100);
          estimatedOrderAmount += finalPrice;
        }
      }
    }

    // Calculate from individual services
    if (businessServiceIds && businessServiceIds.length > 0) {
      const businessServices = await this.businessServiceRepository.find({
        where: {
          id: In(businessServiceIds),
          businessOwnerId,
          isActive: true,
        },
      });

      for (const businessService of businessServices) {
        estimatedOrderAmount += businessService.customPrice;
      }
    }

    // Calculate delivery charges
    const deliveryCalculation = await this.deliveryChargeService.calculateDeliveryCharge(
      businessOwnerId,
      customerLatitude,
      customerLongitude,
      estimatedOrderAmount,
    );

    const finalTotal = estimatedOrderAmount + deliveryCalculation.totalDeliveryCharge;

    return {
      success: true,
      message: 'Delivery charge preview calculated successfully',
      data: {
        distanceKm: deliveryCalculation.distanceKm,
        baseCharge: deliveryCalculation.baseCharge,
        distanceCharge: deliveryCalculation.distanceCharge,
        totalDeliveryCharge: deliveryCalculation.totalDeliveryCharge,
        isFreeDelivery: deliveryCalculation.isFreeDelivery,
        freeDeliveryReason: deliveryCalculation.freeDeliveryReason,
        breakdown: deliveryCalculation.breakdown,
        estimatedOrderAmount,
        finalTotal,
      },
    };
  }

  async getCustomerTransactionHistory(customerId: string, startDate?: Date, endDate?: Date): Promise<CustomerTransactionHistoryResponseDto> {
    // Find customer and validate existence
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: ['user']
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Build query conditions
    const whereConditions: any = { customerId };
    
    if (startDate && endDate) {
      whereConditions.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      whereConditions.createdAt = Between(startDate, new Date());
    }

    // Fetch bookings with relations
    const bookings = await this.bookingRepository.find({
      where: whereConditions,
      relations: ['customer', 'customer.user', 'businessOwner', 'service'],
      order: { createdAt: 'DESC' }
    });

    // Group transactions by date
    const transactionsByDate = new Map<string, TransactionHistoryItemDto[]>();
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0];
      
      if (!transactionsByDate.has(bookingDate)) {
        transactionsByDate.set(bookingDate, []);
      }

      const customerName = customer.user?.email || 
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 
        'Unknown Customer';

      const transactionItem: TransactionHistoryItemDto = {
        bookingId: booking.id,
        customerName: customerName,
        bookingAmount: Number(booking.totalAmount),
        paymentMethod: booking.paymentMethod === PaymentMethodType.COD ? PaymentMethod.CASH : PaymentMethod.ONLINE,
        bookingDateTime: new Date(booking.createdAt)
      };

      transactionsByDate.get(bookingDate).push(transactionItem);
    });

    // Convert to day-wise format
    const dayWiseHistory: DayWiseTransactionHistoryDto[] = [];
    let totalAmount = 0;
    let totalTransactions = 0;

    for (const [date, transactions] of transactionsByDate.entries()) {
      const dayTotal = transactions.reduce((sum, transaction) => sum + transaction.bookingAmount, 0);
      
      dayWiseHistory.push({
        date: new Date(date),
        transactions: transactions,
        totalAmount: dayTotal,
        transactionCount: transactions.length
      });

      totalAmount += dayTotal;
      totalTransactions += transactions.length;
    }

    // Sort by date (newest first)
    dayWiseHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      customerId,
      dayWiseHistory,
      totalAmount,
      totalTransactions
    };
  }
}
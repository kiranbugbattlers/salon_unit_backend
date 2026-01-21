import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  BookingRequest,
  BookingRequestService as BookingRequestServiceEntity,
  BookingRequestStatus,
  Customer,
  BusinessOwner,
  BusinessService,
  Staff,
  StaffWorkingHours,
  BusinessOperatingHours,
  Booking,
  BookingStatus,
  ServiceLocation,
  ServicePackage,
  ServicePackageItem,
  BookingService as BookingServiceEntity,
} from '../database/entities';
import {
  CreateBookingRequestDto,
  AssignStaffDto,
  ApproveBookingRequestDto,
  RejectBookingRequestDto,
  BookingRequestQueryDto,
  BookingRequestResponseDto,
  BookingRequestListResponseDto,
  BookingRequestDetailDto,
  BusinessOwnerBookingRequestDetailDto,
  BusinessOwnerBookingRequestListResponseDto,
  BusinessOwnerBookingRequestResponseDto,
} from './dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingRequestService {
  constructor(
    @InjectRepository(BookingRequest)
    private readonly bookingRequestRepository: Repository<BookingRequest>,
    @InjectRepository(BookingRequestServiceEntity)
    private readonly bookingRequestServiceRepository: Repository<BookingRequestServiceEntity>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(BusinessService)
    private readonly businessServiceRepository: Repository<BusinessService>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(StaffWorkingHours)
    private readonly staffWorkingHoursRepository: Repository<StaffWorkingHours>,
    @InjectRepository(BusinessOperatingHours)
    private readonly businessOperatingHoursRepository: Repository<BusinessOperatingHours>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(ServicePackage)
    private readonly servicePackageRepository: Repository<ServicePackage>,
    @InjectRepository(ServicePackageItem)
    private readonly servicePackageItemRepository: Repository<ServicePackageItem>,
    @InjectRepository(BookingServiceEntity)
    private readonly bookingServiceRepository: Repository<BookingServiceEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async createBookingRequest(customerId: string, createDto: CreateBookingRequestDto): Promise<BookingRequestResponseDto> {
    // Validate that at least one service or package is provided
    const hasServices = createDto.businessServiceIds && createDto.businessServiceIds.length > 0;
    const hasPackages = createDto.servicePackageIds && createDto.servicePackageIds.length > 0;

    if (!hasServices && !hasPackages) {
      throw new BadRequestException('At least one business service or service package must be provided');
    }

    // Validate customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: ['user'],
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Validate business owner exists
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: createDto.businessOwnerId },
    });
    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    let servicesData: any[] = [];
    const allBusinessServiceIds = new Set<string>();

    // Handle service packages
    if (hasPackages) {
      const servicePackages = await this.servicePackageRepository.find({
        where: {
          id: In(createDto.servicePackageIds),
          businessOwnerId: createDto.businessOwnerId,
          isActive: true,
        },
        relations: ['packageItems', 'packageItems.businessService', 'packageItems.businessService.service'],
      });

      if (servicePackages.length !== createDto.servicePackageIds.length) {
        throw new NotFoundException('Some service packages not found or inactive');
      }

      // Process each package
      for (const servicePackage of servicePackages) {
        const packageServices = servicePackage.packageItems
          .filter(item => item.businessService?.isActive)
          .map(item => item.businessService);

        if (packageServices.length === 0) {
          throw new BadRequestException(`Service package "${servicePackage.name}" has no active services`);
        }

        // Add services from this package with discount
        for (const businessService of packageServices) {
          if (!allBusinessServiceIds.has(businessService.id)) {
            allBusinessServiceIds.add(businessService.id);
            const finalPrice = businessService.customPrice * (1 - servicePackage.discountPercentage / 100);
            const estimatedDuration = businessService.customDurationMinutes || businessService.service?.defaultDuration || 0;

            if (estimatedDuration === 0) {
              console.warn(`⚠️ Service ${businessService.id} has 0 duration. customDurationMinutes: ${businessService.customDurationMinutes}, defaultDuration: ${businessService.service?.defaultDuration}`);
            }

            servicesData.push({
              businessServiceId: businessService.id,
              estimatedPrice: finalPrice,
              estimatedDuration,
            });
          }
        }
      }
    }

    // Handle individual services
    if (hasServices) {
      // Validate business services exist and belong to the business
      const businessServices = await this.businessServiceRepository.find({
        where: {
          id: In(createDto.businessServiceIds),
          businessOwnerId: createDto.businessOwnerId,
          isActive: true,
        },
        relations: ['service'],
      });

      if (businessServices.length !== createDto.businessServiceIds.length) {
        throw new BadRequestException('Some business services not found or inactive');
      }

      // Add individual services (skip if already added from package)
      for (const businessService of businessServices) {
        if (!allBusinessServiceIds.has(businessService.id)) {
          allBusinessServiceIds.add(businessService.id);
          const estimatedDuration = businessService.customDurationMinutes || businessService.service?.defaultDuration || 0;

          if (estimatedDuration === 0) {
            console.warn(`⚠️ Service ${businessService.id} has 0 duration. customDurationMinutes: ${businessService.customDurationMinutes}, defaultDuration: ${businessService.service?.defaultDuration}`);
          }

          servicesData.push({
            businessServiceId: businessService.id,
            estimatedPrice: businessService.customPrice,
            estimatedDuration,
          });
        }
      }
    }

    if (servicesData.length === 0) {
      throw new BadRequestException('No valid services found for booking');
    }

    // Validate requested staff if provided
    let requestedStaff: Staff | null = null;
    if (createDto.requestedStaffId) {
      requestedStaff = await this.staffRepository.findOne({
        where: {
          id: createDto.requestedStaffId,
          businessOwnerId: createDto.businessOwnerId,
          isActive: true
        },
      });
      if (!requestedStaff) {
        throw new BadRequestException('Requested staff not found or not part of this business');
      }
    }

    // Validate business operating hours
    await this.validateBusinessHours(createDto);

    // Calculate total estimated price and duration from servicesData
    const totalEstimatedPrice = servicesData.reduce((sum, service) => sum + service.estimatedPrice, 0);
    const totalEstimatedDuration = servicesData.reduce((sum, service) => sum + service.estimatedDuration, 0);

    // Validate that total duration fits in requested time slot
    const requestedDurationMinutes = this.calculateDurationMinutes(
      createDto.requestedStartTime,
      createDto.requestedEndTime
    );

    if (totalEstimatedDuration > requestedDurationMinutes) {
      throw new BadRequestException(
        `Total estimated duration (${totalEstimatedDuration} minutes) exceeds requested time slot (${requestedDurationMinutes} minutes)`
      );
    }

    // Create booking request
    const bookingRequest = this.bookingRequestRepository.create({
      customerId,
      businessOwnerId: createDto.businessOwnerId,
      requestedDate: new Date(createDto.requestedDate),
      requestedStartTime: createDto.requestedStartTime,
      requestedEndTime: createDto.requestedEndTime,
      requestedStaffId: createDto.requestedStaffId,
      serviceLocation: createDto.serviceLocation || ServiceLocation.IN_SALON,
      totalEstimatedPrice,
      totalEstimatedDuration,
      servicePackageId: createDto.servicePackageIds && createDto.servicePackageIds.length > 0 ? createDto.servicePackageIds.join(',') : null,
      status: BookingRequestStatus.PENDING,
    });

    const savedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);

    // Create booking request services
    const bookingRequestServices = servicesData.map(serviceData =>
      this.bookingRequestServiceRepository.create({
        bookingRequestId: savedBookingRequest.id,
        businessServiceId: serviceData.businessServiceId,
        quantity: 1,
        estimatedPrice: serviceData.estimatedPrice,
        estimatedDuration: serviceData.estimatedDuration,
      })
    );

    await this.bookingRequestServiceRepository.save(bookingRequestServices);

    // Get full booking request with relations
    const fullBookingRequest = await this.getBookingRequestWithRelations(savedBookingRequest.id);

    return {
      code: 201,
      success: true,
      message: 'Booking request created successfully',
      data: this.transformToBookingRequestDto(fullBookingRequest),
    };
  }

  async getCustomerBookingRequests(customerId: string, query: BookingRequestQueryDto): Promise<BookingRequestListResponseDto> {
    const queryBuilder = this.bookingRequestRepository
      .createQueryBuilder('bookingRequest')
      .leftJoinAndSelect('bookingRequest.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('bookingRequest.businessOwner', 'businessOwner')
      .leftJoinAndSelect('businessOwner.addresses', 'businessAddresses')
      .leftJoinAndSelect('bookingRequest.requestedStaff', 'requestedStaff')
      .leftJoinAndSelect('bookingRequest.assignedStaff', 'assignedStaff')
      .leftJoinAndSelect('bookingRequest.bookingRequestServices', 'bookingRequestServices')
      .leftJoinAndSelect('bookingRequestServices.businessService', 'businessService')
      .leftJoinAndSelect('businessService.service', 'service')
      .leftJoinAndSelect('bookingRequest.confirmedBooking', 'confirmedBooking')
      .leftJoinAndSelect('bookingRequest.payment', 'payment')
      .where('CAST(bookingRequest.customerId AS TEXT) = CAST(:customerId AS TEXT)', { customerId });

    // Apply status filter (supports both database and virtual statuses)
    if (query.status) {
      switch (query.status) {
        case BookingRequestStatus.PENDING:
          // Database status - all pending requests
          queryBuilder.andWhere('bookingRequest.status = :status', { status: 'pending' });
          break;
        case BookingRequestStatus.STAFF_ASSIGNED:
          // Virtual status - pending with assigned staff
          queryBuilder
            .andWhere('bookingRequest.status = :status', { status: 'pending' })
            .andWhere('bookingRequest.assignedStaffId IS NOT NULL');
          break;
        case BookingRequestStatus.APPROVED:
          // Database status - all approved requests
          queryBuilder.andWhere('bookingRequest.status = :status', { status: 'approved' });
          break;
        case BookingRequestStatus.IN_PROGRESS:
          // Virtual status - service in progress
          queryBuilder
            .andWhere('bookingRequest.status = :status', { status: 'approved' })
            .andWhere('confirmedBooking.id IS NOT NULL')
            .andWhere('confirmedBooking.status = :bookingStatus', { bookingStatus: 'in-progress' });
          break;
        case BookingRequestStatus.COMPLETED:
          // Virtual status - service completed
          queryBuilder
            .andWhere('bookingRequest.status = :status', { status: 'approved' })
            .andWhere('confirmedBooking.id IS NOT NULL')
            .andWhere('confirmedBooking.status = :bookingStatus', { bookingStatus: 'completed' });
          break;
        case BookingRequestStatus.REJECTED:
          // Database status - rejected requests
          queryBuilder.andWhere('bookingRequest.status = :status', { status: 'rejected' });
          break;
        case BookingRequestStatus.CANCELLED:
          // Virtual status - rejected by customer
          queryBuilder
            .andWhere('bookingRequest.status = :status', { status: 'rejected' })
            .andWhere('bookingRequest.rejectionReason LIKE :cancelPattern', { cancelPattern: '%cancelled by customer%' });
          break;
        default:
          // Fallback: treat as direct database status
          queryBuilder.andWhere('bookingRequest.status = :status', { status: query.status });
      }
    }

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder
      .orderBy('bookingRequest.createdAt', 'DESC')
      .addOrderBy('bookingRequest.requestedDate', 'DESC')
      .skip(skip)
      .take(limit);

    const [bookingRequests, total] = await queryBuilder.getManyAndCount();

    return {
      code: 200,
      success: true,
      message: 'Customer booking requests retrieved successfully',
      data: bookingRequests.map(request => this.transformToBookingRequestDto(request)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBusinessOwnerBookingRequests(businessOwnerId: string, query: BookingRequestQueryDto): Promise<BusinessOwnerBookingRequestListResponseDto> {
    const queryBuilder = this.bookingRequestRepository
      .createQueryBuilder('bookingRequest')
      .leftJoinAndSelect('bookingRequest.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('bookingRequest.businessOwner', 'businessOwner')
      .leftJoinAndSelect('businessOwner.addresses', 'businessAddresses')
      .leftJoinAndSelect('bookingRequest.requestedStaff', 'requestedStaff')
      .leftJoinAndSelect('bookingRequest.assignedStaff', 'assignedStaff')
      .leftJoinAndSelect('bookingRequest.bookingRequestServices', 'bookingRequestServices')
      .leftJoinAndSelect('bookingRequestServices.businessService', 'businessService')
      .leftJoinAndSelect('businessService.service', 'service')
      .leftJoinAndSelect('bookingRequest.confirmedBooking', 'confirmedBooking')
      .leftJoinAndSelect('bookingRequest.payment', 'payment')
      .where('CAST(bookingRequest.businessOwnerId AS TEXT) = CAST(:businessOwnerId AS TEXT)', { businessOwnerId });

    // Filter by staff ID if provided
    if (query.staffId) {
      queryBuilder.andWhere('CAST(bookingRequest.assignedStaffId AS TEXT) = CAST(:staffId AS TEXT)', {
        staffId: query.staffId
      });
    }

    // Apply same filters as customer requests
    this.applyQueryFilters(queryBuilder, query);

    const [bookingRequests, total] = await queryBuilder.getManyAndCount();

    return {
      code: 200,
      success: true,
      message: 'Business owner booking requests retrieved successfully',
      data: bookingRequests.map(request => this.transformToBusinessOwnerBookingRequestDto(request)),
      meta: {
        total,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: Math.ceil(total / (query.limit || 10)),
      },
    };
  }

  async assignStaff(bookingRequestId: string, businessOwnerId: string, assignDto: AssignStaffDto): Promise<BookingRequestResponseDto> {
    const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId);

    if (!bookingRequest) {
      throw new NotFoundException('Booking request not found');
    }

    if (bookingRequest.businessOwnerId !== businessOwnerId) {
      throw new ForbiddenException('You can only manage your own business booking requests');
    }

    if (bookingRequest.status !== BookingRequestStatus.PENDING) {
      throw new BadRequestException('Can only assign staff to pending booking requests');
    }

    // Validate staff belongs to business
    const staff = await this.staffRepository.findOne({
      where: { id: assignDto.staffId, businessOwnerId, isActive: true },
    });
    if (!staff) {
      throw new BadRequestException('Staff member not found or not part of your business');
    }

    // Validate staff working hours if time is adjusted
    const startTime = assignDto.adjustedStartTime || bookingRequest.requestedStartTime;
    const endTime = assignDto.adjustedEndTime || bookingRequest.requestedEndTime;

    await this.validateStaffAvailability(assignDto.staffId, new Date(bookingRequest.requestedDate), startTime, endTime);

    // Check staff availability for the time slot (prevent double booking)
    await this.checkStaffAvailability(
      assignDto.staffId,
      bookingRequest.requestedDate,
      startTime,
      endTime
    );

    // Update booking request
    bookingRequest.assignedStaffId = assignDto.staffId;
    if (assignDto.adjustedStartTime) bookingRequest.approvedStartTime = assignDto.adjustedStartTime;
    if (assignDto.adjustedEndTime) bookingRequest.approvedEndTime = assignDto.adjustedEndTime;

    const updatedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);
    const fullBookingRequest = await this.getBookingRequestWithRelations(updatedBookingRequest.id);

    // Send notification to customer - staff assigned
    try {
      const dateTime = `${fullBookingRequest.requestedDate instanceof Date
        ? fullBookingRequest.requestedDate.toISOString().split('T')[0]
        : fullBookingRequest.requestedDate} at ${startTime}`;
      const staffName = `${staff.firstName} ${staff.lastName}`;

      await this.notificationService.sendToCustomer(
        fullBookingRequest.customer.userId,
        'BOOKING_REQUEST_STAFF_ASSIGNED',
        {
          bookingId: fullBookingRequest.id,
          staffName,
          dateTime,
          salonName: fullBookingRequest.businessOwner.businessName,
        }
      );
    } catch (error) {
      console.error('Failed to send staff assigned notification:', error);
    }

    return {
      code: 200,
      success: true,
      message: 'Staff assigned successfully',
      data: this.transformToBookingRequestDto(fullBookingRequest),
    };
  }

  async approveBookingRequest(bookingRequestId: string, businessOwnerId: string, approveDto: ApproveBookingRequestDto): Promise<BookingRequestResponseDto> {
    const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId);

    if (!bookingRequest) {
      throw new NotFoundException('Booking request not found');
    }

    if (bookingRequest.businessOwnerId !== businessOwnerId) {
      throw new ForbiddenException('You can only manage your own business booking requests');
    }

    if (bookingRequest.status !== BookingRequestStatus.PENDING) {
      throw new BadRequestException('Can only approve pending booking requests');
    }

    if (!bookingRequest.assignedStaffId) {
      throw new BadRequestException('Must assign staff before approving booking request');
    }

    // Re-check staff availability before approval (prevent race conditions)
    const startTime = bookingRequest.approvedStartTime || bookingRequest.requestedStartTime;
    const endTime = bookingRequest.approvedEndTime || bookingRequest.requestedEndTime;

    await this.checkStaffAvailability(
      bookingRequest.assignedStaffId,
      bookingRequest.requestedDate,
      startTime,
      endTime
    );

    // Generate service OTP (6-digit code) for starting the service
    const serviceOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update booking request status to APPROVED
    bookingRequest.status = BookingRequestStatus.APPROVED;
    if (approveDto.finalPrice) bookingRequest.finalPrice = approveDto.finalPrice;
    if (approveDto.businessNotes) bookingRequest.businessNotes = approveDto.businessNotes;

    const updatedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);

    // Get the first service from booking request for serviceId (legacy field)
    const firstBookingRequestService = await this.bookingRequestServiceRepository.findOne({
      where: { bookingRequestId: updatedBookingRequest.id },
      relations: ['businessService'],
    });

    if (!firstBookingRequestService) {
      throw new BadRequestException('Booking request must have at least one service');
    }

    // Create Booking entity immediately upon approval
    const booking = this.bookingRepository.create({
      bookingRequestId: updatedBookingRequest.id,
      customerId: updatedBookingRequest.customerId,
      businessOwnerId: updatedBookingRequest.businessOwnerId,
      staffId: updatedBookingRequest.assignedStaffId,
      serviceId: firstBookingRequestService.businessService.serviceId, // Legacy field - use first service
      appointmentDate: updatedBookingRequest.requestedDate,
      startTime: startTime,
      endTime: endTime,
      serviceLocation: updatedBookingRequest.serviceLocation,
      totalAmount: updatedBookingRequest.finalPrice || updatedBookingRequest.totalEstimatedPrice,
      specialRequests: updatedBookingRequest.specialRequests,
      status: BookingStatus.CONFIRMED,
      otpCode: serviceOtp, // Service OTP for starting the service
      customerAddress: updatedBookingRequest.customerAddress, // Copy customer address if at-home service
      deliveryCharge: updatedBookingRequest.deliveryCharge, // Copy delivery charge
      deliveryDistance: updatedBookingRequest.deliveryDistance, // Copy delivery distance
      paymentCompleted: false, // Payment happens after service completion
      addOnServicesTotal: 0, // Initialize add-on total to 0
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Copy all services from BookingRequest to Booking (original services)
    const bookingRequestServices = await this.bookingRequestServiceRepository.find({
      where: { bookingRequestId: updatedBookingRequest.id },
      relations: ['businessService', 'businessService.service'],
    });

    const bookingServices = bookingRequestServices.map(brs =>
      this.bookingServiceRepository.create({
        bookingId: savedBooking.id,
        businessServiceId: brs.businessServiceId,
        serviceId: brs.businessService.serviceId,
        serviceName: brs.businessService.service.name,
        price: brs.estimatedPrice,
        servicePrice: brs.estimatedPrice,
        durationMinutes: brs.estimatedDuration,
        serviceDuration: brs.estimatedDuration,
        isAddOn: false, // Original services from booking request
        addedAt: new Date(),
        customerApproved: true, // Customer already approved by creating the booking request
      })
    );

    await this.bookingServiceRepository.save(bookingServices);

    const finalBookingRequest = await this.getBookingRequestWithRelations(updatedBookingRequest.id);

    // Send notification to customer - booking approved with OTP
    try {
      const dateTime = `${finalBookingRequest.requestedDate instanceof Date
        ? finalBookingRequest.requestedDate.toISOString().split('T')[0]
        : finalBookingRequest.requestedDate} at ${startTime}`;

      await this.notificationService.sendToCustomer(
        finalBookingRequest.customer.userId,
        'BOOKING_REQUEST_APPROVED',
        {
          bookingId: finalBookingRequest.id,
          otp: serviceOtp,
          dateTime,
          salonName: finalBookingRequest.businessOwner.businessName,
        }
      );
    } catch (error) {
      console.error('Failed to send booking approved notification:', error);
    }

    return {
      code: 200,
      success: true,
      message: `Booking approved successfully! Booking ID: ${savedBooking.id}. Service OTP: ${serviceOtp}. Business can start service by verifying this OTP.`,
      data: this.transformToBookingRequestDto(finalBookingRequest),
    };
  }

  async rejectBookingRequest(bookingRequestId: string, businessOwnerId: string, rejectDto: RejectBookingRequestDto): Promise<BookingRequestResponseDto> {
    const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId);

    if (!bookingRequest) {
      throw new NotFoundException('Booking request not found');
    }

    if (bookingRequest.businessOwnerId !== businessOwnerId) {
      throw new ForbiddenException('You can only manage your own business booking requests');
    }

    if (bookingRequest.status !== BookingRequestStatus.PENDING) {
      throw new BadRequestException('Can only reject pending booking requests');
    }

    // Update booking request status
    bookingRequest.status = BookingRequestStatus.REJECTED;
    bookingRequest.rejectionReason = rejectDto.rejectionReason;

    const updatedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);
    const fullBookingRequest = await this.getBookingRequestWithRelations(updatedBookingRequest.id);

    // Send notification to customer - booking rejected
    try {
      const dateTime = `${fullBookingRequest.requestedDate instanceof Date
        ? fullBookingRequest.requestedDate.toISOString().split('T')[0]
        : fullBookingRequest.requestedDate} at ${fullBookingRequest.requestedStartTime}`;

      await this.notificationService.sendToCustomer(
        fullBookingRequest.customer.userId,
        'BOOKING_REQUEST_REJECTED',
        {
          bookingId: fullBookingRequest.id,
          salonName: fullBookingRequest.businessOwner.businessName,
          dateTime,
          reason: rejectDto.rejectionReason || 'No reason provided',
        }
      );
    } catch (error) {
      console.error('Failed to send booking rejected notification:', error);
    }

    return {
      code: 200,
      success: true,
      message: 'Booking request rejected successfully',
      data: this.transformToBookingRequestDto(fullBookingRequest),
    };
  }

  async verifyArrivalOtp(bookingRequestId: string, businessOwnerId: string, otpCode: string): Promise<any> {
    const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId);

    if (!bookingRequest) {
      throw new NotFoundException('Booking request not found');
    }

    // Verify business owner ownership
    if (bookingRequest.businessOwnerId !== businessOwnerId) {
      throw new ForbiddenException('You can only verify OTP for your own business booking requests');
    }

    // Check if booking request is in correct status
    if (bookingRequest.status !== BookingRequestStatus.APPROVED) {
      throw new BadRequestException('Booking request must be approved before OTP verification');
    }

    // Find the associated booking
    const booking = await this.bookingRepository.findOne({
      where: { bookingRequestId: bookingRequestId },
      relations: ['customer', 'customer.user', 'businessOwner', 'staff'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found for this booking request');
    }

    // Verify OTP code against Booking.otpCode (not arrivalOtp)
    if (booking.otpCode !== otpCode) {
      throw new BadRequestException('Invalid service OTP code');
    }

    // Check if OTP already verified
    if (booking.otpVerifiedAt) {
      throw new BadRequestException('Service has already been started');
    }

    // Update booking status to IN_PROGRESS and set timestamps
    booking.status = BookingStatus.IN_PROGRESS;
    booking.otpVerifiedAt = new Date();
    booking.serviceStartedAt = new Date();

    const updatedBooking = await this.bookingRepository.save(booking);

    return {
      code: 200,
      success: true,
      message: 'Service OTP verified successfully. Service has been started. Customer can make payment after service completion.',
      data: {
        bookingId: updatedBooking.id,
        bookingRequestId: bookingRequest.id,
        status: updatedBooking.status,
        serviceStartedAt: updatedBooking.serviceStartedAt,
        customer: {
          id: updatedBooking.customer.id,
          firstName: updatedBooking.customer.firstName,
          lastName: updatedBooking.customer.lastName,
          phone: updatedBooking.customer.user?.phone,
        },
        staff: {
          id: updatedBooking.staff.id,
          firstName: updatedBooking.staff.firstName,
          lastName: updatedBooking.staff.lastName,
        },
        totalAmount: updatedBooking.totalAmount,
        paymentCompleted: updatedBooking.paymentCompleted,
      },
    };
  }

  async cancelBookingRequest(bookingRequestId: string, customerId: string, cancellationReason?: string): Promise<BookingRequestResponseDto> {
    const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId);

    if (!bookingRequest) {
      throw new NotFoundException('Booking request not found');
    }

    // Verify ownership
    if (bookingRequest.customerId !== customerId) {
      throw new ForbiddenException('You can only cancel your own booking requests');
    }

    // Check if already cancelled
    if (bookingRequest.status === BookingRequestStatus.REJECTED) {
      throw new BadRequestException('Booking request has already been rejected by business owner');
    }

    // Check if already approved and payment completed (has confirmed booking)
    if (bookingRequest.confirmedBooking) {
      throw new BadRequestException(
        'This booking request has been confirmed and payment completed. Please cancel the confirmed booking instead using DELETE /api/v1/bookings/{bookingId}'
      );
    }

    // Update status to rejected (using rejection status for cancelled by customer)
    bookingRequest.status = BookingRequestStatus.REJECTED;
    bookingRequest.rejectionReason = cancellationReason || 'Cancelled by customer';

    const updatedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);
    const fullBookingRequest = await this.getBookingRequestWithRelations(updatedBookingRequest.id);

    // Send notification to business owner - customer cancelled
    try {
      const dateTime = `${fullBookingRequest.requestedDate instanceof Date
        ? fullBookingRequest.requestedDate.toISOString().split('T')[0]
        : fullBookingRequest.requestedDate} at ${fullBookingRequest.requestedStartTime}`;

      await this.notificationService.sendToBusinessOwner(
        fullBookingRequest.businessOwner.userId,
        'BOOKING_REQUEST_CANCELLED_BY_CUSTOMER',
        {
          bookingId: fullBookingRequest.id,
          customerName: `${fullBookingRequest.customer.firstName} ${fullBookingRequest.customer.lastName}`,
          dateTime,
          reason: cancellationReason || 'No reason provided',
        }
      );
    } catch (error) {
      console.error('Failed to send booking cancellation notification:', error);
    }

    return {
      code: 200,
      success: true,
      message: 'Booking request cancelled successfully',
      data: this.transformToBookingRequestDto(fullBookingRequest),
    };
  }

  // Private helper methods
  private async validateBusinessHours(createDto: CreateBookingRequestDto): Promise<void> {
    const requestedDate = new Date(createDto.requestedDate);
    const dayOfWeek = requestedDate.getDay();

    const businessHours = await this.businessOperatingHoursRepository.findOne({
      where: { businessOwnerId: createDto.businessOwnerId, dayOfWeek },
    });

    if (!businessHours || businessHours.isClosed) {
      throw new BadRequestException('Business is closed on the requested day');
    }

    if (createDto.requestedStartTime < businessHours.openTime || createDto.requestedEndTime > businessHours.closeTime) {
      throw new BadRequestException(
        `Requested time is outside business hours (${businessHours.openTime} - ${businessHours.closeTime})`
      );
    }
  }

  private async validateStaffAvailability(staffId: string, date: Date, startTime: string, endTime: string): Promise<void> {
    const dayOfWeek = date.getDay();

    const staffWorkingHours = await this.staffWorkingHoursRepository.findOne({
      where: { staffId, dayOfWeek, isActive: true },
    });

    // If no working hours are set for this staff member, skip validation (assume available)
    if (!staffWorkingHours) {
      return;
    }

    // Validate time is within staff working hours
    if (startTime < staffWorkingHours.startTime || endTime > staffWorkingHours.endTime) {
      throw new BadRequestException(
        `Staff member working hours: ${staffWorkingHours.startTime} - ${staffWorkingHours.endTime}`
      );
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private calculateDurationMinutes(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return endMinutes - startMinutes;
  }

  /**
   * Check if staff is available during the requested time slot
   * @throws BadRequestException if staff has conflicting bookings
   */
  private async checkStaffAvailability(
    staffId: string,
    date: Date | string,
    startTime: string,
    endTime: string
  ): Promise<void> {
    // Format date properly
    const appointmentDate = date instanceof Date
      ? date.toISOString().split('T')[0]
      : date;

    // Check for overlapping bookings
    const overlappingBooking = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.staff_id = :staffId', { staffId })
      .andWhere('booking.appointment_date = :date', { date: appointmentDate })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
      })
      .andWhere(`
        tsrange(
          booking.appointment_date + booking.start_time,
          booking.appointment_date + booking.end_time
        ) && tsrange(
          :startTime::timestamp,
          :endTime::timestamp
        )
      `, {
        startTime: `${appointmentDate} ${startTime}`,
        endTime: `${appointmentDate} ${endTime}`
      })
      .getOne();

    if (overlappingBooking) {
      throw new BadRequestException(
        `Staff is not available during the requested time slot (${startTime} - ${endTime}). ` +
        `There is an existing booking from ${overlappingBooking.startTime} to ${overlappingBooking.endTime}. ` +
        `Please choose a different time slot or assign a different staff member.`
      );
    }
  }

  private applyQueryFilters(queryBuilder: any, query: BookingRequestQueryDto): void {
    // Apply status filter (supports both database and virtual statuses)
    if (query.status) {
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
        case BookingRequestStatus.IN_PROGRESS:
          queryBuilder
            .andWhere('bookingRequest.status = :status', { status: 'approved' })
            .andWhere('confirmedBooking.id IS NOT NULL')
            .andWhere('confirmedBooking.status = :bookingStatus', { bookingStatus: 'in-progress' });
          break;
        case BookingRequestStatus.COMPLETED:
          queryBuilder
            .andWhere('bookingRequest.status = :status', { status: 'approved' })
            .andWhere('confirmedBooking.id IS NOT NULL')
            .andWhere('confirmedBooking.status = :bookingStatus', { bookingStatus: 'completed' });
          break;
        case BookingRequestStatus.REJECTED:
          queryBuilder.andWhere('bookingRequest.status = :status', { status: 'rejected' });
          break;
        case BookingRequestStatus.CANCELLED:
          queryBuilder
            .andWhere('bookingRequest.status = :status', { status: 'rejected' })
            .andWhere('bookingRequest.rejectionReason LIKE :cancelPattern', { cancelPattern: '%cancelled by customer%' });
          break;
        default:
          queryBuilder.andWhere('bookingRequest.status = :status', { status: query.status });
      }
    }

    if (query.serviceLocation) {
      queryBuilder.andWhere('bookingRequest.serviceLocation = :serviceLocation', { serviceLocation: query.serviceLocation });
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder
      .orderBy('bookingRequest.createdAt', 'DESC')
      .addOrderBy('bookingRequest.requestedDate', 'DESC')
      .skip(skip)
      .take(limit);
  }

  private async getBookingRequestWithRelations(
    bookingRequestId: string,
    includeBookingServices = false,
  ): Promise<BookingRequest> {
    const relations = [
      'customer',
      'customer.user',
      'businessOwner',
      'businessOwner.addresses',
      'requestedStaff',
      'assignedStaff',
      'bookingRequestServices',
      'bookingRequestServices.businessService',
      'bookingRequestServices.businessService.service',
      'confirmedBooking',
      'payment',
    ];

    // Conditionally add booking services relations for detail endpoint
    if (includeBookingServices) {
      relations.push(
        'confirmedBooking.bookingServices',
        'confirmedBooking.bookingServices.businessService',
        'confirmedBooking.bookingServices.service',
      );
    }

    return this.bookingRequestRepository.findOne({
      where: { id: bookingRequestId },
      relations,
    });
  }

  private computeLifecycleFlags(bookingRequest: BookingRequest) {
    const hasAssignedStaff = !!bookingRequest.assignedStaffId;
    const hasConfirmedBooking = !!bookingRequest.confirmedBooking;
    const bookingStatus = bookingRequest.confirmedBooking?.status;
    const isRejected = bookingRequest.status === BookingRequestStatus.REJECTED;
    const isPending = bookingRequest.status === BookingRequestStatus.PENDING;
    const isApproved = bookingRequest.status === BookingRequestStatus.APPROVED;

    // Compute lifecycle state using extended BookingRequestStatus enum
    let lifecycleState: BookingRequestStatus;
    if (isRejected) {
      // Could be customer cancelled - check rejection reason
      const isCancelled = bookingRequest.rejectionReason?.toLowerCase().includes('cancelled by customer');
      lifecycleState = isCancelled ? BookingRequestStatus.CANCELLED : BookingRequestStatus.REJECTED;
    } else if (isApproved && hasConfirmedBooking) {
      // Check booking status to determine exact lifecycle state
      if (bookingStatus === BookingStatus.COMPLETED) {
        lifecycleState = BookingRequestStatus.COMPLETED;
      } else if (bookingStatus === BookingStatus.IN_PROGRESS) {
        lifecycleState = BookingRequestStatus.IN_PROGRESS;
      } else if (bookingStatus === BookingStatus.CONFIRMED) {
        // Booking confirmed but not yet started - awaiting service start and payment
        lifecycleState = BookingRequestStatus.AWAITING_PAYMENT;
      } else {
        // Default to APPROVED for other booking statuses
        lifecycleState = BookingRequestStatus.APPROVED;
      }
    } else if (isApproved) {
      // Approved but no confirmed booking yet (waiting for service to start)
      lifecycleState = BookingRequestStatus.AWAITING_PAYMENT;
    } else if (isPending && hasAssignedStaff) {
      lifecycleState = BookingRequestStatus.STAFF_ASSIGNED;
    } else {
      lifecycleState = BookingRequestStatus.PENDING;
    }

    return {
      lifecycleState,
      isStaffAssigned: hasAssignedStaff,
      isApproved: isApproved,
      isPaymentPending: false, // Payment happens after service now
      isPaymentCompleted: isApproved && hasConfirmedBooking && bookingRequest.confirmedBooking?.paymentCompleted,
      isConfirmed: hasConfirmedBooking,
      canCancel: (isPending || (isApproved && !hasConfirmedBooking)),
      canPay: false, // Payment not via booking request anymore
      requiresAction: isPending && hasAssignedStaff,
    };
  }

  private transformToBookingRequestDto(bookingRequest: BookingRequest): BookingRequestDetailDto {
    const lifecycleFlags = this.computeLifecycleFlags(bookingRequest);

    // Transform payment info based on payment method
    let paymentInfo = null;
    if (bookingRequest.payment) {
      const payment = bookingRequest.payment;
      const isOnline = payment.paymentMethod && payment.paymentMethod !== 'cod';

      paymentInfo = {
        paymentMethod: payment.paymentMethod || null,
        paymentStatus: bookingRequest.paymentStatus || 'not_required',
        amount: payment.amount,
        // Only include Razorpay fields for online payments
        ...(isOnline && {
          razorpayPaymentId: payment.razorpayPaymentId || null,
          paymentCompletedAt: payment.paymentCompletedAt || null,
        }),
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
      serviceLocation: bookingRequest.serviceLocation || ServiceLocation.IN_SALON,
      totalEstimatedPrice: bookingRequest.totalEstimatedPrice,
      totalEstimatedDuration: bookingRequest.totalEstimatedDuration,
      rejectionReason: bookingRequest.rejectionReason,
      businessNotes: bookingRequest.businessNotes,
      approvedStartTime: bookingRequest.approvedStartTime,
      approvedEndTime: bookingRequest.approvedEndTime,
      finalPrice: bookingRequest.finalPrice,
      createdAt: bookingRequest.createdAt,
      updatedAt: bookingRequest.updatedAt,
      customer: {
        id: bookingRequest.customer.id,
        firstName: bookingRequest.customer.firstName,
        lastName: bookingRequest.customer.lastName,
        email: bookingRequest.customer.user?.email || '',
        phone: bookingRequest.customer.user?.phone || '',
      },
      business: {
        id: bookingRequest.businessOwner.id,
        shopId: bookingRequest.businessOwner.shopId,
        businessName: bookingRequest.businessOwner.businessName,
        address: bookingRequest.businessOwner.addresses && bookingRequest.businessOwner.addresses.length > 0 ?
          `${bookingRequest.businessOwner.addresses[0].streetAddress}, ${bookingRequest.businessOwner.addresses[0].city}` :
          'Address not available',
      },
      requestedStaff: bookingRequest.requestedStaff ? {
        id: bookingRequest.requestedStaff.id,
        firstName: bookingRequest.requestedStaff.firstName,
        lastName: bookingRequest.requestedStaff.lastName,
      } : undefined,
      assignedStaff: bookingRequest.assignedStaff ? {
        id: bookingRequest.assignedStaff.id,
        firstName: bookingRequest.assignedStaff.firstName,
        lastName: bookingRequest.assignedStaff.lastName,
      } : undefined,
      services: bookingRequest.bookingRequestServices?.map(brs => ({
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
      })) || [],
      confirmedBookingId: bookingRequest.confirmedBooking?.id,
      otpCode: bookingRequest.confirmedBooking?.otpCode,
      ...lifecycleFlags,
      // Booking fields (from confirmed booking)
      bookingStatus: bookingRequest.confirmedBooking?.status,
      otpVerifiedAt: bookingRequest.confirmedBooking?.otpVerifiedAt,
      serviceStartedAt: bookingRequest.confirmedBooking?.serviceStartedAt,
      serviceCompletedAt: bookingRequest.confirmedBooking?.serviceCompletedAt,
      // Payment information (minimal, varies by payment method)
      paymentInfo,
      // Customer address and delivery information (for at-home services)
      customerAddress: bookingRequest.customerAddress,
      deliveryCharge: bookingRequest.deliveryCharge,
      deliveryDistance: bookingRequest.deliveryDistance,
    };
  }

  private transformToBusinessOwnerBookingRequestDto(bookingRequest: BookingRequest): BusinessOwnerBookingRequestDetailDto {
    const lifecycleFlags = this.computeLifecycleFlags(bookingRequest);

    // Transform payment info based on payment method
    let paymentInfo = null;
    if (bookingRequest.payment) {
      const payment = bookingRequest.payment;
      const isOnline = payment.paymentMethod && payment.paymentMethod !== 'cod';

      paymentInfo = {
        paymentMethod: payment.paymentMethod || null,
        paymentStatus: bookingRequest.paymentStatus || 'not_required',
        amount: payment.amount,
        // Only include Razorpay fields for online payments
        ...(isOnline && {
          razorpayPaymentId: payment.razorpayPaymentId || null,
          paymentCompletedAt: payment.paymentCompletedAt || null,
        }),
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
      serviceLocation: bookingRequest.serviceLocation || ServiceLocation.IN_SALON,
      totalEstimatedPrice: bookingRequest.totalEstimatedPrice,
      totalEstimatedDuration: bookingRequest.totalEstimatedDuration,
      rejectionReason: bookingRequest.rejectionReason,
      businessNotes: bookingRequest.businessNotes,
      approvedStartTime: bookingRequest.approvedStartTime,
      approvedEndTime: bookingRequest.approvedEndTime,
      finalPrice: bookingRequest.finalPrice,
      createdAt: bookingRequest.createdAt,
      updatedAt: bookingRequest.updatedAt,
      customer: {
        id: bookingRequest.customer.id,
        firstName: bookingRequest.customer.firstName,
        lastName: bookingRequest.customer.lastName,
        email: bookingRequest.customer.user?.email || '',
        phone: bookingRequest.customer.user?.phone || '',
      },
      business: {
        id: bookingRequest.businessOwner.id,
        shopId: bookingRequest.businessOwner.shopId,
        businessName: bookingRequest.businessOwner.businessName,
        address: bookingRequest.businessOwner.addresses && bookingRequest.businessOwner.addresses.length > 0 ?
          `${bookingRequest.businessOwner.addresses[0].streetAddress}, ${bookingRequest.businessOwner.addresses[0].city}` :
          'Address not available',
      },
      requestedStaff: bookingRequest.requestedStaff ? {
        id: bookingRequest.requestedStaff.id,
        firstName: bookingRequest.requestedStaff.firstName,
        lastName: bookingRequest.requestedStaff.lastName,
      } : undefined,
      assignedStaff: bookingRequest.assignedStaff ? {
        id: bookingRequest.assignedStaff.id,
        firstName: bookingRequest.assignedStaff.firstName,
        lastName: bookingRequest.assignedStaff.lastName,
      } : undefined,
      services: bookingRequest.bookingRequestServices?.map(brs => ({
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
      })) || [],
      confirmedBookingId: bookingRequest.confirmedBooking?.id,
      ...lifecycleFlags,
      // Booking fields (from confirmed booking)
      bookingStatus: bookingRequest.confirmedBooking?.status,
      otpVerifiedAt: bookingRequest.confirmedBooking?.otpVerifiedAt,
      serviceStartedAt: bookingRequest.confirmedBooking?.serviceStartedAt,
      serviceCompletedAt: bookingRequest.confirmedBooking?.serviceCompletedAt,
      // Payment information (minimal, varies by payment method)
      paymentInfo,
      // Customer address and delivery information (for at-home services)
      customerAddress: bookingRequest.customerAddress,
      deliveryCharge: bookingRequest.deliveryCharge,
      deliveryDistance: bookingRequest.deliveryDistance,
      // Note: otpCode is intentionally excluded for business owner security
    };
  }

  /**
   * Get a single booking request by ID for authenticated customer (with detailed breakdown)
   */
  async getCustomerBookingRequestById(
    customerId: string,
    bookingRequestId: string,
  ): Promise<BookingRequestResponseDto> {
    // Load booking request with extended relations (including bookingServices)
    const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId, true);

    if (!bookingRequest) {
      throw new NotFoundException('Booking request not found');
    }

    // Security check: Verify customer owns this booking request
    if (bookingRequest.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this booking request');
    }

    // Transform to detailed DTO (includes bookingDetails)
    const detailedDto = await this.transformToDetailedBookingRequestDto(bookingRequest);

    return {
      code: 200,
      success: true,
      message: 'Booking request retrieved successfully',
      data: detailedDto,
    };
  }

  /**
   * Transform booking request to detailed DTO with bookingDetails breakdown
   */
  private async transformToDetailedBookingRequestDto(
    bookingRequest: BookingRequest,
  ): Promise<BookingRequestDetailDto> {
    // First, get base booking request DTO using existing transformation
    const baseDto = await this.transformToBookingRequestDto(bookingRequest);

    // If no confirmed booking exists, return base DTO with null bookingDetails
    if (!bookingRequest.confirmedBooking || !bookingRequest.confirmedBooking.bookingServices) {
      return {
        ...baseDto,
        bookingDetails: null,
      };
    }

    const confirmedBooking = bookingRequest.confirmedBooking;
    const allBookingServices = confirmedBooking.bookingServices || [];

    // Separate original services from add-on services
    const originalServices = allBookingServices.filter(bs => !bs.isAddOn);
    const addOnServices = allBookingServices.filter(bs => bs.isAddOn);

    // Transform booking services to DTOs
    const transformBookingService = (bs: BookingServiceEntity) => ({
      id: bs.id,
      bookingId: bs.bookingId,
      businessServiceId: bs.businessServiceId,
      serviceId: bs.serviceId,
      serviceName: bs.serviceName,
      price: Number(bs.price),
      servicePrice: Number(bs.servicePrice),
      durationMinutes: bs.durationMinutes,
      serviceDuration: bs.serviceDuration,
      isAddOn: bs.isAddOn,
      addedAt: bs.addedAt,
      addedByStaffId: bs.addedByStaffId,
      customerApproved: bs.customerApproved,
      approvedAt: bs.approvedAt,
      rejectedAt: bs.rejectedAt,
      packageId: bs.packageId,
      packageName: bs.packageName,
      createdAt: bs.createdAt,
      updatedAt: bs.updatedAt,
    });

    const allServicesDtos = allBookingServices.map(transformBookingService);
    const originalServicesDtos = originalServices.map(transformBookingService);
    const addOnServicesDtos = addOnServices.map(transformBookingService);

    // Separate pending and approved add-ons
    const pendingAddOnServices = addOnServices.filter(bs => !bs.customerApproved);
    const approvedAddOnServices = addOnServices.filter(bs => bs.customerApproved);
    const pendingAddOnServicesDtos = pendingAddOnServices.map(transformBookingService);
    const approvedAddOnServicesDtos = approvedAddOnServices.map(transformBookingService);
    const pendingAddOnServicesTotal = pendingAddOnServices.reduce((sum, bs) => sum + Number(bs.price), 0);

    // Calculate service summary
    const totalDuration = allBookingServices.reduce((sum, bs) => sum + bs.durationMinutes, 0);

    // Calculate estimated end time
    let estimatedEndTime: string | undefined;
    if (confirmedBooking.appointmentDate && bookingRequest.approvedStartTime) {
      const [hours, minutes] = bookingRequest.approvedStartTime.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + totalDuration;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      estimatedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    }

    // Build bookingDetails object
    const bookingDetails = {
      totalAmount: Number(confirmedBooking.totalAmount),
      originalAmount: Number(bookingRequest.totalEstimatedPrice),
      addOnServicesTotal: Number(confirmedBooking.addOnServicesTotal || 0),
      deliveryCharge: Number(confirmedBooking.deliveryCharge || 0),
      paymentCompleted: confirmedBooking.paymentCompleted || false,
      allServices: allServicesDtos,
      originalServices: originalServicesDtos,
      addOnServices: addOnServicesDtos,
      pendingAddOnServices: pendingAddOnServicesDtos,
      approvedAddOnServices: approvedAddOnServicesDtos,
      pendingAddOnServicesTotal,
      serviceSummary: {
        originalServicesCount: originalServices.length,
        addOnServicesCount: addOnServices.length,
        totalServicesCount: allBookingServices.length,
        totalDuration,
        estimatedEndTime,
      },
    };

    return {
      ...baseDto,
      bookingDetails,
    };
  }

  /**
   * Get a single booking request by ID for authenticated business owner (with detailed breakdown)
   */
  async getBusinessOwnerBookingRequestById(
    businessOwnerId: string,
    bookingRequestId: string,
  ): Promise<BusinessOwnerBookingRequestResponseDto> {
    // Load booking request with extended relations (including bookingServices)
    const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId, true);

    if (!bookingRequest) {
      throw new NotFoundException('Booking request not found');
    }

    // Security check: Verify business owner owns this booking request
    if (bookingRequest.businessOwnerId !== businessOwnerId) {
      throw new ForbiddenException('You do not have access to this booking request');
    }

    // Transform to detailed DTO (includes bookingDetails, excludes otpCode/arrivalOtp)
    const detailedDto = await this.transformToDetailedBusinessOwnerBookingRequestDto(bookingRequest);

    return {
      code: 200,
      success: true,
      message: 'Booking request retrieved successfully',
      data: detailedDto,
    };
  }

  /**
   * Transform booking request to detailed business owner DTO with bookingDetails breakdown
   * Note: Excludes otpCode and arrivalOtp for security
   */
  private async transformToDetailedBusinessOwnerBookingRequestDto(
    bookingRequest: BookingRequest,
  ): Promise<BusinessOwnerBookingRequestDetailDto> {
    // First, get base booking request DTO using existing transformation
    const baseDto = await this.transformToBusinessOwnerBookingRequestDto(bookingRequest);

    // If no confirmed booking exists, return base DTO with null bookingDetails
    if (!bookingRequest.confirmedBooking || !bookingRequest.confirmedBooking.bookingServices) {
      return {
        ...baseDto,
        bookingDetails: null,
      };
    }

    const confirmedBooking = bookingRequest.confirmedBooking;
    const allBookingServices = confirmedBooking.bookingServices || [];

    // Separate original services from add-on services
    const originalServices = allBookingServices.filter(bs => !bs.isAddOn);
    const addOnServices = allBookingServices.filter(bs => bs.isAddOn);

    // Transform booking services to DTOs
    const transformBookingService = (bs: BookingServiceEntity) => ({
      id: bs.id,
      bookingId: bs.bookingId,
      businessServiceId: bs.businessServiceId,
      serviceId: bs.serviceId,
      serviceName: bs.serviceName,
      price: Number(bs.price),
      servicePrice: Number(bs.servicePrice),
      durationMinutes: bs.durationMinutes,
      serviceDuration: bs.serviceDuration,
      isAddOn: bs.isAddOn,
      addedAt: bs.addedAt,
      addedByStaffId: bs.addedByStaffId,
      customerApproved: bs.customerApproved,
      approvedAt: bs.approvedAt,
      rejectedAt: bs.rejectedAt,
      packageId: bs.packageId,
      packageName: bs.packageName,
      createdAt: bs.createdAt,
      updatedAt: bs.updatedAt,
    });

    const allServicesDtos = allBookingServices.map(transformBookingService);
    const originalServicesDtos = originalServices.map(transformBookingService);
    const addOnServicesDtos = addOnServices.map(transformBookingService);

    // Separate pending and approved add-ons
    const pendingAddOnServices = addOnServices.filter(bs => !bs.customerApproved);
    const approvedAddOnServices = addOnServices.filter(bs => bs.customerApproved);
    const pendingAddOnServicesDtos = pendingAddOnServices.map(transformBookingService);
    const approvedAddOnServicesDtos = approvedAddOnServices.map(transformBookingService);
    const pendingAddOnServicesTotal = pendingAddOnServices.reduce((sum, bs) => sum + Number(bs.price), 0);

    // Calculate service summary
    const totalDuration = allBookingServices.reduce((sum, bs) => sum + bs.durationMinutes, 0);

    // Calculate estimated end time
    let estimatedEndTime: string | undefined;
    if (confirmedBooking.appointmentDate && bookingRequest.approvedStartTime) {
      const [hours, minutes] = bookingRequest.approvedStartTime.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + totalDuration;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      estimatedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    }

    // Build bookingDetails object
    const bookingDetails = {
      totalAmount: Number(confirmedBooking.totalAmount),
      originalAmount: Number(bookingRequest.totalEstimatedPrice),
      addOnServicesTotal: Number(confirmedBooking.addOnServicesTotal || 0),
      deliveryCharge: Number(confirmedBooking.deliveryCharge || 0),
      paymentCompleted: confirmedBooking.paymentCompleted || false,
      allServices: allServicesDtos,
      originalServices: originalServicesDtos,
      addOnServices: addOnServicesDtos,
      pendingAddOnServices: pendingAddOnServicesDtos,
      approvedAddOnServices: approvedAddOnServicesDtos,
      pendingAddOnServicesTotal,
      serviceSummary: {
        originalServicesCount: originalServices.length,
        addOnServicesCount: addOnServices.length,
        totalServicesCount: allBookingServices.length,
        totalDuration,
        estimatedEndTime,
      },
    };

    return {
      ...baseDto,
      bookingDetails,
    };
  }
}
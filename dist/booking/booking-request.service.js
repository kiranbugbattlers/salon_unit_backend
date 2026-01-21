"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRequestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const notification_service_1 = require("../notification/notification.service");
let BookingRequestService = class BookingRequestService {
    constructor(bookingRequestRepository, bookingRequestServiceRepository, customerRepository, businessOwnerRepository, businessServiceRepository, staffRepository, staffWorkingHoursRepository, businessOperatingHoursRepository, bookingRepository, servicePackageRepository, servicePackageItemRepository, bookingServiceRepository, notificationService) {
        this.bookingRequestRepository = bookingRequestRepository;
        this.bookingRequestServiceRepository = bookingRequestServiceRepository;
        this.customerRepository = customerRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.businessServiceRepository = businessServiceRepository;
        this.staffRepository = staffRepository;
        this.staffWorkingHoursRepository = staffWorkingHoursRepository;
        this.businessOperatingHoursRepository = businessOperatingHoursRepository;
        this.bookingRepository = bookingRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.servicePackageItemRepository = servicePackageItemRepository;
        this.bookingServiceRepository = bookingServiceRepository;
        this.notificationService = notificationService;
    }
    async createBookingRequest(customerId, createDto) {
        const hasServices = createDto.businessServiceIds && createDto.businessServiceIds.length > 0;
        const hasPackages = createDto.servicePackageIds && createDto.servicePackageIds.length > 0;
        if (!hasServices && !hasPackages) {
            throw new common_1.BadRequestException('At least one business service or service package must be provided');
        }
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
            relations: ['user'],
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: createDto.businessOwnerId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        let servicesData = [];
        const allBusinessServiceIds = new Set();
        if (hasPackages) {
            const servicePackages = await this.servicePackageRepository.find({
                where: {
                    id: (0, typeorm_2.In)(createDto.servicePackageIds),
                    businessOwnerId: createDto.businessOwnerId,
                    isActive: true,
                },
                relations: ['packageItems', 'packageItems.businessService', 'packageItems.businessService.service'],
            });
            if (servicePackages.length !== createDto.servicePackageIds.length) {
                throw new common_1.NotFoundException('Some service packages not found or inactive');
            }
            for (const servicePackage of servicePackages) {
                const packageServices = servicePackage.packageItems
                    .filter(item => item.businessService?.isActive)
                    .map(item => item.businessService);
                if (packageServices.length === 0) {
                    throw new common_1.BadRequestException(`Service package "${servicePackage.name}" has no active services`);
                }
                for (const businessService of packageServices) {
                    if (!allBusinessServiceIds.has(businessService.id)) {
                        allBusinessServiceIds.add(businessService.id);
                        let finalPrice = businessService.customPrice * (1 - servicePackage.discountPercentage / 100);
                        if (createDto.serviceLocation === entities_1.ServiceLocation.AT_HOME) {
                            finalPrice = finalPrice * 2;
                        }
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
        if (hasServices) {
            const businessServices = await this.businessServiceRepository.find({
                where: {
                    id: (0, typeorm_2.In)(createDto.businessServiceIds),
                    businessOwnerId: createDto.businessOwnerId,
                    isActive: true,
                },
                relations: ['service'],
            });
            if (businessServices.length !== createDto.businessServiceIds.length) {
                throw new common_1.BadRequestException('Some business services not found or inactive');
            }
            for (const businessService of businessServices) {
                if (!allBusinessServiceIds.has(businessService.id)) {
                    allBusinessServiceIds.add(businessService.id);
                    let estimatedPrice = businessService.customPrice;
                    if (createDto.serviceLocation === entities_1.ServiceLocation.AT_HOME) {
                        estimatedPrice = estimatedPrice * 2;
                    }
                    const estimatedDuration = businessService.customDurationMinutes || businessService.service?.defaultDuration || 0;
                    if (estimatedDuration === 0) {
                        console.warn(`⚠️ Service ${businessService.id} has 0 duration. customDurationMinutes: ${businessService.customDurationMinutes}, defaultDuration: ${businessService.service?.defaultDuration}`);
                    }
                    servicesData.push({
                        businessServiceId: businessService.id,
                        estimatedPrice: estimatedPrice,
                        estimatedDuration,
                    });
                }
            }
        }
        if (servicesData.length === 0) {
            throw new common_1.BadRequestException('No valid services found for booking');
        }
        let requestedStaff = null;
        if (createDto.requestedStaffId) {
            requestedStaff = await this.staffRepository.findOne({
                where: {
                    id: createDto.requestedStaffId,
                    businessOwnerId: createDto.businessOwnerId,
                    isActive: true
                },
            });
            if (!requestedStaff) {
                throw new common_1.BadRequestException('Requested staff not found or not part of this business');
            }
        }
        await this.validateBusinessHours(createDto);
        const totalEstimatedPrice = servicesData.reduce((sum, service) => sum + service.estimatedPrice, 0);
        const totalEstimatedDuration = servicesData.reduce((sum, service) => sum + service.estimatedDuration, 0);
        const requestedDurationMinutes = this.calculateDurationMinutes(createDto.requestedStartTime, createDto.requestedEndTime);
        if (totalEstimatedDuration > requestedDurationMinutes) {
            throw new common_1.BadRequestException(`Total estimated duration (${totalEstimatedDuration} minutes) exceeds requested time slot (${requestedDurationMinutes} minutes)`);
        }
        const bookingRequest = this.bookingRequestRepository.create({
            customerId,
            businessOwnerId: createDto.businessOwnerId,
            requestedDate: new Date(createDto.requestedDate),
            requestedStartTime: createDto.requestedStartTime,
            requestedEndTime: createDto.requestedEndTime,
            requestedStaffId: createDto.requestedStaffId,
            serviceLocation: createDto.serviceLocation || entities_1.ServiceLocation.IN_SALON,
            totalEstimatedPrice,
            totalEstimatedDuration,
            servicePackageId: createDto.servicePackageIds && createDto.servicePackageIds.length > 0 ? createDto.servicePackageIds.join(',') : null,
            status: entities_1.BookingRequestStatus.PENDING,
        });
        const savedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);
        const bookingRequestServices = servicesData.map(serviceData => this.bookingRequestServiceRepository.create({
            bookingRequestId: savedBookingRequest.id,
            businessServiceId: serviceData.businessServiceId,
            quantity: 1,
            estimatedPrice: serviceData.estimatedPrice,
            estimatedDuration: serviceData.estimatedDuration,
        }));
        await this.bookingRequestServiceRepository.save(bookingRequestServices);
        const fullBookingRequest = await this.getBookingRequestWithRelations(savedBookingRequest.id);
        return {
            code: 201,
            success: true,
            message: 'Booking request created successfully',
            data: this.transformToBookingRequestDto(fullBookingRequest),
        };
    }
    async getCustomerBookingRequests(customerId, query) {
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
        if (query.status) {
            switch (query.status) {
                case entities_1.BookingRequestStatus.PENDING:
                    queryBuilder.andWhere('bookingRequest.status = :status', { status: 'pending' });
                    break;
                case entities_1.BookingRequestStatus.STAFF_ASSIGNED:
                    queryBuilder
                        .andWhere('bookingRequest.status = :status', { status: 'pending' })
                        .andWhere('bookingRequest.assignedStaffId IS NOT NULL');
                    break;
                case entities_1.BookingRequestStatus.APPROVED:
                    queryBuilder.andWhere('bookingRequest.status = :status', { status: 'approved' });
                    break;
                case entities_1.BookingRequestStatus.IN_PROGRESS:
                    queryBuilder
                        .andWhere('bookingRequest.status = :status', { status: 'approved' })
                        .andWhere('confirmedBooking.id IS NOT NULL')
                        .andWhere('confirmedBooking.status = :bookingStatus', { bookingStatus: 'in-progress' });
                    break;
                case entities_1.BookingRequestStatus.COMPLETED:
                    queryBuilder
                        .andWhere('bookingRequest.status = :status', { status: 'approved' })
                        .andWhere('confirmedBooking.id IS NOT NULL')
                        .andWhere('confirmedBooking.status = :bookingStatus', { bookingStatus: 'completed' });
                    break;
                case entities_1.BookingRequestStatus.REJECTED:
                    queryBuilder.andWhere('bookingRequest.status = :status', { status: 'rejected' });
                    break;
                case entities_1.BookingRequestStatus.CANCELLED:
                    queryBuilder
                        .andWhere('bookingRequest.status = :status', { status: 'rejected' })
                        .andWhere('bookingRequest.rejectionReason LIKE :cancelPattern', { cancelPattern: '%cancelled by customer%' });
                    break;
                default:
                    queryBuilder.andWhere('bookingRequest.status = :status', { status: query.status });
            }
        }
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
    async getBusinessOwnerBookingRequests(businessOwnerId, query) {
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
        if (query.staffId) {
            queryBuilder.andWhere('CAST(bookingRequest.assignedStaffId AS TEXT) = CAST(:staffId AS TEXT)', {
                staffId: query.staffId
            });
        }
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
    async assignStaff(bookingRequestId, businessOwnerId, assignDto) {
        const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId);
        if (!bookingRequest) {
            throw new common_1.NotFoundException('Booking request not found');
        }
        if (bookingRequest.businessOwnerId !== businessOwnerId) {
            throw new common_1.ForbiddenException('You can only manage your own business booking requests');
        }
        if (bookingRequest.status !== entities_1.BookingRequestStatus.PENDING) {
            throw new common_1.BadRequestException('Can only assign staff to pending booking requests');
        }
        const staff = await this.staffRepository.findOne({
            where: { id: assignDto.staffId, businessOwnerId, isActive: true },
        });
        if (!staff) {
            throw new common_1.BadRequestException('Staff member not found or not part of your business');
        }
        const startTime = assignDto.adjustedStartTime || bookingRequest.requestedStartTime;
        const endTime = assignDto.adjustedEndTime || bookingRequest.requestedEndTime;
        await this.validateStaffAvailability(assignDto.staffId, new Date(bookingRequest.requestedDate), startTime, endTime);
        await this.checkStaffAvailability(assignDto.staffId, bookingRequest.requestedDate, startTime, endTime);
        bookingRequest.assignedStaffId = assignDto.staffId;
        if (assignDto.adjustedStartTime)
            bookingRequest.approvedStartTime = assignDto.adjustedStartTime;
        if (assignDto.adjustedEndTime)
            bookingRequest.approvedEndTime = assignDto.adjustedEndTime;
        const updatedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);
        const fullBookingRequest = await this.getBookingRequestWithRelations(updatedBookingRequest.id);
        try {
            const dateTime = `${fullBookingRequest.requestedDate instanceof Date
                ? fullBookingRequest.requestedDate.toISOString().split('T')[0]
                : fullBookingRequest.requestedDate} at ${startTime}`;
            const staffName = `${staff.firstName} ${staff.lastName}`;
            await this.notificationService.sendToCustomer(fullBookingRequest.customer.userId, 'BOOKING_REQUEST_STAFF_ASSIGNED', {
                bookingId: fullBookingRequest.id,
                staffName,
                dateTime,
                salonName: fullBookingRequest.businessOwner.businessName,
            });
        }
        catch (error) {
            console.error('Failed to send staff assigned notification:', error);
        }
        return {
            code: 200,
            success: true,
            message: 'Staff assigned successfully',
            data: this.transformToBookingRequestDto(fullBookingRequest),
        };
    }
    async approveBookingRequest(bookingRequestId, businessOwnerId, approveDto) {
        const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId);
        if (!bookingRequest) {
            throw new common_1.NotFoundException('Booking request not found');
        }
        if (bookingRequest.businessOwnerId !== businessOwnerId) {
            throw new common_1.ForbiddenException('You can only manage your own business booking requests');
        }
        if (bookingRequest.status !== entities_1.BookingRequestStatus.PENDING) {
            throw new common_1.BadRequestException('Can only approve pending booking requests');
        }
        if (!bookingRequest.assignedStaffId) {
            throw new common_1.BadRequestException('Must assign staff before approving booking request');
        }
        const startTime = bookingRequest.approvedStartTime || bookingRequest.requestedStartTime;
        const endTime = bookingRequest.approvedEndTime || bookingRequest.requestedEndTime;
        await this.checkStaffAvailability(bookingRequest.assignedStaffId, bookingRequest.requestedDate, startTime, endTime);
        const serviceOtp = Math.floor(100000 + Math.random() * 900000).toString();
        bookingRequest.status = entities_1.BookingRequestStatus.APPROVED;
        if (approveDto.finalPrice)
            bookingRequest.finalPrice = approveDto.finalPrice;
        if (approveDto.businessNotes)
            bookingRequest.businessNotes = approveDto.businessNotes;
        const updatedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);
        const firstBookingRequestService = await this.bookingRequestServiceRepository.findOne({
            where: { bookingRequestId: updatedBookingRequest.id },
            relations: ['businessService'],
        });
        if (!firstBookingRequestService) {
            throw new common_1.BadRequestException('Booking request must have at least one service');
        }
        const booking = this.bookingRepository.create({
            bookingRequestId: updatedBookingRequest.id,
            customerId: updatedBookingRequest.customerId,
            businessOwnerId: updatedBookingRequest.businessOwnerId,
            staffId: updatedBookingRequest.assignedStaffId,
            serviceId: firstBookingRequestService.businessService.serviceId,
            appointmentDate: updatedBookingRequest.requestedDate,
            startTime: startTime,
            endTime: endTime,
            serviceLocation: updatedBookingRequest.serviceLocation,
            totalAmount: updatedBookingRequest.finalPrice || updatedBookingRequest.totalEstimatedPrice,
            specialRequests: updatedBookingRequest.specialRequests,
            status: entities_1.BookingStatus.CONFIRMED,
            otpCode: serviceOtp,
            customerAddress: updatedBookingRequest.customerAddress,
            deliveryCharge: updatedBookingRequest.deliveryCharge,
            deliveryDistance: updatedBookingRequest.deliveryDistance,
            paymentCompleted: false,
            addOnServicesTotal: 0,
        });
        const savedBooking = await this.bookingRepository.save(booking);
        const bookingRequestServices = await this.bookingRequestServiceRepository.find({
            where: { bookingRequestId: updatedBookingRequest.id },
            relations: ['businessService', 'businessService.service'],
        });
        const bookingServices = bookingRequestServices.map(brs => this.bookingServiceRepository.create({
            bookingId: savedBooking.id,
            businessServiceId: brs.businessServiceId,
            serviceId: brs.businessService.serviceId,
            serviceName: brs.businessService.service.name,
            price: brs.estimatedPrice,
            servicePrice: brs.estimatedPrice,
            durationMinutes: brs.estimatedDuration,
            serviceDuration: brs.estimatedDuration,
            isAddOn: false,
            addedAt: new Date(),
            customerApproved: true,
        }));
        await this.bookingServiceRepository.save(bookingServices);
        const finalBookingRequest = await this.getBookingRequestWithRelations(updatedBookingRequest.id);
        try {
            const dateTime = `${finalBookingRequest.requestedDate instanceof Date
                ? finalBookingRequest.requestedDate.toISOString().split('T')[0]
                : finalBookingRequest.requestedDate} at ${startTime}`;
            await this.notificationService.sendToCustomer(finalBookingRequest.customer.userId, 'BOOKING_REQUEST_APPROVED', {
                bookingId: finalBookingRequest.id,
                otp: serviceOtp,
                dateTime,
                salonName: finalBookingRequest.businessOwner.businessName,
            });
        }
        catch (error) {
            console.error('Failed to send booking approved notification:', error);
        }
        return {
            code: 200,
            success: true,
            message: `Booking approved successfully! Booking ID: ${savedBooking.id}. Service OTP: ${serviceOtp}. Business can start service by verifying this OTP.`,
            data: this.transformToBookingRequestDto(finalBookingRequest),
        };
    }
    async rejectBookingRequest(bookingRequestId, businessOwnerId, rejectDto) {
        const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId);
        if (!bookingRequest) {
            throw new common_1.NotFoundException('Booking request not found');
        }
        if (bookingRequest.businessOwnerId !== businessOwnerId) {
            throw new common_1.ForbiddenException('You can only manage your own business booking requests');
        }
        if (bookingRequest.status !== entities_1.BookingRequestStatus.PENDING) {
            throw new common_1.BadRequestException('Can only reject pending booking requests');
        }
        bookingRequest.status = entities_1.BookingRequestStatus.REJECTED;
        bookingRequest.rejectionReason = rejectDto.rejectionReason;
        const updatedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);
        const fullBookingRequest = await this.getBookingRequestWithRelations(updatedBookingRequest.id);
        try {
            const dateTime = `${fullBookingRequest.requestedDate instanceof Date
                ? fullBookingRequest.requestedDate.toISOString().split('T')[0]
                : fullBookingRequest.requestedDate} at ${fullBookingRequest.requestedStartTime}`;
            await this.notificationService.sendToCustomer(fullBookingRequest.customer.userId, 'BOOKING_REQUEST_REJECTED', {
                bookingId: fullBookingRequest.id,
                salonName: fullBookingRequest.businessOwner.businessName,
                dateTime,
                reason: rejectDto.rejectionReason || 'No reason provided',
            });
        }
        catch (error) {
            console.error('Failed to send booking rejected notification:', error);
        }
        return {
            code: 200,
            success: true,
            message: 'Booking request rejected successfully',
            data: this.transformToBookingRequestDto(fullBookingRequest),
        };
    }
    async verifyArrivalOtp(bookingRequestId, businessOwnerId, otpCode) {
        const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId);
        if (!bookingRequest) {
            throw new common_1.NotFoundException('Booking request not found');
        }
        if (bookingRequest.businessOwnerId !== businessOwnerId) {
            throw new common_1.ForbiddenException('You can only verify OTP for your own business booking requests');
        }
        if (bookingRequest.status !== entities_1.BookingRequestStatus.APPROVED) {
            throw new common_1.BadRequestException('Booking request must be approved before OTP verification');
        }
        const booking = await this.bookingRepository.findOne({
            where: { bookingRequestId: bookingRequestId },
            relations: ['customer', 'customer.user', 'businessOwner', 'staff'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found for this booking request');
        }
        if (booking.otpCode !== otpCode) {
            throw new common_1.BadRequestException('Invalid service OTP code');
        }
        if (booking.otpVerifiedAt) {
            throw new common_1.BadRequestException('Service has already been started');
        }
        booking.status = entities_1.BookingStatus.IN_PROGRESS;
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
    async cancelBookingRequest(bookingRequestId, customerId, cancellationReason) {
        const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId);
        if (!bookingRequest) {
            throw new common_1.NotFoundException('Booking request not found');
        }
        if (bookingRequest.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only cancel your own booking requests');
        }
        if (bookingRequest.status === entities_1.BookingRequestStatus.REJECTED) {
            throw new common_1.BadRequestException('Booking request has already been rejected by business owner');
        }
        if (bookingRequest.confirmedBooking) {
            throw new common_1.BadRequestException('This booking request has been confirmed and payment completed. Please cancel the confirmed booking instead using DELETE /api/v1/bookings/{bookingId}');
        }
        bookingRequest.status = entities_1.BookingRequestStatus.REJECTED;
        bookingRequest.rejectionReason = cancellationReason || 'Cancelled by customer';
        const updatedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);
        const fullBookingRequest = await this.getBookingRequestWithRelations(updatedBookingRequest.id);
        try {
            const dateTime = `${fullBookingRequest.requestedDate instanceof Date
                ? fullBookingRequest.requestedDate.toISOString().split('T')[0]
                : fullBookingRequest.requestedDate} at ${fullBookingRequest.requestedStartTime}`;
            await this.notificationService.sendToBusinessOwner(fullBookingRequest.businessOwner.userId, 'BOOKING_REQUEST_CANCELLED_BY_CUSTOMER', {
                bookingId: fullBookingRequest.id,
                customerName: `${fullBookingRequest.customer.firstName} ${fullBookingRequest.customer.lastName}`,
                dateTime,
                reason: cancellationReason || 'No reason provided',
            });
        }
        catch (error) {
            console.error('Failed to send booking cancellation notification:', error);
        }
        return {
            code: 200,
            success: true,
            message: 'Booking request cancelled successfully',
            data: this.transformToBookingRequestDto(fullBookingRequest),
        };
    }
    async validateBusinessHours(createDto) {
        const requestedDate = new Date(createDto.requestedDate);
        const dayOfWeek = requestedDate.getDay();
        const businessHours = await this.businessOperatingHoursRepository.findOne({
            where: { businessOwnerId: createDto.businessOwnerId, dayOfWeek },
        });
        if (!businessHours || businessHours.isClosed) {
            throw new common_1.BadRequestException('Business is closed on the requested day');
        }
        if (createDto.requestedStartTime < businessHours.openTime || createDto.requestedEndTime > businessHours.closeTime) {
            throw new common_1.BadRequestException(`Requested time is outside business hours (${businessHours.openTime} - ${businessHours.closeTime})`);
        }
    }
    async validateStaffAvailability(staffId, date, startTime, endTime) {
        const dayOfWeek = date.getDay();
        const staffWorkingHours = await this.staffWorkingHoursRepository.findOne({
            where: { staffId, dayOfWeek, isActive: true },
        });
        if (!staffWorkingHours) {
            return;
        }
        if (startTime < staffWorkingHours.startTime || endTime > staffWorkingHours.endTime) {
            throw new common_1.BadRequestException(`Staff member working hours: ${staffWorkingHours.startTime} - ${staffWorkingHours.endTime}`);
        }
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    calculateDurationMinutes(startTime, endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        return endMinutes - startMinutes;
    }
    async checkStaffAvailability(staffId, date, startTime, endTime) {
        const appointmentDate = date instanceof Date
            ? date.toISOString().split('T')[0]
            : date;
        const overlappingBooking = await this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.staff_id = :staffId', { staffId })
            .andWhere('booking.appointment_date = :date', { date: appointmentDate })
            .andWhere('booking.status IN (:...statuses)', {
            statuses: [entities_1.BookingStatus.CONFIRMED, entities_1.BookingStatus.IN_PROGRESS]
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
            throw new common_1.BadRequestException(`Staff is not available during the requested time slot (${startTime} - ${endTime}). ` +
                `There is an existing booking from ${overlappingBooking.startTime} to ${overlappingBooking.endTime}. ` +
                `Please choose a different time slot or assign a different staff member.`);
        }
    }
    applyQueryFilters(queryBuilder, query) {
        if (query.status) {
            switch (query.status) {
                case entities_1.BookingRequestStatus.PENDING:
                    queryBuilder.andWhere('bookingRequest.status = :status', { status: 'pending' });
                    break;
                case entities_1.BookingRequestStatus.STAFF_ASSIGNED:
                    queryBuilder
                        .andWhere('bookingRequest.status = :status', { status: 'pending' })
                        .andWhere('bookingRequest.assignedStaffId IS NOT NULL');
                    break;
                case entities_1.BookingRequestStatus.APPROVED:
                    queryBuilder.andWhere('bookingRequest.status = :status', { status: 'approved' });
                    break;
                case entities_1.BookingRequestStatus.IN_PROGRESS:
                    queryBuilder
                        .andWhere('bookingRequest.status = :status', { status: 'approved' })
                        .andWhere('confirmedBooking.id IS NOT NULL')
                        .andWhere('confirmedBooking.status = :bookingStatus', { bookingStatus: 'in-progress' });
                    break;
                case entities_1.BookingRequestStatus.COMPLETED:
                    queryBuilder
                        .andWhere('bookingRequest.status = :status', { status: 'approved' })
                        .andWhere('confirmedBooking.id IS NOT NULL')
                        .andWhere('confirmedBooking.status = :bookingStatus', { bookingStatus: 'completed' });
                    break;
                case entities_1.BookingRequestStatus.REJECTED:
                    queryBuilder.andWhere('bookingRequest.status = :status', { status: 'rejected' });
                    break;
                case entities_1.BookingRequestStatus.CANCELLED:
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
    async getBookingRequestWithRelations(bookingRequestId, includeBookingServices = false) {
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
        if (includeBookingServices) {
            relations.push('confirmedBooking.bookingServices', 'confirmedBooking.bookingServices.businessService', 'confirmedBooking.bookingServices.service');
        }
        return this.bookingRequestRepository.findOne({
            where: { id: bookingRequestId },
            relations,
        });
    }
    computeLifecycleFlags(bookingRequest) {
        const hasAssignedStaff = !!bookingRequest.assignedStaffId;
        const hasConfirmedBooking = !!bookingRequest.confirmedBooking;
        const bookingStatus = bookingRequest.confirmedBooking?.status;
        const isRejected = bookingRequest.status === entities_1.BookingRequestStatus.REJECTED;
        const isPending = bookingRequest.status === entities_1.BookingRequestStatus.PENDING;
        const isApproved = bookingRequest.status === entities_1.BookingRequestStatus.APPROVED;
        let lifecycleState;
        if (isRejected) {
            const isCancelled = bookingRequest.rejectionReason?.toLowerCase().includes('cancelled by customer');
            lifecycleState = isCancelled ? entities_1.BookingRequestStatus.CANCELLED : entities_1.BookingRequestStatus.REJECTED;
        }
        else if (isApproved && hasConfirmedBooking) {
            if (bookingStatus === entities_1.BookingStatus.COMPLETED) {
                lifecycleState = entities_1.BookingRequestStatus.COMPLETED;
            }
            else if (bookingStatus === entities_1.BookingStatus.IN_PROGRESS) {
                lifecycleState = entities_1.BookingRequestStatus.IN_PROGRESS;
            }
            else if (bookingStatus === entities_1.BookingStatus.CONFIRMED) {
                lifecycleState = entities_1.BookingRequestStatus.AWAITING_PAYMENT;
            }
            else {
                lifecycleState = entities_1.BookingRequestStatus.APPROVED;
            }
        }
        else if (isApproved) {
            lifecycleState = entities_1.BookingRequestStatus.AWAITING_PAYMENT;
        }
        else if (isPending && hasAssignedStaff) {
            lifecycleState = entities_1.BookingRequestStatus.STAFF_ASSIGNED;
        }
        else {
            lifecycleState = entities_1.BookingRequestStatus.PENDING;
        }
        return {
            lifecycleState,
            isStaffAssigned: hasAssignedStaff,
            isApproved: isApproved,
            isPaymentPending: false,
            isPaymentCompleted: isApproved && hasConfirmedBooking && bookingRequest.confirmedBooking?.paymentCompleted,
            isConfirmed: hasConfirmedBooking,
            canCancel: (isPending || (isApproved && !hasConfirmedBooking)),
            canPay: false,
            requiresAction: isPending && hasAssignedStaff,
        };
    }
    transformToBookingRequestDto(bookingRequest) {
        const lifecycleFlags = this.computeLifecycleFlags(bookingRequest);
        let paymentInfo = null;
        if (bookingRequest.payment) {
            const payment = bookingRequest.payment;
            const isOnline = payment.paymentMethod && payment.paymentMethod !== 'cod';
            paymentInfo = {
                paymentMethod: payment.paymentMethod || null,
                paymentStatus: bookingRequest.paymentStatus || 'not_required',
                amount: payment.amount,
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
            serviceLocation: bookingRequest.serviceLocation || entities_1.ServiceLocation.IN_SALON,
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
            bookingStatus: bookingRequest.confirmedBooking?.status,
            otpVerifiedAt: bookingRequest.confirmedBooking?.otpVerifiedAt,
            serviceStartedAt: bookingRequest.confirmedBooking?.serviceStartedAt,
            serviceCompletedAt: bookingRequest.confirmedBooking?.serviceCompletedAt,
            paymentInfo,
            customerAddress: bookingRequest.customerAddress,
            deliveryCharge: bookingRequest.deliveryCharge,
            deliveryDistance: bookingRequest.deliveryDistance,
        };
    }
    transformToBusinessOwnerBookingRequestDto(bookingRequest) {
        const lifecycleFlags = this.computeLifecycleFlags(bookingRequest);
        let paymentInfo = null;
        if (bookingRequest.payment) {
            const payment = bookingRequest.payment;
            const isOnline = payment.paymentMethod && payment.paymentMethod !== 'cod';
            paymentInfo = {
                paymentMethod: payment.paymentMethod || null,
                paymentStatus: bookingRequest.paymentStatus || 'not_required',
                amount: payment.amount,
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
            serviceLocation: bookingRequest.serviceLocation || entities_1.ServiceLocation.IN_SALON,
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
            bookingStatus: bookingRequest.confirmedBooking?.status,
            otpVerifiedAt: bookingRequest.confirmedBooking?.otpVerifiedAt,
            serviceStartedAt: bookingRequest.confirmedBooking?.serviceStartedAt,
            serviceCompletedAt: bookingRequest.confirmedBooking?.serviceCompletedAt,
            paymentInfo,
            customerAddress: bookingRequest.customerAddress,
            deliveryCharge: bookingRequest.deliveryCharge,
            deliveryDistance: bookingRequest.deliveryDistance,
        };
    }
    async getCustomerBookingRequestById(customerId, bookingRequestId) {
        const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId, true);
        if (!bookingRequest) {
            throw new common_1.NotFoundException('Booking request not found');
        }
        if (bookingRequest.customerId !== customerId) {
            throw new common_1.ForbiddenException('You do not have access to this booking request');
        }
        const detailedDto = await this.transformToDetailedBookingRequestDto(bookingRequest);
        return {
            code: 200,
            success: true,
            message: 'Booking request retrieved successfully',
            data: detailedDto,
        };
    }
    async transformToDetailedBookingRequestDto(bookingRequest) {
        const baseDto = await this.transformToBookingRequestDto(bookingRequest);
        if (!bookingRequest.confirmedBooking || !bookingRequest.confirmedBooking.bookingServices) {
            return {
                ...baseDto,
                bookingDetails: null,
            };
        }
        const confirmedBooking = bookingRequest.confirmedBooking;
        const allBookingServices = confirmedBooking.bookingServices || [];
        const originalServices = allBookingServices.filter(bs => !bs.isAddOn);
        const addOnServices = allBookingServices.filter(bs => bs.isAddOn);
        const transformBookingService = (bs) => ({
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
        const pendingAddOnServices = addOnServices.filter(bs => !bs.customerApproved);
        const approvedAddOnServices = addOnServices.filter(bs => bs.customerApproved);
        const pendingAddOnServicesDtos = pendingAddOnServices.map(transformBookingService);
        const approvedAddOnServicesDtos = approvedAddOnServices.map(transformBookingService);
        const pendingAddOnServicesTotal = pendingAddOnServices.reduce((sum, bs) => sum + Number(bs.price), 0);
        const totalDuration = allBookingServices.reduce((sum, bs) => sum + bs.durationMinutes, 0);
        let estimatedEndTime;
        if (confirmedBooking.appointmentDate && bookingRequest.approvedStartTime) {
            const [hours, minutes] = bookingRequest.approvedStartTime.split(':').map(Number);
            const startMinutes = hours * 60 + minutes;
            const endMinutes = startMinutes + totalDuration;
            const endHours = Math.floor(endMinutes / 60) % 24;
            const endMins = endMinutes % 60;
            estimatedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
        }
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
    async getBusinessOwnerBookingRequestById(businessOwnerId, bookingRequestId) {
        const bookingRequest = await this.getBookingRequestWithRelations(bookingRequestId, true);
        if (!bookingRequest) {
            throw new common_1.NotFoundException('Booking request not found');
        }
        if (bookingRequest.businessOwnerId !== businessOwnerId) {
            throw new common_1.ForbiddenException('You do not have access to this booking request');
        }
        const detailedDto = await this.transformToDetailedBusinessOwnerBookingRequestDto(bookingRequest);
        return {
            code: 200,
            success: true,
            message: 'Booking request retrieved successfully',
            data: detailedDto,
        };
    }
    async transformToDetailedBusinessOwnerBookingRequestDto(bookingRequest) {
        const baseDto = await this.transformToBusinessOwnerBookingRequestDto(bookingRequest);
        if (!bookingRequest.confirmedBooking || !bookingRequest.confirmedBooking.bookingServices) {
            return {
                ...baseDto,
                bookingDetails: null,
            };
        }
        const confirmedBooking = bookingRequest.confirmedBooking;
        const allBookingServices = confirmedBooking.bookingServices || [];
        const originalServices = allBookingServices.filter(bs => !bs.isAddOn);
        const addOnServices = allBookingServices.filter(bs => bs.isAddOn);
        const transformBookingService = (bs) => ({
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
        const pendingAddOnServices = addOnServices.filter(bs => !bs.customerApproved);
        const approvedAddOnServices = addOnServices.filter(bs => bs.customerApproved);
        const pendingAddOnServicesDtos = pendingAddOnServices.map(transformBookingService);
        const approvedAddOnServicesDtos = approvedAddOnServices.map(transformBookingService);
        const pendingAddOnServicesTotal = pendingAddOnServices.reduce((sum, bs) => sum + Number(bs.price), 0);
        const totalDuration = allBookingServices.reduce((sum, bs) => sum + bs.durationMinutes, 0);
        let estimatedEndTime;
        if (confirmedBooking.appointmentDate && bookingRequest.approvedStartTime) {
            const [hours, minutes] = bookingRequest.approvedStartTime.split(':').map(Number);
            const startMinutes = hours * 60 + minutes;
            const endMinutes = startMinutes + totalDuration;
            const endHours = Math.floor(endMinutes / 60) % 24;
            const endMins = endMinutes % 60;
            estimatedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
        }
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
};
exports.BookingRequestService = BookingRequestService;
exports.BookingRequestService = BookingRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BookingRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BookingRequestService)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.BusinessService)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.Staff)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.StaffWorkingHours)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.BusinessOperatingHours)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.Booking)),
    __param(9, (0, typeorm_1.InjectRepository)(entities_1.ServicePackage)),
    __param(10, (0, typeorm_1.InjectRepository)(entities_1.ServicePackageItem)),
    __param(11, (0, typeorm_1.InjectRepository)(entities_1.BookingService)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], BookingRequestService);
//# sourceMappingURL=booking-request.service.js.map
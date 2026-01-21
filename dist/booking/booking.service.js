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
exports.BookingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const customer_transaction_history_dto_1 = require("./dto/customer-transaction-history.dto");
const commission_service_1 = require("../wallet/commission.service");
const settlement_transaction_entity_1 = require("../database/entities/settlement-transaction.entity");
const delivery_charge_service_1 = require("./delivery-charge.service");
const booking_enum_1 = require("../common/enums/booking.enum");
const notification_service_1 = require("../notification/notification.service");
let BookingService = class BookingService {
    constructor(bookingRepository, customerRepository, businessOwnerRepository, businessServiceRepository, staffRepository, serviceRepository, staffWorkingHoursRepository, businessOperatingHoursRepository, bookingRequestRepository, bookingRequestServiceRepository, servicePackageRepository, servicePackageItemRepository, bookingServiceRepository, commissionService, deliveryChargeService, notificationService) {
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.businessServiceRepository = businessServiceRepository;
        this.staffRepository = staffRepository;
        this.serviceRepository = serviceRepository;
        this.staffWorkingHoursRepository = staffWorkingHoursRepository;
        this.businessOperatingHoursRepository = businessOperatingHoursRepository;
        this.bookingRequestRepository = bookingRequestRepository;
        this.bookingRequestServiceRepository = bookingRequestServiceRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.servicePackageItemRepository = servicePackageItemRepository;
        this.bookingServiceRepository = bookingServiceRepository;
        this.commissionService = commissionService;
        this.deliveryChargeService = deliveryChargeService;
        this.notificationService = notificationService;
    }
    async createBooking(userId, createBookingDto) {
        const customer = await this.customerRepository.findOne({
            where: { userId },
            relations: ['user'],
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const customerId = customer.id;
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: createBookingDto.businessOwnerId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        if (createBookingDto.requestedStaffId) {
            const staff = await this.staffRepository.findOne({
                where: {
                    id: createBookingDto.requestedStaffId,
                    businessOwnerId: createBookingDto.businessOwnerId
                },
            });
            if (!staff) {
                throw new common_1.NotFoundException('Staff not found or does not belong to this business');
            }
        }
        if (!createBookingDto.businessServiceIds?.length && !createBookingDto.servicePackageIds?.length) {
            throw new common_1.BadRequestException('At least one business service or service package must be selected');
        }
        let businessServices = [];
        if (Array.isArray(createBookingDto.businessServiceIds) && createBookingDto.businessServiceIds.length > 0) {
            businessServices = await this.businessServiceRepository.find({
                where: {
                    id: (0, typeorm_2.In)(createBookingDto.businessServiceIds),
                    businessOwnerId: createBookingDto.businessOwnerId,
                    isActive: true
                },
                relations: ['service']
            });
            if (businessServices.length !== createBookingDto.businessServiceIds.length) {
                throw new common_1.NotFoundException('One or more business services not found or inactive');
            }
        }
        let servicePackages = [];
        let packageBusinessServices = [];
        if (Array.isArray(createBookingDto.servicePackageIds) && createBookingDto.servicePackageIds.length > 0) {
            servicePackages = await this.servicePackageRepository.find({
                where: {
                    id: (0, typeorm_2.In)(createBookingDto.servicePackageIds),
                    businessOwnerId: createBookingDto.businessOwnerId,
                    isActive: true
                },
                relations: ['packageItems', 'packageItems.businessService', 'packageItems.businessService.service']
            });
            if (servicePackages.length !== createBookingDto.servicePackageIds.length) {
                throw new common_1.NotFoundException('One or more service packages not found or inactive');
            }
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
        const serviceMap = new Map();
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
        for (const pkgService of packageBusinessServices) {
            if (!serviceMap.has(pkgService.businessService.id)) {
                serviceMap.set(pkgService.businessService.id, pkgService);
            }
        }
        const allServices = Array.from(serviceMap.values());
        let totalEstimatedAmount = 0;
        let totalEstimatedDuration = 0;
        for (const serviceData of allServices) {
            const businessService = serviceData.businessService;
            const servicePriceRaw = businessService.customPrice || businessService.service.basePrice || 0;
            let servicePrice = typeof servicePriceRaw === 'string' ? parseFloat(servicePriceRaw) : Number(servicePriceRaw);
            if (serviceData.discountPercentage > 0) {
                const discountAmount = (servicePrice * serviceData.discountPercentage) / 100;
                servicePrice = servicePrice - discountAmount;
            }
            totalEstimatedAmount += servicePrice;
            totalEstimatedDuration += businessService.customDurationMinutes || businessService.service.defaultDuration || 0;
        }
        let deliveryCharge = 0;
        let deliveryDistance = 0;
        let customerAddress = null;
        if (createBookingDto.serviceLocation === booking_enum_1.ServiceLocation.AT_HOME) {
            if (!createBookingDto.customerAddress) {
                throw new common_1.BadRequestException('Customer address is required for at-home services');
            }
            if (!createBookingDto.customerAddress.latitude || !createBookingDto.customerAddress.longitude) {
                throw new common_1.BadRequestException('Customer address must include latitude and longitude for delivery charge calculation');
            }
            try {
                const deliveryCalculation = await this.deliveryChargeService.calculateDeliveryCharge(createBookingDto.businessOwnerId, createBookingDto.customerAddress.latitude, createBookingDto.customerAddress.longitude, totalEstimatedAmount);
                deliveryCharge = deliveryCalculation.totalDeliveryCharge;
                deliveryDistance = deliveryCalculation.distanceKm;
                customerAddress = createBookingDto.customerAddress;
            }
            catch (error) {
                if (error instanceof common_1.BadRequestException) {
                    throw error;
                }
                throw new common_1.BadRequestException(`Failed to calculate delivery charges: ${error.message}`);
            }
            totalEstimatedAmount += deliveryCharge;
        }
        await this.validateBusinessHours(createBookingDto);
        const bookingRequest = this.bookingRequestRepository.create({
            customerId,
            businessOwnerId: createBookingDto.businessOwnerId,
            requestedStaffId: createBookingDto.requestedStaffId,
            requestedDate: new Date(createBookingDto.requestedDate),
            requestedStartTime: createBookingDto.requestedStartTime,
            requestedEndTime: createBookingDto.requestedEndTime,
            serviceLocation: createBookingDto.serviceLocation,
            specialRequests: createBookingDto.specialRequests,
            totalEstimatedPrice: totalEstimatedAmount,
            totalEstimatedDuration: totalEstimatedDuration,
            status: entities_1.BookingRequestStatus.PENDING,
            customerAddress: customerAddress,
            deliveryCharge: deliveryCharge,
            deliveryDistance: deliveryDistance || 0,
        });
        const savedBookingRequest = await this.bookingRequestRepository.save(bookingRequest);
        if (allServices.length > 0) {
            const bookingRequestServices = allServices.map(serviceData => {
                const businessService = serviceData.businessService;
                const estimatedPriceRaw = businessService.customPrice || businessService.service.basePrice || 0;
                let estimatedPrice = typeof estimatedPriceRaw === 'string' ? parseFloat(estimatedPriceRaw) : Number(estimatedPriceRaw);
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
        try {
            const serviceNames = allServices.map(s => s.businessService.service.name).join(', ');
            const dateTime = `${createBookingDto.requestedDate} at ${createBookingDto.requestedStartTime}`;
            await this.notificationService.sendToCustomer(customer.userId, 'BOOKING_REQUEST_CREATED', {
                bookingId: savedBookingRequest.id,
                dateTime,
                salonName: businessOwner.businessName,
            });
            await this.notificationService.sendToBusinessOwner(businessOwner.userId, 'BOOKING_REQUEST_CREATED', {
                bookingId: savedBookingRequest.id,
                customerName: `${customer.firstName} ${customer.lastName}`,
                dateTime,
                services: serviceNames,
                serviceLocation: createBookingDto.serviceLocation,
            });
        }
        catch (error) {
            console.error('Failed to send booking request created notifications:', error);
        }
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
    async getCustomerBookings(customerId, query) {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
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
        }
        else if (query.fromDate) {
            queryBuilder.andWhere('booking.appointmentDate >= :fromDate', {
                fromDate: query.fromDate,
            });
        }
        else if (query.toDate) {
            queryBuilder.andWhere('booking.appointmentDate <= :toDate', {
                toDate: query.toDate,
            });
        }
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
    async updateBooking(bookingId, userId, updateBookingDto) {
        const customer = await this.customerRepository.findOne({
            where: { userId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const booking = await this.getBookingWithRelations(bookingId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.customerId !== customer.id) {
            throw new common_1.ForbiddenException('You can only update your own bookings');
        }
        if (booking.status === entities_1.BookingStatus.COMPLETED || booking.status === entities_1.BookingStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot update completed or cancelled bookings');
        }
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
    async cancelBooking(bookingId, userId) {
        const customer = await this.customerRepository.findOne({
            where: { userId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const booking = await this.getBookingWithRelations(bookingId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.customerId !== customer.id) {
            throw new common_1.ForbiddenException('You can only cancel your own bookings');
        }
        if (booking.status === entities_1.BookingStatus.COMPLETED || booking.status === entities_1.BookingStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot cancel completed or already cancelled bookings');
        }
        booking.status = entities_1.BookingStatus.CANCELLED;
        const updatedBooking = await this.bookingRepository.save(booking);
        const fullBooking = await this.getBookingWithRelations(updatedBooking.id);
        try {
            const dateTime = `${fullBooking.appointmentDate instanceof Date
                ? fullBooking.appointmentDate.toISOString().split('T')[0]
                : fullBooking.appointmentDate} at ${fullBooking.startTime}`;
            await this.notificationService.sendToBusinessOwner(fullBooking.businessOwner.userId, 'BOOKING_CANCELLED', {
                bookingId: fullBooking.id,
                customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName}`,
                dateTime,
                reason: fullBooking.specialRequests || 'No reason provided',
            });
        }
        catch (error) {
            console.error('Failed to send booking cancelled notification:', error);
        }
        return {
            code: 200,
            success: true,
            message: 'Booking cancelled successfully',
            data: this.transformToBookingDto(fullBooking),
        };
    }
    async validateBookingEntities(createBookingDto) {
        const business = await this.businessOwnerRepository.findOne({
            where: { id: createBookingDto.businessOwnerId },
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id: createBookingDto.requestedStaffId, businessOwnerId: createBookingDto.businessOwnerId },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found or does not belong to this business');
        }
    }
    async validateTimeSlotAvailability(bookingData, excludeBookingId) {
        const appointmentDate = new Date(bookingData.requestedDate);
        const queryBuilder = this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.staffId = :staffId', { staffId: bookingData.requestedStaffId })
            .andWhere('booking.appointmentDate = :appointmentDate', { appointmentDate })
            .andWhere('booking.status IN (:...statuses)', {
            statuses: [entities_1.BookingStatus.PENDING, entities_1.BookingStatus.CONFIRMED, entities_1.BookingStatus.IN_PROGRESS],
        })
            .andWhere('(booking.startTime < :endTime AND booking.endTime > :startTime)', {
            startTime: bookingData.requestedStartTime,
            endTime: bookingData.requestedEndTime,
        });
        if (excludeBookingId) {
            queryBuilder.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
        }
        const conflictingBooking = await queryBuilder.getOne();
        if (conflictingBooking) {
            throw new common_1.BadRequestException(`Time slot is not available. Conflicts with existing booking from ${conflictingBooking.startTime} to ${conflictingBooking.endTime}`);
        }
    }
    async validateWorkingHours(bookingData) {
        const appointmentDate = new Date(bookingData.requestedDate);
        const dayOfWeek = appointmentDate.getDay();
        const businessHours = await this.businessOperatingHoursRepository.findOne({
            where: { businessOwnerId: bookingData.businessOwnerId, dayOfWeek },
        });
        if (!businessHours || businessHours.isClosed) {
            throw new common_1.BadRequestException('Business is closed on this day');
        }
        if (bookingData.requestedStartTime < businessHours.openTime || bookingData.requestedEndTime > businessHours.closeTime) {
            throw new common_1.BadRequestException(`Booking time is outside business hours (${businessHours.openTime} - ${businessHours.closeTime})`);
        }
        const staffWorkingHours = await this.staffWorkingHoursRepository.findOne({
            where: { staffId: bookingData.requestedStaffId, dayOfWeek, isActive: true },
        });
        if (!staffWorkingHours) {
            throw new common_1.BadRequestException('Staff member is not available on this day');
        }
        if (bookingData.requestedStartTime < staffWorkingHours.startTime || bookingData.requestedEndTime > staffWorkingHours.endTime) {
            throw new common_1.BadRequestException(`Booking time is outside staff working hours (${staffWorkingHours.startTime} - ${staffWorkingHours.endTime})`);
        }
    }
    async getBookingWithRelations(bookingId) {
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
    calculateDurationMinutes(startTime, endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;
        return endTotalMinutes - startTotalMinutes;
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async verifyOtpAndStartService(bookingId, otpCode, businessOwnerId) {
        const booking = await this.getBookingWithRelations(bookingId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.businessOwnerId !== businessOwnerId) {
            throw new common_1.ForbiddenException('This booking does not belong to your business');
        }
        if (booking.status !== entities_1.BookingStatus.CONFIRMED) {
            if (booking.status === entities_1.BookingStatus.IN_PROGRESS) {
                throw new common_1.BadRequestException('Service has already been started');
            }
            if (booking.status === entities_1.BookingStatus.COMPLETED) {
                throw new common_1.BadRequestException('Service has already been completed');
            }
            throw new common_1.BadRequestException('Booking must be in confirmed status to verify OTP');
        }
        if (booking.otpCode !== otpCode) {
            throw new common_1.BadRequestException('Invalid OTP code');
        }
        booking.status = entities_1.BookingStatus.IN_PROGRESS;
        booking.otpVerifiedAt = new Date();
        booking.serviceStartedAt = new Date();
        const updatedBooking = await this.bookingRepository.save(booking);
        const fullBooking = await this.getBookingWithRelations(updatedBooking.id);
        try {
            await this.notificationService.sendToCustomer(fullBooking.customer.userId, 'SERVICE_STARTED', {
                bookingId: fullBooking.id,
                salonName: fullBooking.businessOwner.businessName,
                staffName: fullBooking.staff ? `${fullBooking.staff.firstName} ${fullBooking.staff.lastName}` : undefined,
            });
        }
        catch (error) {
            console.error('Failed to send service started notification:', error);
        }
        return {
            code: 200,
            success: true,
            message: 'OTP verified successfully. Service started.',
            data: this.transformToBookingDto(fullBooking),
        };
    }
    async completeService(bookingId, businessOwnerId, notes) {
        const booking = await this.getBookingWithRelations(bookingId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.businessOwnerId !== businessOwnerId) {
            throw new common_1.ForbiddenException('This booking does not belong to your business');
        }
        if (booking.status !== entities_1.BookingStatus.IN_PROGRESS) {
            if (booking.status === entities_1.BookingStatus.CONFIRMED) {
                throw new common_1.BadRequestException('Service has not been started yet. Please verify OTP first.');
            }
            if (booking.status === entities_1.BookingStatus.COMPLETED) {
                throw new common_1.BadRequestException('Service has already been completed');
            }
            throw new common_1.BadRequestException('Booking must be in progress to complete service');
        }
        if (!booking.paymentCompleted) {
            throw new common_1.BadRequestException('Payment must be completed before marking service as complete. Please ask the customer to complete payment first.');
        }
        booking.status = entities_1.BookingStatus.COMPLETED;
        booking.serviceCompletedAt = new Date();
        if (notes) {
            booking.specialRequests = booking.specialRequests
                ? `${booking.specialRequests}\n\nCompletion Notes: ${notes}`
                : `Completion Notes: ${notes}`;
        }
        const updatedBooking = await this.bookingRepository.save(booking);
        const fullBooking = await this.getBookingWithRelations(updatedBooking.id);
        try {
            const paymentMethod = booking.paymentMethod || settlement_transaction_entity_1.PaymentMethodType.ONLINE;
            await this.commissionService.calculateAndApplyCommission(updatedBooking.id, paymentMethod);
        }
        catch (error) {
            console.error(`Failed to calculate commission for booking ${updatedBooking.id}:`, error);
        }
        try {
            await this.notificationService.sendToCustomer(fullBooking.customer.userId, 'SERVICE_COMPLETED', {
                bookingId: fullBooking.id,
                salonName: fullBooking.businessOwner.businessName,
                totalAmount: String(fullBooking.totalAmount),
            });
            await this.notificationService.sendToBusinessOwner(fullBooking.businessOwner.userId, 'SERVICE_COMPLETED', {
                bookingId: fullBooking.id,
                customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName}`,
                totalAmount: String(fullBooking.totalAmount),
            });
        }
        catch (error) {
            console.error('Failed to send service completed notifications:', error);
        }
        return {
            code: 200,
            success: true,
            message: 'Service completed successfully. Commission has been applied.',
            data: this.transformToBookingDto(fullBooking),
        };
    }
    async addServicesToBooking(bookingId, businessOwnerId, addServicesDto, customerId) {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['bookingServices'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (customerId) {
            if (booking.customerId !== customerId) {
                throw new common_1.ForbiddenException('You can only add services to your own bookings');
            }
            businessOwnerId = booking.businessOwnerId;
        }
        else {
            if (booking.businessOwnerId !== businessOwnerId) {
                throw new common_1.ForbiddenException('This booking does not belong to your business');
            }
        }
        if (booking.status !== entities_1.BookingStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Add-on services can only be added to bookings that are in progress');
        }
        if (customerId && booking.paymentCompleted) {
            throw new common_1.BadRequestException('Cannot add services after payment has been completed. Please contact the salon for assistance.');
        }
        if (!addServicesDto.businessServiceIds?.length && !addServicesDto.servicePackageIds?.length) {
            throw new common_1.BadRequestException('At least one business service or service package must be selected');
        }
        const existingServiceIds = new Set(booking.bookingServices?.map(bs => bs.businessServiceId) || []);
        let businessServices = [];
        let duplicateServices = [];
        if (Array.isArray(addServicesDto.businessServiceIds) && addServicesDto.businessServiceIds.length > 0) {
            businessServices = await this.businessServiceRepository.find({
                where: {
                    id: (0, typeorm_2.In)(addServicesDto.businessServiceIds),
                    businessOwnerId: businessOwnerId,
                    isActive: true
                },
                relations: ['service']
            });
            if (businessServices.length !== addServicesDto.businessServiceIds.length) {
                throw new common_1.NotFoundException('One or more business services not found or inactive');
            }
            businessServices.forEach(bs => {
                if (existingServiceIds.has(bs.id)) {
                    duplicateServices.push(bs.service.name);
                }
            });
        }
        let servicePackages = [];
        let packageBusinessServices = [];
        if (Array.isArray(addServicesDto.servicePackageIds) && addServicesDto.servicePackageIds.length > 0) {
            servicePackages = await this.servicePackageRepository.find({
                where: {
                    id: (0, typeorm_2.In)(addServicesDto.servicePackageIds),
                    businessOwnerId: businessOwnerId,
                    isActive: true
                },
                relations: ['packageItems', 'packageItems.businessService', 'packageItems.businessService.service']
            });
            if (servicePackages.length !== addServicesDto.servicePackageIds.length) {
                throw new common_1.NotFoundException('One or more service packages not found or inactive');
            }
            for (const pkg of servicePackages) {
                for (const item of pkg.packageItems) {
                    if (item.businessService && item.businessService.isActive) {
                        if (existingServiceIds.has(item.businessService.id)) {
                            duplicateServices.push(`${item.businessService.service.name} (from package: ${pkg.name})`);
                        }
                        else {
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
        if (duplicateServices.length > 0) {
            return {
                success: false,
                message: 'Same services are already in the booking',
                duplicateServices: duplicateServices,
            };
        }
        const serviceMap = new Map();
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
        let addOnTotal = 0;
        const bookingServicesToCreate = [];
        for (const serviceData of newServices) {
            const businessService = serviceData.businessService;
            const servicePriceRaw = businessService.customPrice || businessService.service.basePrice || 0;
            let servicePrice = typeof servicePriceRaw === 'string' ? parseFloat(servicePriceRaw) : Number(servicePriceRaw);
            if (serviceData.discountPercentage > 0) {
                const discountAmount = (servicePrice * serviceData.discountPercentage) / 100;
                servicePrice = servicePrice - discountAmount;
            }
            const isCustomerAdding = !!customerId;
            const shouldAutoApprove = isCustomerAdding;
            if (shouldAutoApprove) {
                addOnTotal += servicePrice;
            }
            bookingServicesToCreate.push(this.bookingServiceRepository.create({
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
                customerApproved: shouldAutoApprove,
                approvedAt: shouldAutoApprove ? new Date() : null,
                packageId: serviceData.packageId,
                packageName: serviceData.packageName,
            }));
        }
        await this.bookingServiceRepository.save(bookingServicesToCreate);
        if (addOnTotal > 0) {
            const bookingToUpdate = await this.bookingRepository.findOne({
                where: { id: bookingId },
            });
            const currentAddOnTotal = Number(bookingToUpdate.addOnServicesTotal) || 0;
            bookingToUpdate.addOnServicesTotal = currentAddOnTotal + addOnTotal;
            bookingToUpdate.totalAmount = Number(bookingToUpdate.totalAmount) + addOnTotal;
            await this.bookingRepository.save(bookingToUpdate);
        }
        const updatedBooking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['bookingServices'],
        });
        const isCustomerAdding = !!customerId;
        const statusMessage = isCustomerAdding
            ? `Successfully added ${newServices.length} add-on service(s) to the booking`
            : `Successfully added ${newServices.length} add-on service(s) pending customer approval`;
        try {
            const fullBooking = await this.bookingRepository.findOne({
                where: { id: bookingId },
                relations: ['customer', 'businessOwner', 'customer.user', 'businessOwner.user'],
            });
            const serviceNames = newServices.map(s => s.businessService.service.name).join(', ');
            if (isCustomerAdding) {
                await this.notificationService.sendToBusinessOwner(fullBooking.businessOwner.userId, 'ADDON_SERVICE_ADDED_BY_CUSTOMER', {
                    bookingId: booking.id,
                    customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName}`,
                    serviceName: serviceNames,
                    price: String(addOnTotal),
                    newTotal: String(updatedBooking.totalAmount),
                });
            }
            else {
                const calculatedPrice = newServices.reduce((sum, s) => {
                    const price = s.businessService.customPrice || s.businessService.service.basePrice || 0;
                    return sum + (typeof price === 'string' ? parseFloat(price) : Number(price));
                }, 0);
                await this.notificationService.sendToCustomer(fullBooking.customer.userId, 'ADDON_SERVICE_PENDING_APPROVAL', {
                    bookingId: booking.id,
                    serviceName: serviceNames,
                    price: String(calculatedPrice),
                    salonName: fullBooking.businessOwner.businessName,
                });
            }
        }
        catch (error) {
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
    async approveAddOnService(customerId, bookingId, serviceId) {
        const bookingService = await this.bookingServiceRepository.findOne({
            where: { id: serviceId, bookingId },
            relations: ['booking'],
        });
        if (!bookingService) {
            throw new common_1.NotFoundException('Service not found in this booking');
        }
        if (bookingService.booking.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only approve services for your own bookings');
        }
        if (bookingService.booking.status !== entities_1.BookingStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Can only approve services for bookings that are in progress');
        }
        if (bookingService.booking.paymentCompleted) {
            throw new common_1.BadRequestException('Cannot approve services after payment has been completed');
        }
        if (!bookingService.isAddOn) {
            throw new common_1.BadRequestException('Can only approve add-on services, not original booking services');
        }
        if (bookingService.customerApproved) {
            throw new common_1.BadRequestException('This service has already been approved');
        }
        bookingService.customerApproved = true;
        bookingService.approvedAt = new Date();
        await this.bookingServiceRepository.save(bookingService);
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
        });
        const servicePrice = Number(bookingService.price);
        const currentAddOnTotal = Number(booking.addOnServicesTotal) || 0;
        const currentTotalAmount = Number(booking.totalAmount);
        booking.addOnServicesTotal = currentAddOnTotal + servicePrice;
        booking.totalAmount = currentTotalAmount + servicePrice;
        await this.bookingRepository.save(booking);
        try {
            const fullBooking = await this.bookingRepository.findOne({
                where: { id: bookingId },
                relations: ['customer', 'businessOwner', 'customer.user', 'businessOwner.user'],
            });
            await this.notificationService.sendToCustomer(fullBooking.customer.userId, 'ADDON_SERVICE_APPROVED_BY_CUSTOMER', {
                bookingId: booking.id,
                serviceName: bookingService.serviceName,
                newTotal: String(booking.totalAmount),
            });
            await this.notificationService.sendToBusinessOwner(fullBooking.businessOwner.userId, 'ADDON_SERVICE_APPROVED_BY_CUSTOMER', {
                bookingId: booking.id,
                customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName}`,
                serviceName: bookingService.serviceName,
                price: String(bookingService.servicePrice),
            });
        }
        catch (error) {
            console.error('Failed to send add-on service approval notifications:', error);
        }
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
    async rejectAddOnService(customerId, bookingId, serviceId) {
        const bookingService = await this.bookingServiceRepository.findOne({
            where: { id: serviceId, bookingId },
            relations: ['booking'],
        });
        if (!bookingService) {
            throw new common_1.NotFoundException('Service not found in this booking');
        }
        if (bookingService.booking.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only reject services for your own bookings');
        }
        if (bookingService.booking.status !== entities_1.BookingStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Can only reject services for bookings that are in progress');
        }
        if (bookingService.booking.paymentCompleted) {
            throw new common_1.BadRequestException('Cannot reject services after payment has been completed');
        }
        if (!bookingService.isAddOn) {
            throw new common_1.BadRequestException('Can only reject add-on services, not original booking services');
        }
        if (bookingService.customerApproved) {
            throw new common_1.BadRequestException('Cannot reject a service that has already been approved');
        }
        const serviceDetails = {
            id: bookingService.id,
            serviceName: bookingService.serviceName,
            servicePrice: Number(bookingService.servicePrice),
        };
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
        });
        await this.bookingServiceRepository.remove(bookingService);
        try {
            const fullBooking = await this.bookingRepository.findOne({
                where: { id: bookingId },
                relations: ['customer', 'businessOwner', 'customer.user', 'businessOwner.user'],
            });
            await this.notificationService.sendToCustomer(fullBooking.customer.userId, 'ADDON_SERVICE_REJECTED_BY_CUSTOMER', {
                bookingId: booking.id,
                serviceName: serviceDetails.serviceName,
            });
            await this.notificationService.sendToBusinessOwner(fullBooking.businessOwner.userId, 'ADDON_SERVICE_REJECTED_BY_CUSTOMER', {
                bookingId: booking.id,
                customerName: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName}`,
                serviceName: serviceDetails.serviceName,
            });
        }
        catch (error) {
            console.error('Failed to send add-on service rejection notifications:', error);
        }
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
    async getStaffBookings(staffId, query) {
        const staff = await this.staffRepository.findOne({
            where: { id: staffId },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
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
        }
        else if (query.fromDate) {
            queryBuilder.andWhere('booking.appointmentDate >= :fromDate', {
                fromDate: query.fromDate,
            });
        }
        else if (query.toDate) {
            queryBuilder.andWhere('booking.appointmentDate <= :toDate', {
                toDate: query.toDate,
            });
        }
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
    async validateBusinessHours(createBookingDto) {
        const appointmentDate = new Date(createBookingDto.requestedDate);
        const dayOfWeek = appointmentDate.getDay();
        const businessHours = await this.businessOperatingHoursRepository.findOne({
            where: { businessOwnerId: createBookingDto.businessOwnerId, dayOfWeek },
        });
        if (!businessHours || businessHours.isClosed) {
            throw new common_1.BadRequestException('Business is closed on this day');
        }
        if (createBookingDto.requestedStartTime < businessHours.openTime || createBookingDto.requestedEndTime > businessHours.closeTime) {
            throw new common_1.BadRequestException(`Booking time is outside business hours (${businessHours.openTime} - ${businessHours.closeTime})`);
        }
    }
    async validateStaffAvailability(staffId, appointmentDate, startTime, endTime) {
        const dayOfWeek = appointmentDate.getDay();
        const staffWorkingHours = await this.staffWorkingHoursRepository.findOne({
            where: { staffId, dayOfWeek, isActive: true },
        });
        if (!staffWorkingHours) {
            throw new common_1.BadRequestException('Staff member is not available on this day');
        }
        if (startTime < staffWorkingHours.startTime || endTime > staffWorkingHours.endTime) {
            throw new common_1.BadRequestException(`Booking time is outside staff working hours (${staffWorkingHours.startTime} - ${staffWorkingHours.endTime})`);
        }
    }
    transformToBookingDto(booking) {
        const customer = {
            id: booking.customer.id,
            firstName: booking.customer.firstName,
            lastName: booking.customer.lastName,
            email: booking.customer.user?.email || '',
            phone: booking.customer.user?.phone || '',
        };
        const business = {
            id: booking.businessOwner.id,
            shopId: booking.businessOwner.shopId,
            businessName: booking.businessOwner.businessName,
            address: booking.businessOwner.addresses && booking.businessOwner.addresses.length > 0 ?
                `${booking.businessOwner.addresses[0].streetAddress}, ${booking.businessOwner.addresses[0].city}, ${booking.businessOwner.addresses[0].state}` :
                'Address not available',
            phone: booking.businessOwner.user?.phone || '',
        };
        const staff = {
            id: booking.staff.id,
            firstName: booking.staff.firstName,
            lastName: booking.staff.lastName,
            profilePic: booking.staff.profilePic,
            profilePicCdnUrl: booking.staff.profilePicCdnUrl,
        };
        const service = {
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
    async previewDeliveryCharge(businessOwnerId, customerLatitude, customerLongitude, businessServiceIds, servicePackageIds) {
        let estimatedOrderAmount = 0;
        if (servicePackageIds && servicePackageIds.length > 0) {
            const servicePackages = await this.servicePackageRepository.find({
                where: {
                    id: (0, typeorm_2.In)(servicePackageIds),
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
        if (businessServiceIds && businessServiceIds.length > 0) {
            const businessServices = await this.businessServiceRepository.find({
                where: {
                    id: (0, typeorm_2.In)(businessServiceIds),
                    businessOwnerId,
                    isActive: true,
                },
            });
            for (const businessService of businessServices) {
                estimatedOrderAmount += businessService.customPrice;
            }
        }
        const deliveryCalculation = await this.deliveryChargeService.calculateDeliveryCharge(businessOwnerId, customerLatitude, customerLongitude, estimatedOrderAmount);
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
    async getCustomerTransactionHistory(customerId, startDate, endDate) {
        const customer = await this.customerRepository.findOne({
            where: { id: customerId },
            relations: ['user']
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const whereConditions = { customerId };
        if (startDate && endDate) {
            whereConditions.createdAt = (0, typeorm_2.Between)(startDate, endDate);
        }
        else if (startDate) {
            whereConditions.createdAt = (0, typeorm_2.Between)(startDate, new Date());
        }
        const bookings = await this.bookingRepository.find({
            where: whereConditions,
            relations: ['customer', 'customer.user', 'businessOwner', 'service'],
            order: { createdAt: 'DESC' }
        });
        const transactionsByDate = new Map();
        bookings.forEach(booking => {
            const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0];
            if (!transactionsByDate.has(bookingDate)) {
                transactionsByDate.set(bookingDate, []);
            }
            const customerName = customer.user?.email ||
                `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
                'Unknown Customer';
            const transactionItem = {
                bookingId: booking.id,
                customerName: customerName,
                bookingAmount: Number(booking.totalAmount),
                paymentMethod: booking.paymentMethod === settlement_transaction_entity_1.PaymentMethodType.COD ? customer_transaction_history_dto_1.PaymentMethod.CASH : customer_transaction_history_dto_1.PaymentMethod.ONLINE,
                bookingDateTime: new Date(booking.createdAt)
            };
            transactionsByDate.get(bookingDate).push(transactionItem);
        });
        const dayWiseHistory = [];
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
        dayWiseHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return {
            customerId,
            dayWiseHistory,
            totalAmount,
            totalTransactions
        };
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.BusinessService)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Staff)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.Service)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.StaffWorkingHours)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.BusinessOperatingHours)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.BookingRequest)),
    __param(9, (0, typeorm_1.InjectRepository)(entities_1.BookingRequestService)),
    __param(10, (0, typeorm_1.InjectRepository)(entities_1.ServicePackage)),
    __param(11, (0, typeorm_1.InjectRepository)(entities_1.ServicePackageItem)),
    __param(12, (0, typeorm_1.InjectRepository)(entities_1.BookingService)),
    __param(13, (0, common_1.Inject)((0, common_1.forwardRef)(() => commission_service_1.CommissionService))),
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
        typeorm_2.Repository,
        commission_service_1.CommissionService,
        delivery_charge_service_1.DeliveryChargeService,
        notification_service_1.NotificationService])
], BookingService);
//# sourceMappingURL=booking.service.js.map
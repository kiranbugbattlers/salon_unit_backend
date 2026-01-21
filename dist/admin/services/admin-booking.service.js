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
exports.AdminBookingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
const settlement_transaction_entity_1 = require("../../database/entities/settlement-transaction.entity");
let AdminBookingService = class AdminBookingService {
    constructor(bookingRepository, bookingRequestRepository, customerRepository, businessOwnerRepository, staffRepository, serviceRepository, paymentRepository, commissionTransactionRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingRequestRepository = bookingRequestRepository;
        this.customerRepository = customerRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.staffRepository = staffRepository;
        this.serviceRepository = serviceRepository;
        this.paymentRepository = paymentRepository;
        this.commissionTransactionRepository = commissionTransactionRepository;
    }
    async getAllBookings(query) {
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
        }
        else if (query.dateFrom) {
            queryBuilder.andWhere('booking.appointmentDate >= :dateFrom', { dateFrom: query.dateFrom });
        }
        else if (query.dateTo) {
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
    async getAllBookingRequests(query) {
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
                case entities_1.BookingRequestStatus.REJECTED:
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
        }
        else if (query.dateFrom) {
            queryBuilder.andWhere('bookingRequest.requestedDate >= :dateFrom', { dateFrom: query.dateFrom });
        }
        else if (query.dateTo) {
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
    async getBookingDetails(bookingId) {
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
            throw new common_1.NotFoundException('Booking not found');
        }
        return this.transformToAdminBookingDetail(booking);
    }
    async getBookingRequestDetails(bookingRequestId) {
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
            throw new common_1.NotFoundException('Booking request not found');
        }
        return this.transformToAdminBookingRequestDetail(bookingRequest);
    }
    async forceCancelBooking(bookingId, adminId, cancelDto) {
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
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status === entities_1.BookingStatus.CANCELLED) {
            throw new common_1.BadRequestException('Booking is already cancelled');
        }
        const originalStatus = booking.status;
        booking.status = entities_1.BookingStatus.CANCELLED;
        booking.cancellationReason = `[ADMIN OVERRIDE] ${cancelDto.reason}`;
        booking.cancelledAt = new Date();
        await this.bookingRepository.save(booking);
        return this.transformToAdminBookingDetail(booking);
    }
    async forceCompleteBooking(bookingId, adminId, completeDto) {
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
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status === entities_1.BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Booking is already completed');
        }
        if (booking.status === entities_1.BookingStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot complete a cancelled booking');
        }
        booking.status = entities_1.BookingStatus.COMPLETED;
        booking.serviceCompletedAt = new Date();
        const adminNote = `[ADMIN OVERRIDE] ${completeDto.reason}`;
        if (completeDto.notes) {
            booking.specialRequests = booking.specialRequests
                ? `${booking.specialRequests}\n\n${adminNote}\nNotes: ${completeDto.notes}`
                : `${adminNote}\nNotes: ${completeDto.notes}`;
        }
        else {
            booking.specialRequests = booking.specialRequests
                ? `${booking.specialRequests}\n\n${adminNote}`
                : adminNote;
        }
        if (!booking.serviceStartedAt) {
            booking.serviceStartedAt = new Date();
        }
        if (!booking.otpVerifiedAt) {
            booking.otpVerifiedAt = new Date();
        }
        await this.bookingRepository.save(booking);
        return this.transformToAdminBookingDetail(booking);
    }
    async getBookingAnalytics(query) {
        const queryBuilder = this.bookingRepository.createQueryBuilder('booking');
        if (query.dateFrom && query.dateTo) {
            queryBuilder.andWhere('booking.appointmentDate BETWEEN :dateFrom AND :dateTo', {
                dateFrom: query.dateFrom,
                dateTo: query.dateTo,
            });
        }
        else if (query.dateFrom) {
            queryBuilder.andWhere('booking.appointmentDate >= :dateFrom', { dateFrom: query.dateFrom });
        }
        else if (query.dateTo) {
            queryBuilder.andWhere('booking.appointmentDate <= :dateTo', { dateTo: query.dateTo });
        }
        if (query.businessOwnerId) {
            queryBuilder.andWhere('booking.businessOwnerId = :businessOwnerId', { businessOwnerId: query.businessOwnerId });
        }
        const allBookings = await queryBuilder
            .leftJoinAndSelect('booking.businessOwner', 'businessOwner')
            .leftJoinAndSelect('booking.customer', 'customer')
            .leftJoinAndSelect('booking.bookingServices', 'bookingServices')
            .leftJoinAndSelect('booking.commissionTransaction', 'commissionTransaction')
            .getMany();
        const totalBookings = allBookings.length;
        const byStatus = {
            pending: allBookings.filter(b => b.status === entities_1.BookingStatus.PENDING).length,
            confirmed: allBookings.filter(b => b.status === entities_1.BookingStatus.CONFIRMED).length,
            inProgress: allBookings.filter(b => b.status === entities_1.BookingStatus.IN_PROGRESS).length,
            completed: allBookings.filter(b => b.status === entities_1.BookingStatus.COMPLETED).length,
            cancelled: allBookings.filter(b => b.status === entities_1.BookingStatus.CANCELLED).length,
        };
        const byPaymentMethod = {
            online: allBookings.filter(b => b.paymentMethod === settlement_transaction_entity_1.PaymentMethodType.ONLINE || !b.paymentMethod).length,
            cod: allBookings.filter(b => b.paymentMethod === settlement_transaction_entity_1.PaymentMethodType.COD).length,
        };
        const completedBookings = allBookings.filter(b => b.status === entities_1.BookingStatus.COMPLETED);
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
        const businessMap = new Map();
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
        const customerMap = new Map();
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
        const bookingsByDay = {};
        const revenueByDay = {};
        allBookings.forEach(booking => {
            const date = booking.appointmentDate instanceof Date
                ? booking.appointmentDate.toISOString().split('T')[0]
                : booking.appointmentDate;
            bookingsByDay[date] = (bookingsByDay[date] || 0) + 1;
            if (booking.status === entities_1.BookingStatus.COMPLETED) {
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
    transformToAdminBookingDetail(booking) {
        const customer = {
            id: booking.customer.id,
            firstName: booking.customer.firstName,
            lastName: booking.customer.lastName,
            email: booking.customer.user?.email || '',
            phone: booking.customer.user?.phone || '',
            profilePic: undefined,
        };
        const business = {
            id: booking.businessOwner.id,
            shopId: booking.businessOwner.shopId,
            businessName: booking.businessOwner.businessName,
            address: booking.businessOwner.addresses && booking.businessOwner.addresses.length > 0
                ? `${booking.businessOwner.addresses[0].streetAddress}, ${booking.businessOwner.addresses[0].city}, ${booking.businessOwner.addresses[0].state}`
                : 'Address not available',
            phone: booking.businessOwner.user?.phone || '',
            email: booking.businessOwner.user?.email,
        };
        const staff = {
            id: booking.staff.id,
            firstName: booking.staff.firstName,
            lastName: booking.staff.lastName,
            profilePic: booking.staff.profilePic,
            phone: booking.staff.phone,
        };
        const service = {
            id: booking.service.id,
            name: booking.service.name,
            description: booking.service.description || '',
            basePrice: booking.service.basePrice || 0,
            defaultDuration: booking.service.defaultDuration || 0,
        };
        let paymentInfo;
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
        let commissionInfo;
        if (booking.commissionTransaction) {
            const commission = booking.commissionTransaction;
            commissionInfo = {
                commissionTransactionId: commission.id,
                businessOwnerCommission: commission.businessOwnerCommissionAmount,
                customerReward: commission.customerRewardAmount,
                commissionPercent: commission.businessOwnerCommissionPercent,
                rewardPercent: commission.customerRewardPercent,
            };
        }
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
    transformToAdminBookingRequestDetail(bookingRequest) {
        const customer = {
            id: bookingRequest.customer.id,
            firstName: bookingRequest.customer.firstName,
            lastName: bookingRequest.customer.lastName,
            email: bookingRequest.customer.user?.email || '',
            phone: bookingRequest.customer.user?.phone || '',
            profilePic: undefined,
        };
        const business = {
            id: bookingRequest.businessOwner.id,
            shopId: bookingRequest.businessOwner.shopId,
            businessName: bookingRequest.businessOwner.businessName,
            address: bookingRequest.businessOwner.addresses && bookingRequest.businessOwner.addresses.length > 0
                ? `${bookingRequest.businessOwner.addresses[0].streetAddress}, ${bookingRequest.businessOwner.addresses[0].city}`
                : 'Address not available',
            phone: bookingRequest.businessOwner.user?.phone || '',
            email: bookingRequest.businessOwner.user?.email,
        };
        const requestedStaff = bookingRequest.requestedStaff ? {
            id: bookingRequest.requestedStaff.id,
            firstName: bookingRequest.requestedStaff.firstName,
            lastName: bookingRequest.requestedStaff.lastName,
            profilePic: bookingRequest.requestedStaff.profilePic,
            phone: bookingRequest.requestedStaff.phone,
        } : undefined;
        const assignedStaff = bookingRequest.assignedStaff ? {
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
        let paymentInfo;
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
    async getBusinessPerformanceReport(query) {
        const dateFrom = new Date(query.dateFrom);
        const dateTo = new Date(query.dateTo);
        if (dateFrom > dateTo) {
            throw new common_1.BadRequestException('dateFrom must be before or equal to dateTo');
        }
        const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 366) {
            throw new common_1.BadRequestException('Date range cannot exceed 366 days');
        }
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
        if (query.shopId) {
            queryBuilder.andWhere('businessOwner.shopId = :shopId', { shopId: query.shopId });
        }
        const allBookings = await queryBuilder.getMany();
        const businessMap = new Map();
        allBookings.forEach(booking => {
            const businessId = booking.businessOwnerId;
            const appointmentDate = booking.appointmentDate instanceof Date
                ? booking.appointmentDate
                : new Date(booking.appointmentDate);
            let period;
            if (query.reportType === 'daily') {
                period = appointmentDate.toISOString().split('T')[0];
            }
            else {
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
        const businessPerformanceList = [];
        businessMap.forEach((periodMap, businessId) => {
            periodMap.forEach((bookings, period) => {
                const business = bookings[0].businessOwner;
                const totalBookings = bookings.length;
                const completedBookings = bookings.filter(b => b.status === entities_1.BookingStatus.COMPLETED);
                const cancelledBookings = bookings.filter(b => b.status === entities_1.BookingStatus.CANCELLED);
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
                const metrics = {
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
        const uniqueBusinesses = new Set(businessPerformanceList.map(b => b.businessId));
        const totalBookings = businessPerformanceList.reduce((sum, b) => sum + b.metrics.totalBookings, 0);
        const totalRevenue = businessPerformanceList.reduce((sum, b) => sum + b.metrics.totalRevenue, 0);
        const totalCommission = businessPerformanceList.reduce((sum, b) => sum + b.metrics.totalCommission, 0);
        const averageRevenuePerBusiness = uniqueBusinesses.size > 0 ? totalRevenue / uniqueBusinesses.size : 0;
        const summary = {
            totalBusinesses: uniqueBusinesses.size,
            totalBookings,
            totalRevenue,
            totalCommission,
            averageRevenuePerBusiness,
        };
        const page = query.page || 1;
        const limit = query.limit || 50;
        const skip = (page - 1) * limit;
        const total = businessPerformanceList.length;
        const paginatedBusinesses = businessPerformanceList.slice(skip, skip + limit);
        const data = {
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
};
exports.AdminBookingService = AdminBookingService;
exports.AdminBookingService = AdminBookingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BookingRequest)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Staff)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.Service)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.Payment)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.CommissionTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminBookingService);
//# sourceMappingURL=admin-booking.service.js.map
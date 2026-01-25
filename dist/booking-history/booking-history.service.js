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
exports.BookingHistoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("../database/entities/booking.entity");
const payment_entity_1 = require("../database/entities/payment.entity");
const customer_entity_1 = require("../database/entities/customer.entity");
let BookingHistoryService = class BookingHistoryService {
    constructor(bookingRepository, paymentRepository, customerRepository) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.customerRepository = customerRepository;
    }
    async findAll(customerId, query) {
        console.log('Booking History Query:', JSON.stringify(query, null, 2));
        console.log('Customer ID:', customerId);
        const { date, appointmentDate, paymentMethod, fromDate, toDate, page = 1, limit = 10, sortBy = 'bookingDateTime', sortOrder = 'DESC' } = query;
        const whereConditions = { customerId };
        console.log('Date filtering temporarily disabled for testing');
        const validSortFields = ['appointmentDate', 'createdAt', 'totalAmount'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'appointmentDate';
        const sortDirection = sortOrder.toUpperCase();
        const total = await this.bookingRepository.count({
            where: whereConditions,
        });
        console.log('Booking History Query Conditions:', JSON.stringify(whereConditions, null, 2));
        console.log('Total bookings found:', total);
        const skip = (page - 1) * limit;
        const totalPages = Math.ceil(total / limit);
        const bookings = await this.bookingRepository.find({
            where: whereConditions,
            relations: ['customer'],
            order: {
                [sortField]: sortDirection,
            },
            skip,
            take: limit,
        });
        console.log('Raw bookings found:', bookings.length);
        console.log('Sample booking:', bookings[0] ? JSON.stringify(bookings[0], null, 2) : 'No bookings');
        const bookingDtos = [];
        for (const booking of bookings) {
            console.log('Transforming booking:', booking.id);
            const dto = await this.transformToDto(booking, paymentMethod);
            console.log('DTO result:', dto ? 'Success' : 'Failed/Null');
            if (dto) {
                bookingDtos.push(dto);
            }
        }
        console.log('Final DTOs count:', bookingDtos.length);
        return {
            bookings: bookingDtos,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
        };
    }
    async findOne(customerId, bookingId) {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['customer'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.customerId !== customerId) {
            throw new common_1.ForbiddenException('Access denied: You can only view your own bookings');
        }
        return this.transformToDto(booking);
    }
    async transformToDto(booking, paymentMethodFilter) {
        let customerName = 'Unknown Customer';
        if (booking.customer) {
            customerName = `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim() || 'Unknown Customer';
        }
        let paymentMethod = 'Unknown';
        try {
            const payment = await this.paymentRepository.findOne({
                where: { bookingId: booking.id },
                order: { createdAt: 'DESC' },
            });
            if (payment) {
                paymentMethod = payment.paymentMethod || 'Unknown';
            }
        }
        catch (error) {
            paymentMethod = 'Unknown';
        }
        if (paymentMethodFilter && paymentMethod.toLowerCase() !== paymentMethodFilter.toLowerCase()) {
            console.log(`Payment method filter: ${paymentMethodFilter} != ${paymentMethod}, returning null`);
            return null;
        }
        let bookingDateTime = booking.createdAt;
        if (booking.appointmentDate) {
            const appointmentDate = booking.appointmentDate instanceof Date
                ? booking.appointmentDate
                : new Date(booking.appointmentDate);
            if (booking.startTime) {
                const [hours, minutes] = booking.startTime.split(':');
                appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            }
            bookingDateTime = appointmentDate;
        }
        return {
            bookingId: booking.id,
            customerName,
            bookingAmount: booking.totalAmount,
            paymentMethod,
            bookingDateTime,
            createdAt: booking.createdAt,
        };
    }
};
exports.BookingHistoryService = BookingHistoryService;
exports.BookingHistoryService = BookingHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BookingHistoryService);
//# sourceMappingURL=booking-history.service.js.map
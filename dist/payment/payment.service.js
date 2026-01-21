"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
const entities_1 = require("../database/entities");
const enums_1 = require("../common/enums");
const notification_service_1 = require("../notification/notification.service");
let PaymentService = class PaymentService {
    constructor(paymentRepository, bookingRequestRepository, bookingRepository, configService, notificationService) {
        this.paymentRepository = paymentRepository;
        this.bookingRequestRepository = bookingRequestRepository;
        this.bookingRepository = bookingRepository;
        this.configService = configService;
        this.notificationService = notificationService;
        this.razorpay = new razorpay_1.default({
            key_id: this.configService.get('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
        });
    }
    async createPaymentOrder(customerId, createDto) {
        const booking = await this.bookingRepository.findOne({
            where: { id: createDto.bookingId },
            relations: ['customer', 'businessOwner', 'bookingServices'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only create payment for your own bookings');
        }
        if (booking.status !== entities_1.BookingStatus.IN_PROGRESS) {
            if (booking.status === entities_1.BookingStatus.CONFIRMED) {
                throw new common_1.BadRequestException('Service has not started yet. Payment can only be made during or after service');
            }
            if (booking.status === entities_1.BookingStatus.COMPLETED) {
                throw new common_1.BadRequestException('Service already completed');
            }
            throw new common_1.BadRequestException('Booking must be in progress to make payment');
        }
        if (booking.paymentCompleted) {
            throw new common_1.BadRequestException('Payment already completed for this booking');
        }
        const existingPayment = await this.paymentRepository.findOne({
            where: { bookingId: booking.id, status: enums_1.PaymentStatus.SUCCESS },
        });
        if (existingPayment) {
            throw new common_1.BadRequestException('Payment already completed for this booking');
        }
        const baseAmount = Number(booking.totalAmount);
        const addOnTotal = Number(booking.addOnServicesTotal || 0);
        const totalAmount = baseAmount;
        const amountInPaise = Math.round(totalAmount * 100);
        const razorpayOrder = await this.razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `booking_${booking.id.substring(0, 32)}`,
            notes: {
                bookingId: booking.id,
                bookingRequestId: booking.bookingRequestId,
                customerId: booking.customerId,
                businessOwnerId: booking.businessOwnerId,
            },
        });
        const payment = this.paymentRepository.create({
            bookingId: booking.id,
            bookingRequestId: booking.bookingRequestId,
            customerId: booking.customerId,
            businessOwnerId: booking.businessOwnerId,
            razorpayOrderId: razorpayOrder.id,
            amount: totalAmount,
            currency: 'INR',
            status: enums_1.PaymentStatus.CREATED,
        });
        const savedPayment = await this.paymentRepository.save(payment);
        if (booking.bookingRequestId) {
            const bookingRequest = await this.bookingRequestRepository.findOne({
                where: { id: booking.bookingRequestId }
            });
            if (bookingRequest) {
                bookingRequest.paymentId = savedPayment.id;
                await this.bookingRequestRepository.save(bookingRequest);
            }
        }
        const serviceNames = booking.bookingServices
            ?.map(bs => bs.serviceName)
            .join(', ') || 'Services';
        const responseData = {
            orderId: razorpayOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            razorpayKeyId: this.configService.get('RAZORPAY_KEY_ID'),
            bookingRequestId: booking.id,
            businessName: booking.businessOwner.businessName,
            description: serviceNames,
        };
        return {
            code: 200,
            success: true,
            message: 'Payment order created successfully',
            data: responseData,
        };
    }
    async verifyPayment(customerId, verifyDto) {
        const booking = await this.bookingRepository.findOne({
            where: { id: verifyDto.bookingId },
            relations: ['customer', 'businessOwner', 'staff'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only verify payment for your own bookings');
        }
        const payment = await this.paymentRepository.findOne({
            where: {
                bookingId: booking.id,
                razorpayOrderId: verifyDto.razorpayOrderId,
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment record not found');
        }
        if (payment.status === enums_1.PaymentStatus.SUCCESS && payment.razorpayPaymentId) {
            throw new common_1.BadRequestException('Payment already verified');
        }
        const isValidSignature = this.verifyRazorpaySignature(verifyDto.razorpayOrderId, verifyDto.razorpayPaymentId, verifyDto.razorpaySignature);
        if (!isValidSignature) {
            payment.status = enums_1.PaymentStatus.FAILED;
            payment.errorCode = 'SIGNATURE_VERIFICATION_FAILED';
            payment.errorDescription = 'Payment signature verification failed';
            await this.paymentRepository.save(payment);
            throw new common_1.BadRequestException('Payment signature verification failed');
        }
        let razorpayPayment = null;
        try {
            razorpayPayment = await this.razorpay.payments.fetch(verifyDto.razorpayPaymentId);
            payment.razorpayPaymentId = verifyDto.razorpayPaymentId;
            payment.razorpaySignature = verifyDto.razorpaySignature;
            payment.status = enums_1.PaymentStatus.SUCCESS;
            payment.paymentMethod = razorpayPayment.method;
            payment.paymentCompletedAt = new Date();
            payment.paymentMetadata = razorpayPayment;
            if (razorpayPayment.method === 'card') {
                payment.cardNetwork = razorpayPayment.card?.network;
            }
            else if (razorpayPayment.method === 'upi') {
                payment.vpa = razorpayPayment.vpa;
            }
            else if (razorpayPayment.method === 'netbanking') {
                payment.bankName = razorpayPayment.bank;
            }
            else if (razorpayPayment.method === 'wallet') {
                payment.walletName = razorpayPayment.wallet;
            }
            await this.paymentRepository.save(payment);
            booking.paymentCompleted = true;
            booking.paymentMethod = entities_1.PaymentMethodType.ONLINE;
            await this.bookingRepository.save(booking);
        }
        catch (error) {
            payment.razorpayPaymentId = verifyDto.razorpayPaymentId;
            payment.razorpaySignature = verifyDto.razorpaySignature;
            payment.status = enums_1.PaymentStatus.SUCCESS;
            payment.paymentCompletedAt = new Date();
            await this.paymentRepository.save(payment);
            booking.paymentCompleted = true;
            await this.bookingRepository.save(booking);
        }
        try {
            const paymentMethodName = razorpayPayment?.method || 'online';
            await this.notificationService.sendToCustomer(booking.customer.userId, 'PAYMENT_COMPLETED', {
                amount: payment.amount,
                bookingId: booking.id,
                transactionId: verifyDto.razorpayPaymentId,
                paymentMethod: paymentMethodName.toUpperCase(),
            });
            await this.notificationService.sendToBusinessOwner(booking.businessOwner.userId, 'PAYMENT_COMPLETED', {
                amount: payment.amount,
                bookingId: booking.id,
                customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
                paymentMethod: paymentMethodName.toUpperCase(),
                transactionId: verifyDto.razorpayPaymentId,
            });
        }
        catch (error) {
            console.error('Failed to send payment completed notifications:', error);
        }
        const responseData = {
            status: 'payment_completed',
            otpCode: booking.otpCode,
            bookingId: booking.id,
            paymentId: payment.id,
            razorpayPaymentId: verifyDto.razorpayPaymentId,
        };
        return {
            code: 200,
            success: true,
            message: 'Payment verified successfully. Service can now be completed after finishing.',
            data: responseData,
        };
    }
    async confirmCodBooking(customerId, confirmDto) {
        const booking = await this.bookingRepository.findOne({
            where: { id: confirmDto.bookingId },
            relations: ['customer', 'businessOwner', 'staff'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only confirm COD payment for your own bookings');
        }
        if (booking.paymentCompleted) {
            throw new common_1.BadRequestException('Payment already completed for this booking');
        }
        const totalAmount = Number(booking.totalAmount);
        const payment = this.paymentRepository.create({
            bookingId: booking.id,
            bookingRequestId: booking.bookingRequestId,
            customerId: booking.customerId,
            businessOwnerId: booking.businessOwnerId,
            razorpayOrderId: null,
            amount: totalAmount,
            currency: 'INR',
            status: enums_1.PaymentStatus.SUCCESS,
            paymentMethod: 'cod',
            paymentCompletedAt: new Date(),
        });
        const savedPayment = await this.paymentRepository.save(payment);
        if (booking.bookingRequestId) {
            const bookingRequest = await this.bookingRequestRepository.findOne({
                where: { id: booking.bookingRequestId }
            });
            if (bookingRequest) {
                bookingRequest.paymentId = savedPayment.id;
                await this.bookingRequestRepository.save(bookingRequest);
            }
        }
        booking.paymentCompleted = true;
        booking.paymentMethod = entities_1.PaymentMethodType.COD;
        await this.bookingRepository.save(booking);
        try {
            await this.notificationService.sendToCustomer(booking.customer.userId, 'PAYMENT_COD_CONFIRMED', {
                amount: savedPayment.amount,
                bookingId: booking.id,
                salonName: booking.businessOwner.businessName,
            });
            await this.notificationService.sendToBusinessOwner(booking.businessOwner.userId, 'PAYMENT_COD_CONFIRMED', {
                amount: savedPayment.amount,
                bookingId: booking.id,
                customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
            });
        }
        catch (error) {
            console.error('Failed to send COD confirmed notifications:', error);
        }
        const responseData = {
            status: 'payment_completed',
            otpCode: booking.otpCode,
            bookingId: booking.id,
            paymentId: savedPayment.id,
            razorpayPaymentId: null,
        };
        return {
            code: 200,
            success: true,
            message: 'COD payment confirmed successfully. Service can now be completed after finishing.',
            data: responseData,
        };
    }
    async getPaymentByBookingRequest(bookingRequestId) {
        const bookingRequest = await this.bookingRequestRepository.findOne({
            where: { id: bookingRequestId },
            relations: ['customer', 'businessOwner', 'confirmedBooking'],
        });
        if (!bookingRequest) {
            throw new common_1.NotFoundException('Booking request not found');
        }
        const payment = await this.paymentRepository.findOne({
            where: { bookingRequestId },
            relations: ['booking'],
        });
        if (payment) {
            const booking = payment.booking || bookingRequest.confirmedBooking || null;
            const paymentMethod = booking?.paymentMethod || payment.paymentMethod;
            let cleanedPayment = payment;
            if (paymentMethod === 'cod' || paymentMethod === entities_1.PaymentMethodType.COD) {
                cleanedPayment = {
                    ...payment,
                    razorpayOrderId: null,
                    razorpayPaymentId: null,
                    razorpaySignature: null,
                    cardNetwork: null,
                    bankName: null,
                    walletName: null,
                    vpa: null,
                    paymentMetadata: null,
                };
            }
            return {
                paymentExists: true,
                paymentStatus: payment.status,
                bookingRequest,
                payment: cleanedPayment,
                booking,
            };
        }
        else {
            let paymentStatus = 'NOT_CREATED';
            if (bookingRequest.status === entities_1.BookingRequestStatus.APPROVED) {
                if (bookingRequest.confirmedBooking) {
                    paymentStatus = bookingRequest.confirmedBooking.paymentCompleted ? 'SUCCESS' : 'NOT_CREATED';
                }
                else {
                    paymentStatus = 'NOT_CREATED';
                }
            }
            return {
                paymentExists: false,
                paymentStatus,
                bookingRequest,
                payment: null,
                booking: bookingRequest.confirmedBooking || null,
            };
        }
    }
    verifyRazorpaySignature(orderId, paymentId, signature) {
        const razorpaySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        const text = orderId + '|' + paymentId;
        const generatedSignature = crypto
            .createHmac('sha256', razorpaySecret)
            .update(text)
            .digest('hex');
        return generatedSignature === signature;
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BookingRequest)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        notification_service_1.NotificationService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map
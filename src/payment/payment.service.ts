import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import {
  Payment,
  BookingRequest,
  Booking,
  BookingRequestStatus,
  BookingStatus,
  ServiceLocation,
  PaymentMethodType,
} from '../database/entities';
import { PaymentStatus } from '../common/enums';
import {
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  PaymentOrderResponseDto,
  VerifyPaymentResponseDto,
  PaymentOrderDataDto,
  VerifyPaymentDataDto,
  PaymentDetailsDataDto,
  ConfirmCodBookingDto,
} from './dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PaymentService {
  private razorpay: any;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(BookingRequest)
    private readonly bookingRequestRepository: Repository<BookingRequest>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {
    // Initialize Razorpay
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async createPaymentOrder(customerId: string, createDto: CreatePaymentOrderDto): Promise<PaymentOrderResponseDto> {
    // Fetch booking with relations
    const booking = await this.bookingRepository.findOne({
      where: { id: createDto.bookingId },
      relations: ['customer', 'businessOwner', 'bookingServices'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify ownership
    if (booking.customerId !== customerId) {
      throw new ForbiddenException('You can only create payment for your own bookings');
    }

    // Check if booking is in correct status (must be IN_PROGRESS for payment)
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      if (booking.status === BookingStatus.CONFIRMED) {
        throw new BadRequestException('Service has not started yet. Payment can only be made during or after service');
      }
      if (booking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException('Service already completed');
      }
      throw new BadRequestException('Booking must be in progress to make payment');
    }

    // Check if payment already completed
    if (booking.paymentCompleted) {
      throw new BadRequestException('Payment already completed for this booking');
    }

    // Check if payment already exists
    const existingPayment = await this.paymentRepository.findOne({
      where: { bookingId: booking.id, status: PaymentStatus.SUCCESS },
    });

    if (existingPayment) {
      throw new BadRequestException('Payment already completed for this booking');
    }

    // Calculate amount in smallest currency unit (paise for INR)
    // booking.totalAmount includes: original services + APPROVED add-ons + delivery charge
    // Pending add-ons (customerApproved: false) are NOT included in totalAmount
    // Only approved add-ons (customerApproved: true) contribute to addOnServicesTotal and totalAmount
    const baseAmount = Number(booking.totalAmount);
    const addOnTotal = Number(booking.addOnServicesTotal || 0);
    const totalAmount = baseAmount; // totalAmount already includes approved add-ons
    const amountInPaise = Math.round(totalAmount * 100);

    // Create Razorpay order
    const razorpayOrder = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${booking.id.substring(0, 32)}`, // Truncate to fit 40-char limit
      notes: {
        bookingId: booking.id,
        bookingRequestId: booking.bookingRequestId, // Keep for reference
        customerId: booking.customerId,
        businessOwnerId: booking.businessOwnerId,
      },
    });

    // Save payment record
    const payment = this.paymentRepository.create({
      bookingId: booking.id,
      bookingRequestId: booking.bookingRequestId, // Keep reference for backward compatibility
      customerId: booking.customerId,
      businessOwnerId: booking.businessOwnerId,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR',
      status: PaymentStatus.CREATED,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update booking request with payment reference
    if (booking.bookingRequestId) {
      const bookingRequest = await this.bookingRequestRepository.findOne({
        where: { id: booking.bookingRequestId }
      });
      if (bookingRequest) {
        bookingRequest.paymentId = savedPayment.id;
        await this.bookingRequestRepository.save(bookingRequest);
      }
    }

    // Get service names from booking services
    const serviceNames = booking.bookingServices
      ?.map(bs => bs.serviceName)
      .join(', ') || 'Services';

    const responseData: PaymentOrderDataDto = {
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      razorpayKeyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
      bookingRequestId: booking.id, // Using bookingId in place of bookingRequestId for backward compatibility
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

  async verifyPayment(customerId: string, verifyDto: VerifyPaymentDto): Promise<VerifyPaymentResponseDto> {
    // Fetch existing booking (already created during approval)
    const booking = await this.bookingRepository.findOne({
      where: { id: verifyDto.bookingId },
      relations: ['customer', 'businessOwner', 'staff'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify ownership
    if (booking.customerId !== customerId) {
      throw new ForbiddenException('You can only verify payment for your own bookings');
    }

    // Fetch payment record
    const payment = await this.paymentRepository.findOne({
      where: {
        bookingId: booking.id,
        razorpayOrderId: verifyDto.razorpayOrderId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    // Check if already verified
    if (payment.status === PaymentStatus.SUCCESS && payment.razorpayPaymentId) {
      throw new BadRequestException('Payment already verified');
    }

    // Verify Razorpay signature
    const isValidSignature = this.verifyRazorpaySignature(
      verifyDto.razorpayOrderId,
      verifyDto.razorpayPaymentId,
      verifyDto.razorpaySignature,
    );

    if (!isValidSignature) {
      // Update payment as failed
      payment.status = PaymentStatus.FAILED;
      payment.errorCode = 'SIGNATURE_VERIFICATION_FAILED';
      payment.errorDescription = 'Payment signature verification failed';
      await this.paymentRepository.save(payment);

      throw new BadRequestException('Payment signature verification failed');
    }

    // Fetch payment details from Razorpay
    let razorpayPayment: any = null;
    try {
      razorpayPayment = await this.razorpay.payments.fetch(verifyDto.razorpayPaymentId);

      // Update payment record
      payment.razorpayPaymentId = verifyDto.razorpayPaymentId;
      payment.razorpaySignature = verifyDto.razorpaySignature;
      payment.status = PaymentStatus.SUCCESS;
      payment.paymentMethod = razorpayPayment.method;
      payment.paymentCompletedAt = new Date();
      payment.paymentMetadata = razorpayPayment;

      // Store payment method specific details
      if (razorpayPayment.method === 'card') {
        payment.cardNetwork = razorpayPayment.card?.network;
      } else if (razorpayPayment.method === 'upi') {
        payment.vpa = razorpayPayment.vpa;
      } else if (razorpayPayment.method === 'netbanking') {
        payment.bankName = razorpayPayment.bank;
      } else if (razorpayPayment.method === 'wallet') {
        payment.walletName = razorpayPayment.wallet;
      }

      await this.paymentRepository.save(payment);

      // Update booking's payment status (CRITICAL: Don't create new booking!)
      booking.paymentCompleted = true;
      // Map Razorpay payment methods to our enum (all online methods map to 'online')
      booking.paymentMethod = PaymentMethodType.ONLINE;
      await this.bookingRepository.save(booking);
    } catch (error) {
      // Even if fetching payment details fails, we can proceed if signature is valid
      payment.razorpayPaymentId = verifyDto.razorpayPaymentId;
      payment.razorpaySignature = verifyDto.razorpaySignature;
      payment.status = PaymentStatus.SUCCESS;
      payment.paymentCompletedAt = new Date();
      await this.paymentRepository.save(payment);

      // Update booking's payment status
      booking.paymentCompleted = true;
      await this.bookingRepository.save(booking);
    }

    // Send notifications to both customer and business owner - payment completed
    try {
      const paymentMethodName = razorpayPayment?.method || 'online';

      // Notify customer - payment successful
      await this.notificationService.sendToCustomer(
        booking.customer.userId,
        'PAYMENT_COMPLETED',
        {
          amount: payment.amount,
          bookingId: booking.id,
          transactionId: verifyDto.razorpayPaymentId,
          paymentMethod: paymentMethodName.toUpperCase(),
        }
      );

      // Notify business owner - payment received
      await this.notificationService.sendToBusinessOwner(
        booking.businessOwner.userId,
        'PAYMENT_COMPLETED',
        {
          amount: payment.amount,
          bookingId: booking.id,
          customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
          paymentMethod: paymentMethodName.toUpperCase(),
          transactionId: verifyDto.razorpayPaymentId,
        }
      );
    } catch (error) {
      console.error('Failed to send payment completed notifications:', error);
    }

    const responseData: VerifyPaymentDataDto = {
      status: 'payment_completed',
      otpCode: booking.otpCode, // Return existing OTP from booking
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

  async confirmCodBooking(customerId: string, confirmDto: ConfirmCodBookingDto): Promise<VerifyPaymentResponseDto> {
    // Fetch existing booking (already created during approval)
    const booking = await this.bookingRepository.findOne({
      where: { id: confirmDto.bookingId },
      relations: ['customer', 'businessOwner', 'staff'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify ownership
    if (booking.customerId !== customerId) {
      throw new ForbiddenException('You can only confirm COD payment for your own bookings');
    }

    // Check if payment already completed
    if (booking.paymentCompleted) {
      throw new BadRequestException('Payment already completed for this booking');
    }

    // Calculate total amount including add-ons
    const totalAmount = Number(booking.totalAmount); // Already includes add-ons and delivery

    // Create payment record for COD
    const payment = this.paymentRepository.create({
      bookingId: booking.id,
      bookingRequestId: booking.bookingRequestId, // Keep reference for backward compatibility
      customerId: booking.customerId,
      businessOwnerId: booking.businessOwnerId,
      razorpayOrderId: null, // No Razorpay order for COD
      amount: totalAmount,
      currency: 'INR',
      status: PaymentStatus.SUCCESS,
      paymentMethod: 'cod',
      paymentCompletedAt: new Date(),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update booking request with payment reference
    if (booking.bookingRequestId) {
      const bookingRequest = await this.bookingRequestRepository.findOne({
        where: { id: booking.bookingRequestId }
      });
      if (bookingRequest) {
        bookingRequest.paymentId = savedPayment.id;
        await this.bookingRequestRepository.save(bookingRequest);
      }
    }

    // Update booking's payment status (CRITICAL: Don't create new booking!)
    booking.paymentCompleted = true;
    booking.paymentMethod = PaymentMethodType.COD;
    await this.bookingRepository.save(booking);

    // Send notifications to both customer and business owner - COD confirmed
    try {
      // Notify customer - COD confirmed
      await this.notificationService.sendToCustomer(
        booking.customer.userId,
        'PAYMENT_COD_CONFIRMED',
        {
          amount: savedPayment.amount,
          bookingId: booking.id,
          salonName: booking.businessOwner.businessName,
        }
      );

      // Notify business owner - COD to collect
      await this.notificationService.sendToBusinessOwner(
        booking.businessOwner.userId,
        'PAYMENT_COD_CONFIRMED',
        {
          amount: savedPayment.amount,
          bookingId: booking.id,
          customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
        }
      );
    } catch (error) {
      console.error('Failed to send COD confirmed notifications:', error);
    }

    const responseData: VerifyPaymentDataDto = {
      status: 'payment_completed',
      otpCode: booking.otpCode, // Return existing OTP from booking
      bookingId: booking.id,
      paymentId: savedPayment.id,
      razorpayPaymentId: null, // No Razorpay payment for COD
    };

    return {
      code: 200,
      success: true,
      message: 'COD payment confirmed successfully. Service can now be completed after finishing.',
      data: responseData,
    };
  }

  async getPaymentByBookingRequest(bookingRequestId: string): Promise<PaymentDetailsDataDto> {
    // First, check if booking request exists
    const bookingRequest = await this.bookingRequestRepository.findOne({
      where: { id: bookingRequestId },
      relations: ['customer', 'businessOwner', 'confirmedBooking'],
    });

    if (!bookingRequest) {
      throw new NotFoundException('Booking request not found');
    }

    // Try to find payment record
    const payment = await this.paymentRepository.findOne({
      where: { bookingRequestId },
      relations: ['booking'],
    });

    if (payment) {
      const booking = payment.booking || bookingRequest.confirmedBooking || null;

      // Determine payment method from booking or payment record
      const paymentMethod = booking?.paymentMethod || payment.paymentMethod;

      // Clean payment data based on payment method
      let cleanedPayment = payment;
      if (paymentMethod === 'cod' || paymentMethod === PaymentMethodType.COD) {
        // For COD payments, nullify Razorpay-specific fields
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

      // Payment exists - return payment details based on method
      return {
        paymentExists: true,
        paymentStatus: payment.status,
        bookingRequest,
        payment: cleanedPayment,
        booking,
      };
    } else {
      // No payment record - return booking request with null payment
      let paymentStatus = 'NOT_CREATED';

      // Determine status based on booking request status
      if (bookingRequest.status === BookingRequestStatus.APPROVED) {
        // Check if there's a confirmed booking and if payment is completed
        if (bookingRequest.confirmedBooking) {
          paymentStatus = bookingRequest.confirmedBooking.paymentCompleted ? 'SUCCESS' : 'NOT_CREATED';
        } else {
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

  private verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
    const razorpaySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    const text = orderId + '|' + paymentId;

    const generatedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

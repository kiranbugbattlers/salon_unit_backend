import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, IsArray } from 'class-validator';

export enum BookingPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  PARTIALLY_PAID = 'partially_paid'
}

export enum VendorPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIALLY_PAID = 'partially_paid'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum PaymentMethod {
  CASH = 'cash',
  ONLINE = 'online',
  UPI = 'upi',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer'
}

export class UserBookingHistoryItemDto {
  @ApiProperty({ description: 'Booking history ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'User name' })
  @IsString()
  userName: string;

  @ApiProperty({ description: 'User mobile number' })
  @IsString()
  userMobile: string;

  @ApiProperty({ description: 'Booking ID' })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiProperty({ description: 'Booking date and time' })
  @IsDateString()
  bookingDate: Date;

  @ApiProperty({ description: 'Booking amount' })
  @IsNumber()
  bookingAmount: number;

  @ApiProperty({ enum: BookingPaymentStatus, description: 'Payment status' })
  @IsEnum(BookingPaymentStatus)
  paymentStatus: BookingPaymentStatus;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ enum: VendorPaymentStatus, description: 'Vendor payment status' })
  @IsEnum(VendorPaymentStatus)
  vendorPaymentStatus: VendorPaymentStatus;

  @ApiProperty({ description: 'Amount paid to vendor' })
  @IsNumber()
  vendorPaidAmount: number;

  @ApiProperty({ description: 'Vendor payment date' })
  @IsOptional()
  @IsDateString()
  vendorPaymentDate?: Date;

  @ApiProperty({ description: 'Commission amount' })
  @IsNumber()
  commissionAmount: number;

  @ApiProperty({ description: 'Vendor earning amount' })
  @IsNumber()
  vendorEarning: number;

  @ApiProperty({ enum: BookingStatus, description: 'Booking status' })
  @IsEnum(BookingStatus)
  bookingStatus: BookingStatus;

  @ApiProperty({ description: 'Booking remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ description: 'Payment details' })
  @IsOptional()
  paymentDetails?: {
    paymentId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paymentMethod?: string;
    cardNetwork?: string;
    bankName?: string;
    walletName?: string;
    vpa?: string;
    refundId?: string;
    refundAmount?: number;
    refundStatus?: string;
    refundReason?: string;
  };

  @ApiProperty({ description: 'Created at' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @IsDateString()
  updatedAt: Date;
}

export class DayWiseUserBookingHistoryDto {
  @ApiProperty({ description: 'Date for which bookings are grouped' })
  @IsDateString()
  date: Date;

  @ApiProperty({ description: 'List of bookings for the day' })
  @IsArray()
  bookings: UserBookingHistoryItemDto[];

  @ApiProperty({ description: 'Total booking amount for the day' })
  @IsNumber()
  totalBookingAmount: number;

  @ApiProperty({ description: 'Total commission amount for the day' })
  @IsNumber()
  totalCommissionAmount: number;

  @ApiProperty({ description: 'Total vendor earning for the day' })
  @IsNumber()
  totalVendorEarning: number;

  @ApiProperty({ description: 'Total paid bookings for the day' })
  @IsNumber()
  totalPaidBookings: number;

  @ApiProperty({ description: 'Total completed bookings for the day' })
  @IsNumber()
  totalCompletedBookings: number;

  @ApiProperty({ description: 'Number of bookings for the day' })
  @IsNumber()
  bookingCount: number;
}

export class UserBookingHistoryResponseDto {
  @ApiProperty({ description: 'Business owner ID' })
  @IsString()
  businessOwnerId: string;

  @ApiProperty({ description: 'Business owner name' })
  @IsString()
  businessOwnerName: string;

  @ApiProperty({ description: 'Shop ID' })
  @IsString()
  shopId: string;

  @ApiProperty({ description: 'Business name' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({ description: 'Day-wise booking history' })
  @IsArray()
  dayWiseHistory: DayWiseUserBookingHistoryDto[];

  @ApiProperty({ description: 'Total booking amount across all periods' })
  @IsNumber()
  totalBookingAmount: number;

  @ApiProperty({ description: 'Total commission amount across all periods' })
  @IsNumber()
  totalCommissionAmount: number;

  @ApiProperty({ description: 'Total vendor earning across all periods' })
  @IsNumber()
  totalVendorEarning: number;

  @ApiProperty({ description: 'Total number of bookings' })
  @IsNumber()
  totalBookings: number;

  @ApiProperty({ description: 'Total paid bookings' })
  @IsNumber()
  totalPaidBookings: number;

  @ApiProperty({ description: 'Total completed bookings' })
  @IsNumber()
  totalCompletedBookings: number;

  @ApiProperty({ description: 'Filter parameters used' })
  filters: {
    startDate?: Date;
    endDate?: Date;
    paymentStatus?: BookingPaymentStatus;
    vendorPaymentStatus?: VendorPaymentStatus;
    bookingStatus?: BookingStatus;
    paymentMethod?: PaymentMethod;
  };
}

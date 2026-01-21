import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsBoolean, IsNumber, Min } from 'class-validator';
import { BookingStatus, ServiceLocation } from '../../common/enums';
import { BookingRequestStatus } from '../../database/entities';
import { Type } from 'class-transformer';

// Query DTOs
export class AdminBookingQueryDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessOwnerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  staffId?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ enum: ServiceLocation })
  @IsOptional()
  @IsEnum(ServiceLocation)
  serviceLocation?: ServiceLocation;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class AdminBookingRequestQueryDto {
  @ApiPropertyOptional({ enum: BookingRequestStatus })
  @IsOptional()
  @IsEnum(BookingRequestStatus)
  status?: BookingRequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessOwnerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

// Force Cancel DTO
export class ForceCancelBookingDto {
  @ApiProperty({ example: 'Customer complaint - service quality issue' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  refundRequired?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  notifyCustomer?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  notifyBusinessOwner?: boolean;
}

// Force Complete DTO
export class ForceCompleteBookingDto {
  @ApiProperty({ example: 'OTP system failure - verified offline' })
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  calculateCommission?: boolean;
}

// Response DTOs
export class AdminCustomerInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiPropertyOptional()
  profilePic?: string;
}

export class AdminBusinessInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shopId: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  phone: string;

  @ApiPropertyOptional()
  email?: string;
}

export class AdminStaffInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  profilePic?: string;

  @ApiPropertyOptional()
  phone?: string;
}

export class AdminServiceInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  defaultDuration: number;
}

export class AdminBookingServiceInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  servicePrice: number;

  @ApiProperty()
  serviceDuration: number;

  @ApiProperty()
  isAddOn: boolean;

  @ApiPropertyOptional()
  addedAt?: Date;
}

export class AdminPaymentInfoDto {
  @ApiPropertyOptional()
  paymentId?: string;

  @ApiPropertyOptional()
  paymentMethod?: string;

  @ApiPropertyOptional()
  paymentStatus?: string;

  @ApiPropertyOptional()
  amount?: number;

  @ApiPropertyOptional()
  razorpayPaymentId?: string;

  @ApiPropertyOptional()
  razorpayOrderId?: string;

  @ApiPropertyOptional()
  paymentCompletedAt?: Date;
}

export class AdminCommissionInfoDto {
  @ApiPropertyOptional()
  commissionTransactionId?: string;

  @ApiPropertyOptional()
  businessOwnerCommission?: number;

  @ApiPropertyOptional()
  customerReward?: number;

  @ApiPropertyOptional()
  commissionPercent?: number;

  @ApiPropertyOptional()
  rewardPercent?: number;
}

// Detailed Booking DTO (includes sensitive data like OTPs)
export class AdminBookingDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  appointmentDate: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty({ enum: ServiceLocation })
  serviceLocation: ServiceLocation;

  @ApiProperty()
  totalAmount: number;

  @ApiPropertyOptional({ description: 'Delivery charge for at-home services' })
  deliveryCharge?: number;

  @ApiPropertyOptional({ description: 'Delivery distance in kilometers' })
  deliveryDistance?: number;

  @ApiPropertyOptional({ description: 'Total cost of add-on services', default: 0 })
  addOnServicesTotal?: number;

  @ApiPropertyOptional({ description: 'Payment completed flag', default: false })
  paymentCompleted?: boolean;

  @ApiPropertyOptional()
  specialRequests?: string;

  @ApiProperty({ description: 'Service verification OTP' })
  otpCode: string;

  @ApiPropertyOptional()
  otpVerifiedAt?: Date;

  @ApiPropertyOptional()
  serviceStartedAt?: Date;

  @ApiPropertyOptional()
  serviceCompletedAt?: Date;

  @ApiPropertyOptional()
  cancellationReason?: string;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiPropertyOptional()
  bookingRequestId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  customer: AdminCustomerInfoDto;

  @ApiProperty()
  business: AdminBusinessInfoDto;

  @ApiProperty()
  staff: AdminStaffInfoDto;

  @ApiProperty()
  service: AdminServiceInfoDto;

  @ApiPropertyOptional({ type: [AdminBookingServiceInfoDto], description: 'List of all services (original + add-ons)' })
  bookingServices?: AdminBookingServiceInfoDto[];

  @ApiPropertyOptional()
  paymentInfo?: AdminPaymentInfoDto;

  @ApiPropertyOptional()
  commissionInfo?: AdminCommissionInfoDto;
}

// Detailed Booking Request DTO
export class AdminBookingRequestDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  requestedDate: string;

  @ApiProperty()
  requestedStartTime: string;

  @ApiProperty()
  requestedEndTime: string;

  @ApiProperty({ enum: BookingRequestStatus })
  status: BookingRequestStatus;

  @ApiProperty()
  totalEstimatedPrice: number;

  @ApiProperty()
  totalEstimatedDuration: number;

  @ApiPropertyOptional()
  approvedStartTime?: string;

  @ApiPropertyOptional()
  approvedEndTime?: string;

  @ApiPropertyOptional()
  finalPrice?: number;

  @ApiProperty({ description: 'Arrival verification OTP' })
  @ApiPropertyOptional()
  arrivalOtp?: string;

  @ApiPropertyOptional()
  arrivalOtpGeneratedAt?: Date;

  @ApiPropertyOptional()
  arrivalOtpVerifiedAt?: Date;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiPropertyOptional()
  businessNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  customer: AdminCustomerInfoDto;

  @ApiProperty()
  business: AdminBusinessInfoDto;

  @ApiPropertyOptional()
  requestedStaff?: AdminStaffInfoDto;

  @ApiPropertyOptional()
  assignedStaff?: AdminStaffInfoDto;

  @ApiProperty()
  services: any[];

  @ApiPropertyOptional()
  confirmedBookingId?: string;

  @ApiPropertyOptional()
  paymentInfo?: AdminPaymentInfoDto;
}

// List Response DTOs
export class AdminBookingListResponseDto {
  @ApiProperty()
  code: number;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [AdminBookingDetailDto] })
  data: AdminBookingDetailDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class AdminBookingRequestListResponseDto {
  @ApiProperty()
  code: number;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [AdminBookingRequestDetailDto] })
  data: AdminBookingRequestDetailDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Single Response DTOs
export class AdminBookingResponseDto {
  @ApiProperty()
  code: number;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: AdminBookingDetailDto;
}

export class AdminBookingRequestResponseDto {
  @ApiProperty()
  code: number;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: AdminBookingRequestDetailDto;
}

// Analytics DTOs
export class BookingAnalyticsDto {
  @ApiProperty()
  totalBookings: number;

  @ApiProperty()
  byStatus: {
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };

  @ApiProperty()
  byPaymentMethod: {
    online: number;
    cod: number;
  };

  @ApiProperty()
  averageBookingValue: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalCommission: number;

  @ApiProperty()
  completionRate: number;

  @ApiProperty()
  cancellationRate: number;

  @ApiProperty()
  topBusinesses: Array<{
    businessId: string;
    businessName: string;
    bookingCount: number;
    totalRevenue: number;
  }>;

  @ApiProperty()
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    bookingCount: number;
    totalSpent: number;
  }>;

  @ApiProperty()
  bookingsByDay: Record<string, number>;

  @ApiProperty()
  revenueByDay: Record<string, number>;
}

export class BookingAnalyticsResponseDto {
  @ApiProperty()
  code: number;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: BookingAnalyticsDto;
}

export class AdminAnalyticsQueryDto {
  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessOwnerId?: string;
}

// Business Performance Report DTOs
export class BusinessPerformanceReportQueryDto {
  @ApiProperty({ enum: ['daily', 'monthly'], example: 'monthly', description: 'Type of report to generate' })
  @IsEnum(['daily', 'monthly'])
  reportType: 'daily' | 'monthly';

  @ApiProperty({ example: '2025-01-01', description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  dateFrom: string;

  @ApiProperty({ example: '2025-01-31', description: 'End date (YYYY-MM-DD)' })
  @IsDateString()
  dateTo: string;

  @ApiPropertyOptional({ description: 'Filter by specific business (shopId or businessId)' })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiPropertyOptional({ enum: ['revenue', 'bookings', 'commission', 'businessName'], default: 'revenue' })
  @IsOptional()
  @IsEnum(['revenue', 'bookings', 'commission', 'businessName'])
  sortBy?: 'revenue' | 'bookings' | 'commission' | 'businessName';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class BusinessPerformanceMetricsDto {
  @ApiProperty({ description: 'Total number of bookings in period' })
  totalBookings: number;

  @ApiProperty({ description: 'Number of completed bookings' })
  completedBookings: number;

  @ApiProperty({ description: 'Number of cancelled bookings' })
  cancelledBookings: number;

  @ApiProperty({ description: 'Total revenue from completed bookings' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total commission earned' })
  totalCommission: number;

  @ApiProperty({ description: 'Average value per completed booking' })
  averageBookingValue: number;

  @ApiProperty({ description: 'Percentage of bookings completed (0-1)' })
  completionRate: number;

  @ApiProperty({ description: 'Percentage of bookings cancelled (0-1)' })
  cancellationRate: number;
}

export class BusinessContactDto {
  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  phone?: string;
}

export class BusinessPerformanceDto {
  @ApiProperty({ description: 'Business owner UUID' })
  businessId: string;

  @ApiProperty({ description: 'Unique shop identifier' })
  shopId: string;

  @ApiProperty({ description: 'Business name' })
  businessName: string;

  @ApiProperty({ description: 'Report period (YYYY-MM for monthly, YYYY-MM-DD for daily)' })
  period: string;

  @ApiProperty({ type: BusinessPerformanceMetricsDto })
  metrics: BusinessPerformanceMetricsDto;

  @ApiProperty({ type: BusinessContactDto })
  contact: BusinessContactDto;
}

export class BusinessReportSummaryDto {
  @ApiProperty({ description: 'Total number of unique businesses in report' })
  totalBusinesses: number;

  @ApiProperty({ description: 'Total bookings across all businesses' })
  totalBookings: number;

  @ApiProperty({ description: 'Total revenue across all businesses' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total commission across all businesses' })
  totalCommission: number;

  @ApiProperty({ description: 'Average revenue per business' })
  averageRevenuePerBusiness: number;
}

export class BusinessPerformanceReportDataDto {
  @ApiProperty({ enum: ['daily', 'monthly'] })
  reportType: 'daily' | 'monthly';

  @ApiProperty({ type: 'object', properties: { dateFrom: { type: 'string' }, dateTo: { type: 'string' } } })
  period: {
    dateFrom: string;
    dateTo: string;
  };

  @ApiProperty({ type: BusinessReportSummaryDto })
  summary: BusinessReportSummaryDto;

  @ApiProperty({ type: [BusinessPerformanceDto] })
  businesses: BusinessPerformanceDto[];
}

export class BusinessPerformanceReportResponseDto {
  @ApiProperty()
  code: number;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: BusinessPerformanceReportDataDto })
  data: BusinessPerformanceReportDataDto;

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

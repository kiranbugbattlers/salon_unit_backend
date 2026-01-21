import { ApiProperty } from '@nestjs/swagger';
import { BookingRequestStatus } from '../../database/entities/booking-request.entity';
import { ServiceLocation, BookingStatus } from '../../common/enums';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { PaymentInfoDto } from './payment-info.dto';
import { BookingDetailsDto } from './booking-details.dto';
import { CustomerAddressDto } from './customer-address.dto';

export class BusinessServiceDetailDto {
  @ApiProperty({
    description: 'Business Service ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Custom price set by business owner',
    example: 75.50,
  })
  customPrice: number;

  @ApiProperty({
    description: 'Custom duration in minutes set by business owner',
    example: 60,
  })
  customDurationMinutes: number;

  @ApiProperty({
    description: 'Base service information',
  })
  service: {
    id: string;
    name: string;
    description: string;
  };
}

export class BookingRequestServiceDetailDto {
  @ApiProperty({
    description: 'Booking Request Service ID',
    example: '456e7890-e12b-34c5-d678-901234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Quantity of this service requested',
    example: 1,
  })
  quantity: number;

  @ApiProperty({
    description: 'Estimated price for this service',
    example: 75.50,
  })
  estimatedPrice: number;

  @ApiProperty({
    description: 'Estimated duration in minutes',
    example: 60,
  })
  estimatedDuration: number;

  @ApiProperty({
    description: 'Business service details',
    type: BusinessServiceDetailDto,
  })
  businessService: BusinessServiceDetailDto;
}

export class CustomerDetailDto {
  @ApiProperty({
    description: 'Customer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+1234567890',
  })
  phone: string;
}

export class BusinessDetailDto {
  @ApiProperty({
    description: 'Business ID',
    example: '456e7890-e12b-34c5-d678-901234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Unique shop identifier',
    example: 'SH-123456',
  })
  shopId: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Elite Hair Salon',
  })
  businessName: string;

  @ApiProperty({
    description: 'Business address',
    example: '123 Main St, New York, NY',
  })
  address: string;
}

export class StaffDetailDto {
  @ApiProperty({
    description: 'Staff ID',
    example: '789e0123-e45f-67g8-h901-234567890123',
  })
  id: string;

  @ApiProperty({
    description: 'Staff first name',
    example: 'Jane',
  })
  firstName: string;

  @ApiProperty({
    description: 'Staff last name',
    example: 'Smith',
  })
  lastName: string;
}

export class BookingRequestDetailDto {
  @ApiProperty({
    description: 'Booking Request ID',
    example: '345e6789-e01f-23g4-h567-890123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Requested appointment date',
    example: '2024-01-15',
  })
  requestedDate: string;

  @ApiProperty({
    description: 'Requested start time',
    example: '10:00',
  })
  requestedStartTime: string;

  @ApiProperty({
    description: 'Requested end time',
    example: '12:00',
  })
  requestedEndTime: string;

  @ApiProperty({
    description: 'Booking request status',
    enum: BookingRequestStatus,
    example: BookingRequestStatus.PENDING,
  })
  status: BookingRequestStatus;

  @ApiProperty({
    description: 'Service location preference',
    enum: ServiceLocation,
    example: ServiceLocation.IN_SALON,
    nullable: true,
  })
  serviceLocation?: ServiceLocation;

  @ApiProperty({
    description: 'Total estimated price for all services',
    example: 150.00,
  })
  totalEstimatedPrice: number;

  @ApiProperty({
    description: 'Total estimated duration in minutes',
    example: 120,
  })
  totalEstimatedDuration: number;

  @ApiProperty({
    description: 'Business owner rejection reason',
    example: 'Staff not available',
    nullable: true,
  })
  rejectionReason?: string;

  @ApiProperty({
    description: 'Business owner notes',
    example: 'Confirmed with premium products',
    nullable: true,
  })
  businessNotes?: string;

  @ApiProperty({
    description: 'Final approved start time',
    example: '10:30',
    nullable: true,
  })
  approvedStartTime?: string;

  @ApiProperty({
    description: 'Final approved end time',
    example: '12:30',
    nullable: true,
  })
  approvedEndTime?: string;

  @ApiProperty({
    description: 'Final approved price',
    example: 140.00,
    nullable: true,
  })
  finalPrice?: number;

  @ApiProperty({
    description: 'Request creation date',
    example: '2024-01-10T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-10T14:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Customer information',
    type: CustomerDetailDto,
  })
  customer: CustomerDetailDto;

  @ApiProperty({
    description: 'Business information',
    type: BusinessDetailDto,
  })
  business: BusinessDetailDto;

  @ApiProperty({
    description: 'Requested staff information',
    type: StaffDetailDto,
    nullable: true,
  })
  requestedStaff?: StaffDetailDto;

  @ApiProperty({
    description: 'Assigned staff information',
    type: StaffDetailDto,
    nullable: true,
  })
  assignedStaff?: StaffDetailDto;

  @ApiProperty({
    description: 'Requested services details',
    type: [BookingRequestServiceDetailDto],
  })
  services: BookingRequestServiceDetailDto[];

  @ApiProperty({
    description: 'Confirmed booking ID if approved',
    example: '012e3456-e78f-90g1-h234-567890123456',
    nullable: true,
  })
  confirmedBookingId?: string;

  @ApiProperty({
    description: 'OTP code for booking verification (6-digit code)',
    example: '123456',
    nullable: true,
  })
  otpCode?: string;

  @ApiProperty({
    description: 'Arrival OTP for customer to show at shop before payment (6-digit code)',
    example: '654321',
    nullable: true,
  })
  arrivalOtp?: string;

  @ApiProperty({
    description: 'Computed lifecycle state for UI rendering (uses extended status values)',
    enum: BookingRequestStatus,
    example: BookingRequestStatus.PENDING,
  })
  lifecycleState: BookingRequestStatus;

  @ApiProperty({
    description: 'Flag indicating if staff has been assigned',
    example: false,
  })
  isStaffAssigned: boolean;

  @ApiProperty({
    description: 'Flag indicating if request has been approved by business owner',
    example: false,
  })
  isApproved: boolean;

  @ApiProperty({
    description: 'Flag indicating if payment is pending from customer',
    example: false,
  })
  isPaymentPending: boolean;

  @ApiProperty({
    description: 'Flag indicating if payment has been completed',
    example: false,
  })
  isPaymentCompleted: boolean;

  @ApiProperty({
    description: 'Flag indicating if confirmed booking exists',
    example: false,
  })
  isConfirmed: boolean;

  @ApiProperty({
    description: 'Flag indicating if customer can cancel this request',
    example: true,
  })
  canCancel: boolean;

  @ApiProperty({
    description: 'Flag indicating if payment button should be shown',
    example: false,
  })
  canPay: boolean;

  @ApiProperty({
    description: 'Flag indicating if customer action is required',
    example: false,
  })
  requiresAction: boolean;

  @ApiProperty({
    description: 'Booking status from confirmed booking (when payment completed)',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
    nullable: true,
  })
  bookingStatus?: BookingStatus;

  @ApiProperty({
    description: 'Timestamp when OTP was verified by business owner',
    example: '2024-01-15T10:30:00Z',
    nullable: true,
  })
  otpVerifiedAt?: Date;

  @ApiProperty({
    description: 'Timestamp when service was started',
    example: '2024-01-15T10:30:00Z',
    nullable: true,
  })
  serviceStartedAt?: Date;

  @ApiProperty({
    description: 'Timestamp when service was completed',
    example: '2024-01-15T11:30:00Z',
    nullable: true,
  })
  serviceCompletedAt?: Date;

  @ApiProperty({
    description: 'Minimal payment information (varies by payment method)',
    type: PaymentInfoDto,
    nullable: true,
  })
  paymentInfo?: PaymentInfoDto | null;

  @ApiProperty({
    description: 'Detailed booking information with add-on services breakdown (only available in detail endpoint, null in list endpoint)',
    type: BookingDetailsDto,
    nullable: true,
  })
  bookingDetails?: BookingDetailsDto | null;

  @ApiProperty({
    description: 'Customer delivery address (only for at-home services)',
    type: CustomerAddressDto,
    nullable: true,
  })
  customerAddress?: CustomerAddressDto;

  @ApiProperty({
    description: 'Delivery charge for at-home services',
    example: 50.00,
    default: 0,
  })
  deliveryCharge: number;

  @ApiProperty({
    description: 'Delivery distance in kilometers',
    example: 5.25,
    nullable: true,
  })
  deliveryDistance?: number;
}

export class BookingRequestResponseDto extends ApiResponseDto<BookingRequestDetailDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Booking request operation completed successfully' })
  message: string;

  @ApiProperty({
    description: 'Booking request data',
    type: BookingRequestDetailDto,
  })
  data: BookingRequestDetailDto;
}

export class BookingRequestListResponseDto extends ApiResponseDto<BookingRequestDetailDto[]> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Booking requests retrieved successfully' })
  message: string;

  @ApiProperty({
    description: 'List of booking requests',
    type: [BookingRequestDetailDto],
  })
  data: BookingRequestDetailDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Business Owner DTOs (without otpCode for security)
export class BusinessOwnerBookingRequestDetailDto {
  @ApiProperty({
    description: 'Booking Request ID',
    example: '345e6789-e01f-23g4-h567-890123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Requested appointment date',
    example: '2024-01-15',
  })
  requestedDate: string;

  @ApiProperty({
    description: 'Requested start time',
    example: '10:00',
  })
  requestedStartTime: string;

  @ApiProperty({
    description: 'Requested end time',
    example: '12:00',
  })
  requestedEndTime: string;

  @ApiProperty({
    description: 'Booking request status',
    enum: BookingRequestStatus,
    example: BookingRequestStatus.PENDING,
  })
  status: BookingRequestStatus;

  @ApiProperty({
    description: 'Service location preference',
    enum: ServiceLocation,
    example: ServiceLocation.IN_SALON,
    nullable: true,
  })
  serviceLocation?: ServiceLocation;

  @ApiProperty({
    description: 'Total estimated price for all services',
    example: 150.00,
  })
  totalEstimatedPrice: number;

  @ApiProperty({
    description: 'Total estimated duration in minutes',
    example: 120,
  })
  totalEstimatedDuration: number;

  @ApiProperty({
    description: 'Business owner rejection reason',
    example: 'Staff not available',
    nullable: true,
  })
  rejectionReason?: string;

  @ApiProperty({
    description: 'Business owner notes',
    example: 'Confirmed with premium products',
    nullable: true,
  })
  businessNotes?: string;

  @ApiProperty({
    description: 'Final approved start time',
    example: '10:30',
    nullable: true,
  })
  approvedStartTime?: string;

  @ApiProperty({
    description: 'Final approved end time',
    example: '12:30',
    nullable: true,
  })
  approvedEndTime?: string;

  @ApiProperty({
    description: 'Final approved price',
    example: 140.00,
    nullable: true,
  })
  finalPrice?: number;

  @ApiProperty({
    description: 'Request creation date',
    example: '2024-01-10T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-10T14:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Customer information',
    type: CustomerDetailDto,
  })
  customer: CustomerDetailDto;

  @ApiProperty({
    description: 'Business information',
    type: BusinessDetailDto,
  })
  business: BusinessDetailDto;

  @ApiProperty({
    description: 'Requested staff information',
    type: StaffDetailDto,
    nullable: true,
  })
  requestedStaff?: StaffDetailDto;

  @ApiProperty({
    description: 'Assigned staff information',
    type: StaffDetailDto,
    nullable: true,
  })
  assignedStaff?: StaffDetailDto;

  @ApiProperty({
    description: 'Requested services details',
    type: [BookingRequestServiceDetailDto],
  })
  services: BookingRequestServiceDetailDto[];

  @ApiProperty({
    description: 'Confirmed booking ID if approved',
    example: '012e3456-e78f-90g1-h234-567890123456',
    nullable: true,
  })
  confirmedBookingId?: string;

  @ApiProperty({
    description: 'Computed lifecycle state for UI rendering (uses extended status values)',
    enum: BookingRequestStatus,
    example: BookingRequestStatus.PENDING,
  })
  lifecycleState: BookingRequestStatus;

  @ApiProperty({
    description: 'Flag indicating if staff has been assigned',
    example: false,
  })
  isStaffAssigned: boolean;

  @ApiProperty({
    description: 'Flag indicating if request has been approved by business owner',
    example: false,
  })
  isApproved: boolean;

  @ApiProperty({
    description: 'Flag indicating if payment is pending from customer',
    example: false,
  })
  isPaymentPending: boolean;

  @ApiProperty({
    description: 'Flag indicating if payment has been completed',
    example: false,
  })
  isPaymentCompleted: boolean;

  @ApiProperty({
    description: 'Flag indicating if confirmed booking exists',
    example: false,
  })
  isConfirmed: boolean;

  @ApiProperty({
    description: 'Flag indicating if customer can cancel this request',
    example: true,
  })
  canCancel: boolean;

  @ApiProperty({
    description: 'Flag indicating if payment button should be shown',
    example: false,
  })
  canPay: boolean;

  @ApiProperty({
    description: 'Flag indicating if customer action is required',
    example: false,
  })
  requiresAction: boolean;

  @ApiProperty({
    description: 'Booking status from confirmed booking (when payment completed)',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
    nullable: true,
  })
  bookingStatus?: BookingStatus;

  @ApiProperty({
    description: 'Timestamp when OTP was verified by business owner',
    example: '2024-01-15T10:30:00Z',
    nullable: true,
  })
  otpVerifiedAt?: Date;

  @ApiProperty({
    description: 'Timestamp when service was started',
    example: '2024-01-15T10:30:00Z',
    nullable: true,
  })
  serviceStartedAt?: Date;

  @ApiProperty({
    description: 'Timestamp when service was completed',
    example: '2024-01-15T11:30:00Z',
    nullable: true,
  })
  serviceCompletedAt?: Date;

  @ApiProperty({
    description: 'Minimal payment information (varies by payment method)',
    type: PaymentInfoDto,
    nullable: true,
  })
  paymentInfo?: PaymentInfoDto | null;

  @ApiProperty({
    description: 'Detailed booking information with add-on services breakdown (only available in detail endpoint, null in list endpoint)',
    type: BookingDetailsDto,
    nullable: true,
  })
  bookingDetails?: BookingDetailsDto | null;

  @ApiProperty({
    description: 'Customer delivery address (only for at-home services)',
    type: CustomerAddressDto,
    nullable: true,
  })
  customerAddress?: CustomerAddressDto;

  @ApiProperty({
    description: 'Delivery charge for at-home services',
    example: 50.00,
    default: 0,
  })
  deliveryCharge: number;

  @ApiProperty({
    description: 'Delivery distance in kilometers',
    example: 5.25,
    nullable: true,
  })
  deliveryDistance?: number;

  // Note: otpCode and arrivalOtp are intentionally excluded for business owner security
}

export class BusinessOwnerBookingRequestResponseDto extends ApiResponseDto<BusinessOwnerBookingRequestDetailDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Booking request operation completed successfully' })
  message: string;

  @ApiProperty({
    description: 'Booking request data (business owner view - no OTP)',
    type: BusinessOwnerBookingRequestDetailDto,
  })
  data: BusinessOwnerBookingRequestDetailDto;
}

export class BusinessOwnerBookingRequestListResponseDto extends ApiResponseDto<BusinessOwnerBookingRequestDetailDto[]> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business owner booking requests retrieved successfully' })
  message: string;

  @ApiProperty({
    description: 'List of booking requests (business owner view - no OTP)',
    type: [BusinessOwnerBookingRequestDetailDto],
  })
  data: BusinessOwnerBookingRequestDetailDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
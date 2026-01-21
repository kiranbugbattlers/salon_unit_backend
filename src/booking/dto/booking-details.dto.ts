import { ApiProperty } from '@nestjs/swagger';

export class BookingServiceDetailDto {
  @ApiProperty({ description: 'Booking service UUID' })
  id: string;

  @ApiProperty({ description: 'Booking ID this service belongs to' })
  bookingId: string;

  @ApiProperty({ description: 'Business service ID' })
  businessServiceId: string;

  @ApiProperty({ description: 'Service ID from catalog' })
  serviceId: string;

  @ApiProperty({ description: 'Service name (denormalized)' })
  serviceName: string;

  @ApiProperty({ description: 'Price for this service' })
  price: number;

  @ApiProperty({ description: 'Service price (alias)' })
  servicePrice: number;

  @ApiProperty({ description: 'Duration in minutes' })
  durationMinutes: number;

  @ApiProperty({ description: 'Service duration (alias)' })
  serviceDuration: number;

  @ApiProperty({ description: 'Whether this is an add-on service (added during IN_PROGRESS)', default: false })
  isAddOn: boolean;

  @ApiProperty({ description: 'Timestamp when service was added to booking', required: false })
  addedAt?: Date;

  @ApiProperty({ description: 'Staff ID who added this service', required: false })
  addedByStaffId?: string;

  @ApiProperty({ description: 'Customer approval status for add-on services', default: true })
  customerApproved: boolean;

  @ApiProperty({ description: 'Timestamp when customer approved the service', required: false })
  approvedAt?: Date;

  @ApiProperty({ description: 'Timestamp when customer rejected the service', required: false })
  rejectedAt?: Date;

  @ApiProperty({ description: 'Package ID if service is part of a package', required: false })
  packageId?: string;

  @ApiProperty({ description: 'Package name if service is part of a package', required: false })
  packageName?: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}

export class ServiceSummaryDto {
  @ApiProperty({ description: 'Number of original services (from booking request)' })
  originalServicesCount: number;

  @ApiProperty({ description: 'Number of add-on services (added during service)' })
  addOnServicesCount: number;

  @ApiProperty({ description: 'Total number of services (original + add-ons)' })
  totalServicesCount: number;

  @ApiProperty({ description: 'Total duration of all services in minutes' })
  totalDuration: number;

  @ApiProperty({ description: 'Estimated end time (HH:MM format)', required: false })
  estimatedEndTime?: string;
}

export class BookingDetailsDto {
  @ApiProperty({ description: 'Total amount including original services, add-ons, and delivery charge' })
  totalAmount: number;

  @ApiProperty({ description: 'Original booking request amount (before add-ons)' })
  originalAmount: number;

  @ApiProperty({ description: 'Total cost of add-on services added during service', default: 0 })
  addOnServicesTotal: number;

  @ApiProperty({ description: 'Delivery charge for at-home services', default: 0 })
  deliveryCharge: number;

  @ApiProperty({ description: 'Whether payment has been completed', default: false })
  paymentCompleted: boolean;

  @ApiProperty({
    description: 'All services in the booking (original + add-ons)',
    type: [BookingServiceDetailDto]
  })
  allServices: BookingServiceDetailDto[];

  @ApiProperty({
    description: 'Original services from booking request (isAddOn: false)',
    type: [BookingServiceDetailDto]
  })
  originalServices: BookingServiceDetailDto[];

  @ApiProperty({
    description: 'Add-on services added during service (isAddOn: true)',
    type: [BookingServiceDetailDto]
  })
  addOnServices: BookingServiceDetailDto[];

  @ApiProperty({
    description: 'Pending add-on services awaiting customer approval (isAddOn: true, customerApproved: false)',
    type: [BookingServiceDetailDto]
  })
  pendingAddOnServices: BookingServiceDetailDto[];

  @ApiProperty({
    description: 'Approved add-on services (isAddOn: true, customerApproved: true)',
    type: [BookingServiceDetailDto]
  })
  approvedAddOnServices: BookingServiceDetailDto[];

  @ApiProperty({ description: 'Total amount of pending add-ons (not yet included in totalAmount)', default: 0 })
  pendingAddOnServicesTotal: number;

  @ApiProperty({ description: 'Service counts and duration summary', type: ServiceSummaryDto })
  serviceSummary: ServiceSummaryDto;
}

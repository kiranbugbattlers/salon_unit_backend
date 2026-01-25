import { Customer } from './customer.entity';
import { BusinessOwner } from './business-owner.entity';
import { Staff } from './staff.entity';
import { BookingRequestService } from './booking-request-service.entity';
import { Booking } from './booking.entity';
import { Payment } from './payment.entity';
import { ServiceLocation } from '../../common/enums';
export declare enum BookingRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    STAFF_ASSIGNED = "staff_assigned",
    IN_PROGRESS = "in-progress",
    AWAITING_PAYMENT = "awaiting_payment",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class BookingRequest {
    id: string;
    customerId: string;
    businessOwnerId: string;
    requestedDate: Date;
    requestedStartTime: string;
    requestedEndTime: string;
    requestedStaffId?: string;
    status: BookingRequestStatus;
    totalEstimatedPrice: number;
    totalEstimatedDuration: number;
    serviceLocation?: ServiceLocation;
    specialRequests?: string;
    rejectionReason?: string;
    businessNotes?: string;
    assignedStaffId?: string;
    approvedStartTime?: string;
    approvedEndTime?: string;
    finalPrice?: number;
    servicePackageId?: string;
    paymentId?: string;
    paymentStatus?: string;
    customerAddress?: {
        streetAddress: string;
        city: string;
        state: string;
        postalCode: string;
        latitude: number;
        longitude: number;
        landmark?: string;
    };
    deliveryCharge: number;
    deliveryDistance?: number;
    createdAt: Date;
    updatedAt: Date;
    customer: Customer;
    businessOwner: BusinessOwner;
    requestedStaff?: Staff;
    assignedStaff?: Staff;
    payment?: Payment;
    bookingRequestServices: BookingRequestService[];
    confirmedBooking?: Booking;
}

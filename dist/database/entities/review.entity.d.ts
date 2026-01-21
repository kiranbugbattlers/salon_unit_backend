import { Booking } from './booking.entity';
import { Customer } from './customer.entity';
import { BusinessOwner } from './business-owner.entity';
export declare class Review {
    id: string;
    bookingId: string;
    customerId: string;
    businessOwnerId: string;
    rating: number;
    comment?: string;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
    booking: Booking;
    customer: Customer;
    businessOwner: BusinessOwner;
}

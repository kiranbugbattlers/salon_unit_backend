import { BookingRequest } from './booking-request.entity';
import { BusinessService } from './business-service.entity';
export declare class BookingRequestService {
    id: string;
    bookingRequestId: string;
    businessServiceId: string;
    quantity: number;
    estimatedPrice: number;
    estimatedDuration: number;
    createdAt: Date;
    updatedAt: Date;
    bookingRequest: BookingRequest;
    businessService: BusinessService;
}

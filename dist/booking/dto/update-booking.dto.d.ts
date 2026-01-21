import { ServiceLocation, BookingStatus } from '../../common/enums';
export declare class UpdateBookingDto {
    appointmentDate?: string;
    startTime?: string;
    endTime?: string;
    serviceLocation?: ServiceLocation;
    status?: BookingStatus;
    specialRequests?: string;
    totalAmount?: number;
}

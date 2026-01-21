import { BookingStatus, ServiceLocation } from '../../common/enums';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class CustomerDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}
export declare class BusinessDto {
    id: string;
    shopId: string;
    businessName: string;
    address: string;
    phone: string;
}
export declare class StaffDto {
    id: string;
    firstName: string;
    lastName: string;
    profilePic?: string;
    profilePicCdnUrl?: string;
}
export declare class ServiceDto {
    id: string;
    name: string;
    description: string;
    defaultDuration: number;
    basePrice: number;
}
export declare class BookingDto {
    id: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    serviceLocation: ServiceLocation;
    totalAmount: number;
    specialRequests?: string;
    createdAt: Date;
    updatedAt: Date;
    customer: CustomerDto;
    business: BusinessDto;
    staff: StaffDto;
    service: ServiceDto;
}
export declare class BookingResponseDto extends ApiResponseDto<BookingDto> {
    code: number;
    success: boolean;
    message: string;
    data: BookingDto;
}
export declare class BookingListResponseDto extends ApiResponseDto<BookingDto[]> {
    code: number;
    success: boolean;
    message: string;
    data: BookingDto[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare class BookingQueryDto {
    status?: BookingStatus;
    appointmentDate?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

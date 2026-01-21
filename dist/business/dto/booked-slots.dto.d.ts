import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class BookedSlotsQueryDto {
    date: string;
    staffId?: string;
}
export declare class BookedSlotItemDto {
    bookingId: string;
    startTime: string;
    endTime: string;
    serviceName: string;
    status: string;
    serviceLocation?: string;
    customerFirstName?: string;
    staffId: string;
    staffName: string;
}
export declare class BookedSlotsDataDto {
    date: string;
    staffId?: string;
    shopId: string;
    staffName?: string;
    bookedSlots: BookedSlotItemDto[];
    totalBookings: number;
}
export declare class BookedSlotsResponseDto extends ApiResponseDto<BookedSlotsDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: BookedSlotsDataDto;
    constructor(code: number, success: boolean, message: string, data: BookedSlotsDataDto);
}

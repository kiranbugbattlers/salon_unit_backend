import { BusinessService } from './business.service';
import { BusinessQueryDto, BusinessResponseDto, BusinessDetailResponseDto, BookedSlotsQueryDto, BookedSlotsResponseDto, AvailableSlotsQueryDto, AvailableSlotsResponseDto } from './dto';
export declare class BusinessController {
    private readonly businessService;
    constructor(businessService: BusinessService);
    getBusinesses(query: BusinessQueryDto, req?: any): Promise<BusinessResponseDto>;
    getBusinessDetail(shopId: string, userspecific?: boolean, req?: any): Promise<BusinessDetailResponseDto>;
    getBookedSlots(shopId: string, query: BookedSlotsQueryDto): Promise<BookedSlotsResponseDto>;
    getAvailableSlots(shopId: string, query: AvailableSlotsQueryDto): Promise<AvailableSlotsResponseDto>;
}

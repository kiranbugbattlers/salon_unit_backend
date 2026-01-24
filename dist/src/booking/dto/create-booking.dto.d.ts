import { ServiceLocation } from '../../common/enums';
import { CustomerAddressDto } from './customer-address.dto';
export declare class CreateBookingDto {
    businessOwnerId: string;
    requestedDate: string;
    requestedStartTime: string;
    requestedEndTime: string;
    requestedStaffId?: string;
    businessServiceIds?: string[];
    servicePackageIds?: string[];
    serviceLocation?: ServiceLocation;
    specialRequests?: string;
    customerAddress?: CustomerAddressDto;
}

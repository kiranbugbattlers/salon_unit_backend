import { AdUserType } from '../../common/enums';
export declare class AdvertisementQueryDto {
    page?: number;
    limit?: number;
    isActive?: boolean;
    userType?: AdUserType;
    screen?: string;
}

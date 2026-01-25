import { AdMediaType, AdUserType } from '../../common/enums';
export declare class UpdateAdvertisementDto {
    title?: string;
    description?: string;
    mediaType?: AdMediaType;
    linkUrl?: string;
    targetUserTypes?: AdUserType[];
    targetScreens?: Record<string, string[]>;
    priority?: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
}

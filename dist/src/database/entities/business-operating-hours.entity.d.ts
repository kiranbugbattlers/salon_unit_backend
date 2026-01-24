import { BusinessOwner } from './business-owner.entity';
export declare class BusinessOperatingHours {
    id: string;
    businessOwnerId: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
}

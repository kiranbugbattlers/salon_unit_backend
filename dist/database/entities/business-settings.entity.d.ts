import { BusinessOwner } from './business-owner.entity';
export declare class BusinessSettings {
    businessOwnerId: string;
    deliveryChargesEnabled: boolean;
    baseDeliveryCharge: number;
    perKmCharge: number;
    freeDeliveryUptoKm: number;
    maxDeliveryDistanceKm: number;
    freeDeliveryAboveAmount: number;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
}

export declare class PreviewDeliveryChargeDto {
    businessOwnerId: string;
    customerLatitude: number;
    customerLongitude: number;
    businessServiceIds?: string[];
    servicePackageIds?: string[];
}
export declare class DeliveryChargePreviewResponseDto {
    distanceKm: number;
    baseCharge: number;
    distanceCharge: number;
    totalDeliveryCharge: number;
    isFreeDelivery: boolean;
    freeDeliveryReason?: string;
    breakdown: string;
    estimatedOrderAmount: number;
    finalTotal: number;
}

export declare class StaffServiceCategoryResponseDto {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
}
export declare class StaffBasicServiceResponseDto {
    id: string;
    name: string;
    description?: string;
    basePrice: number;
    baseDurationMinutes: number;
    isActive: boolean;
    category: StaffServiceCategoryResponseDto;
}
export declare class StaffServiceResponseDto {
    id: string;
    staffId: string;
    serviceId: string;
    customPrice: number;
    customDurationMinutes: number;
    isActive: boolean;
    createdAt: Date;
    service: StaffBasicServiceResponseDto;
}
export declare class StaffServiceListResponseDto {
    data: StaffServiceResponseDto[];
    total: number;
}

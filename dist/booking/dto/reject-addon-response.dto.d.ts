export declare class RemovedServiceDto {
    id: string;
    serviceName: string;
    servicePrice: number;
}
export declare class RejectAddonDataDto {
    bookingId: string;
    totalAmount: number;
    addOnServicesTotal: number;
    removedService: RemovedServiceDto;
}
export declare class RejectAddonResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: RejectAddonDataDto;
    error_code?: string;
}

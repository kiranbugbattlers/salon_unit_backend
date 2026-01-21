export declare class ApprovedServiceDto {
    id: string;
    serviceName: string;
    servicePrice: number;
    customerApproved: boolean;
    approvedAt: Date;
}
export declare class ApproveAddonDataDto {
    bookingId: string;
    totalAmount: number;
    addOnServicesTotal: number;
    approvedService: ApprovedServiceDto;
}
export declare class ApproveAddonResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: ApproveAddonDataDto;
    error_code?: string;
}

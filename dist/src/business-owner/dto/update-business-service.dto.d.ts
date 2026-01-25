export declare class UpdateBusinessServiceItemDto {
    serviceId: string;
    customPrice?: number;
    customDurationMinutes?: number;
    isActive?: boolean;
}
export declare class UpdateBusinessServicesDto {
    services: UpdateBusinessServiceItemDto[];
}

import { ServiceLocationType } from '../../common/enums';
export declare class BusinessHoursDto {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
}
export declare class ServiceOfferingDto {
    serviceId: string;
    customPrice: number;
    customDurationMinutes: number;
}
export declare class BusinessOwnerOnboardingStep3Dto {
    servicesOffered: ServiceOfferingDto[];
    businessHours: BusinessHoursDto[];
    workingDays: number[];
    serviceLocationType: ServiceLocationType;
    travelRadiusKm?: number;
}

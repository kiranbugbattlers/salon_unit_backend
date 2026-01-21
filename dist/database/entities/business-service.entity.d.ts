import { BusinessOwner } from './business-owner.entity';
import { Service } from './service.entity';
import { ServicePackageItem } from './service-package-item.entity';
export declare class BusinessService {
    id: string;
    businessOwnerId: string;
    serviceId: string;
    customPrice: number;
    customDurationMinutes: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
    service: Service;
    packageItems: ServicePackageItem[];
}

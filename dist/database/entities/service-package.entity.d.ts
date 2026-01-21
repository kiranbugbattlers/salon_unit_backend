import { BusinessOwner } from './business-owner.entity';
import { ServicePackageItem } from './service-package-item.entity';
export declare class ServicePackage {
    id: string;
    businessOwnerId: string;
    name: string;
    description?: string;
    discountPercentage: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
    packageItems: ServicePackageItem[];
}

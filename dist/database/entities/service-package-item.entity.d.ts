import { ServicePackage } from './service-package.entity';
import { BusinessService } from './business-service.entity';
export declare class ServicePackageItem {
    id: string;
    packageId: string;
    businessServiceId: string;
    createdAt: Date;
    updatedAt: Date;
    servicePackage: ServicePackage;
    businessService: BusinessService;
}

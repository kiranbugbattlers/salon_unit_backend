import { ServiceCategory } from './service-category.entity';
import { StaffService } from './staff-service.entity';
import { BusinessService } from './business-service.entity';
import { ServiceGenderEnum } from '../../common/enums/service-gender.enum';
export declare class Service {
    id: string;
    categoryId: string;
    name: string;
    description?: string;
    basePrice?: number;
    defaultDuration?: number;
    image?: string;
    imageS3Key?: string;
    availableAtHome: boolean;
    isActive: boolean;
    gender?: ServiceGenderEnum;
    createdAt: Date;
    updatedAt: Date;
    category: ServiceCategory;
    staffServices: StaffService[];
    businessServices: BusinessService[];
}

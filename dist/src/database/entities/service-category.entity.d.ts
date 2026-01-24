import { Service } from './service.entity';
export declare class ServiceCategory {
    id: string;
    name: string;
    description?: string;
    image?: string;
    imageS3Key?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    services: Service[];
}

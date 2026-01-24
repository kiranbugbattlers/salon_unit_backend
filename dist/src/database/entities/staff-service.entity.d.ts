import { Staff } from './staff.entity';
import { Service } from './service.entity';
export declare class StaffService {
    id: string;
    staffId: string;
    serviceId: string;
    customPrice: number;
    customDurationMinutes: number;
    isActive: boolean;
    createdAt: Date;
    staff: Staff;
    service: Service;
}

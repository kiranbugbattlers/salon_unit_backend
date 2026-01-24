import { Staff } from './staff.entity';
export declare class StaffWorkingHours {
    id: string;
    staffId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    staff: Staff;
}

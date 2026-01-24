import { BreakType } from '../../common/enums';
import { Staff } from './staff.entity';
export declare class StaffBreak {
    id: string;
    staffId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakType: BreakType;
    isRecurring: boolean;
    isActive: boolean;
    effectiveFrom?: Date;
    effectiveTo?: Date;
    createdAt: Date;
    updatedAt: Date;
    staff: Staff;
}

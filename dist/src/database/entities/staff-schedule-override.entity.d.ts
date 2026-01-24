import { StaffOverrideType } from '../../common/enums';
import { Staff } from './staff.entity';
export declare class StaffScheduleOverride {
    id: string;
    staffId: string;
    date: Date;
    overrideType: StaffOverrideType;
    startTime?: string;
    endTime?: string;
    reason?: string;
    createdAt: Date;
    staff: Staff;
}

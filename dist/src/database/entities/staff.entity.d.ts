import { Gender } from '../../common/enums';
import { BusinessOwner } from './business-owner.entity';
import { StaffService } from './staff-service.entity';
import { StaffScheduleOverride } from './staff-schedule-override.entity';
import { StaffBreak } from './staff-break.entity';
export declare class Staff {
    id: string;
    businessOwnerId: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    dateOfBirth: Date;
    gender: Gender;
    profilePic?: string;
    profilePicCdnUrl?: string;
    profilePicS3Key?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
    staffServices: StaffService[];
    scheduleOverrides: StaffScheduleOverride[];
    breaks: StaffBreak[];
}

import { StaffOverrideType } from '../../common/enums';
export declare class CreateScheduleOverrideDto {
    date: string;
    overrideType: StaffOverrideType;
    startTime?: string;
    endTime?: string;
    reason?: string;
}
export declare class UpdateScheduleOverrideDto {
    overrideType?: StaffOverrideType;
    startTime?: string;
    endTime?: string;
    reason?: string;
}
export declare class ScheduleOverrideResponseDto {
    id: string;
    staffId: string;
    date: Date;
    overrideType: StaffOverrideType;
    startTime?: string;
    endTime?: string;
    reason?: string;
    createdAt: Date;
}
export declare class ScheduleOverrideListResponseDto {
    data: ScheduleOverrideResponseDto[];
    total: number;
}

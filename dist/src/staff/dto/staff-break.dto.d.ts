import { BreakType } from '../../common/enums';
export declare class CreateStaffBreakDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakType: BreakType;
    isRecurring?: boolean;
    effectiveFrom?: string;
    effectiveTo?: string;
}
export declare class UpdateStaffBreakDto {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    breakType?: BreakType;
    isRecurring?: boolean;
    isActive?: boolean;
    effectiveFrom?: string;
    effectiveTo?: string;
}
export declare class StaffBreakResponseDto {
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
}
export declare class StaffBreakListResponseDto {
    data: StaffBreakResponseDto[];
    total: number;
}

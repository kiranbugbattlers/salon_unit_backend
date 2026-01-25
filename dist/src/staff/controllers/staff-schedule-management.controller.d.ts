import { StaffScheduleManagementService } from '../services/staff-schedule-management.service';
import { CreateScheduleOverrideDto, UpdateScheduleOverrideDto, ScheduleOverrideResponseDto, ScheduleOverrideListResponseDto, CreateStaffBreakDto, UpdateStaffBreakDto, StaffBreakResponseDto, StaffBreakListResponseDto } from '../dto';
export declare class StaffScheduleManagementController {
    private readonly staffScheduleService;
    constructor(staffScheduleService: StaffScheduleManagementService);
    createScheduleOverride(req: any, staffId: string, createOverrideDto: CreateScheduleOverrideDto): Promise<ScheduleOverrideResponseDto>;
    getScheduleOverrides(req: any, staffId: string): Promise<ScheduleOverrideListResponseDto>;
    updateScheduleOverride(req: any, staffId: string, overrideId: string, updateOverrideDto: UpdateScheduleOverrideDto): Promise<ScheduleOverrideResponseDto>;
    deleteScheduleOverride(req: any, staffId: string, overrideId: string): Promise<void>;
    createStaffBreak(req: any, staffId: string, createBreakDto: CreateStaffBreakDto): Promise<StaffBreakResponseDto>;
    getStaffBreaks(req: any, staffId: string): Promise<StaffBreakListResponseDto>;
    updateStaffBreak(req: any, staffId: string, breakId: string, updateBreakDto: UpdateStaffBreakDto): Promise<StaffBreakResponseDto>;
    deleteStaffBreak(req: any, staffId: string, breakId: string): Promise<void>;
}

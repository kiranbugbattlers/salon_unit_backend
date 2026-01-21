import { Repository } from 'typeorm';
import { Staff, BusinessOwner, StaffScheduleOverride, StaffBreak } from '../../database/entities';
import { CreateScheduleOverrideDto, UpdateScheduleOverrideDto, ScheduleOverrideResponseDto, ScheduleOverrideListResponseDto, CreateStaffBreakDto, UpdateStaffBreakDto, StaffBreakResponseDto, StaffBreakListResponseDto } from '../dto';
export declare class StaffScheduleManagementService {
    private staffRepository;
    private businessOwnerRepository;
    private scheduleOverrideRepository;
    private staffBreakRepository;
    constructor(staffRepository: Repository<Staff>, businessOwnerRepository: Repository<BusinessOwner>, scheduleOverrideRepository: Repository<StaffScheduleOverride>, staffBreakRepository: Repository<StaffBreak>);
    createScheduleOverride(userId: string, staffId: string, createOverrideDto: CreateScheduleOverrideDto): Promise<ScheduleOverrideResponseDto>;
    getScheduleOverrides(userId: string, staffId: string): Promise<ScheduleOverrideListResponseDto>;
    updateScheduleOverride(userId: string, staffId: string, overrideId: string, updateOverrideDto: UpdateScheduleOverrideDto): Promise<ScheduleOverrideResponseDto>;
    deleteScheduleOverride(userId: string, staffId: string, overrideId: string): Promise<void>;
    createStaffBreak(userId: string, staffId: string, createBreakDto: CreateStaffBreakDto): Promise<StaffBreakResponseDto>;
    getStaffBreaks(userId: string, staffId: string): Promise<StaffBreakListResponseDto>;
    updateStaffBreak(userId: string, staffId: string, breakId: string, updateBreakDto: UpdateStaffBreakDto): Promise<StaffBreakResponseDto>;
    deleteStaffBreak(userId: string, staffId: string, breakId: string): Promise<void>;
    deleteAllStaffBreaks(userId: string, staffId: string): Promise<void>;
    deleteAllScheduleOverrides(userId: string, staffId: string): Promise<void>;
    private validateOverrideTime;
    private validateBreakTime;
    private timeToMinutes;
    private mapOverrideToResponseDto;
    private mapBreakToResponseDto;
}

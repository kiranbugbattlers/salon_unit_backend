import { Repository } from 'typeorm';
import { Staff, BusinessOwner, StaffService as StaffServiceEntity, BookingRequest, Booking } from '../database/entities';
import { S3Service } from '../common/services/s3.service';
import { StaffScheduleManagementService } from './services/staff-schedule-management.service';
import { CreateStaffDto, UpdateStaffDto, StaffQueryDto, StaffResponseDto, StaffListResponseDto, ProfilePictureResponseDto, MessageResponseDto } from './dto';
export declare class StaffService {
    private staffRepository;
    private businessOwnerRepository;
    private staffServiceRepository;
    private bookingRequestRepository;
    private bookingRepository;
    private readonly s3Service;
    private readonly staffScheduleService;
    constructor(staffRepository: Repository<Staff>, businessOwnerRepository: Repository<BusinessOwner>, staffServiceRepository: Repository<StaffServiceEntity>, bookingRequestRepository: Repository<BookingRequest>, bookingRepository: Repository<Booking>, s3Service: S3Service, staffScheduleService: StaffScheduleManagementService);
    create(userId: string, createStaffDto: CreateStaffDto, file?: any): Promise<StaffResponseDto>;
    findAll(userId: string, query: StaffQueryDto): Promise<StaffListResponseDto>;
    findOne(userId: string, id: string): Promise<StaffResponseDto>;
    update(userId: string, id: string, updateStaffDto: UpdateStaffDto): Promise<StaffResponseDto>;
    remove(userId: string, id: string): Promise<void>;
    deactivate(userId: string, id: string): Promise<MessageResponseDto>;
    activate(userId: string, id: string): Promise<MessageResponseDto>;
    private mapToStaffData;
    uploadProfilePicture(userId: string, staffId: string, file: any): Promise<ProfilePictureResponseDto>;
    deleteProfilePicture(userId: string, staffId: string): Promise<MessageResponseDto>;
    private createLunchBreaks;
    private updateLunchBreaks;
}

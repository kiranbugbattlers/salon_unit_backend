import { Repository } from 'typeorm';
import { Staff, BusinessOwner, Service, StaffService as StaffServiceEntity } from '../../database/entities';
import { AssignServiceDto, UpdateStaffServiceDto, StaffServiceResponseDto, StaffServiceListResponseDto } from '../dto';
export declare class StaffServiceManagementService {
    private staffRepository;
    private businessOwnerRepository;
    private serviceRepository;
    private staffServiceRepository;
    constructor(staffRepository: Repository<Staff>, businessOwnerRepository: Repository<BusinessOwner>, serviceRepository: Repository<Service>, staffServiceRepository: Repository<StaffServiceEntity>);
    assignService(userId: string, staffId: string, assignServiceDto: AssignServiceDto): Promise<StaffServiceResponseDto>;
    getStaffServices(userId: string, staffId: string): Promise<StaffServiceListResponseDto>;
    updateStaffService(userId: string, staffId: string, serviceId: string, updateStaffServiceDto: UpdateStaffServiceDto): Promise<StaffServiceResponseDto>;
    removeStaffService(userId: string, staffId: string, serviceId: string): Promise<void>;
    private mapToResponseDto;
}

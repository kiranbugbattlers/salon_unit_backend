import { StaffServiceManagementService } from '../services/staff-service-management.service';
import { AssignServiceDto, UpdateStaffServiceDto, StaffServiceResponseDto, StaffServiceListResponseDto } from '../dto';
export declare class StaffServiceManagementController {
    private readonly staffServiceManagementService;
    constructor(staffServiceManagementService: StaffServiceManagementService);
    assignService(req: any, staffId: string, assignServiceDto: AssignServiceDto): Promise<StaffServiceResponseDto>;
    getStaffServices(req: any, staffId: string): Promise<StaffServiceListResponseDto>;
    updateStaffService(req: any, staffId: string, serviceId: string, updateStaffServiceDto: UpdateStaffServiceDto): Promise<StaffServiceResponseDto>;
    removeStaffService(req: any, staffId: string, serviceId: string): Promise<void>;
}

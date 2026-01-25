import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto, StaffResponseDto, StaffListResponseDto, StaffQueryDto, ProfilePictureResponseDto, MessageResponseDto } from './dto';
export declare class StaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    create(req: any, createStaffDto: CreateStaffDto, file?: any): Promise<StaffResponseDto>;
    findAll(req: any, query: StaffQueryDto): Promise<StaffListResponseDto>;
    findOne(req: any, id: string): Promise<StaffResponseDto>;
    update(req: any, id: string, updateStaffDto: UpdateStaffDto): Promise<StaffResponseDto>;
    remove(req: any, id: string): Promise<void>;
    uploadProfilePicture(req: any, id: string, file: any): Promise<ProfilePictureResponseDto>;
    deleteProfilePicture(req: any, id: string): Promise<MessageResponseDto>;
    deactivate(req: any, id: string): Promise<MessageResponseDto>;
    activate(req: any, id: string): Promise<MessageResponseDto>;
}

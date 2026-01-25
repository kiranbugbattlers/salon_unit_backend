import { Repository } from 'typeorm';
import { SupportMember, CustomerSupportMapping } from '../database/entities';
import { CreateSupportMemberDto } from './dto/create-support-member.dto';
import { UpdateSupportMemberDto } from './dto/update-support-member.dto';
import { SupportMemberQueryDto } from './dto/support-member-query.dto';
import { S3Service } from '../common/services/s3.service';
import { AssignmentService } from './assignment.service';
export declare class SupportMemberService {
    private supportMemberRepository;
    private mappingRepository;
    private s3Service;
    private assignmentService;
    constructor(supportMemberRepository: Repository<SupportMember>, mappingRepository: Repository<CustomerSupportMapping>, s3Service: S3Service, assignmentService: AssignmentService);
    create(createDto: CreateSupportMemberDto, adminId: string): Promise<SupportMember>;
    private redistributeAdminAssignedCustomers;
    findAll(queryDto: SupportMemberQueryDto): Promise<{
        data: SupportMember[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<SupportMember>;
    update(id: string, updateDto: UpdateSupportMemberDto): Promise<SupportMember>;
    remove(id: string): Promise<void>;
    toggleActive(id: string): Promise<SupportMember>;
    uploadProfilePic(id: string, file: Express.Multer.File): Promise<SupportMember>;
    getAnalytics(): Promise<{
        totalMembers: number;
        activeMembers: number;
        totalCustomersSupported: number;
        averageCustomersPerMember: number;
        memberDistribution: any[];
    }>;
}

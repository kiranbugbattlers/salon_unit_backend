import { SupportMemberService } from './support-member.service';
import { AssignmentService } from './assignment.service';
import { CreateSupportMemberDto } from './dto/create-support-member.dto';
import { UpdateSupportMemberDto } from './dto/update-support-member.dto';
import { SupportMemberQueryDto } from './dto/support-member-query.dto';
import { AssignCustomerDto, ReassignCustomerDto } from './dto/assign-customer.dto';
export declare class SupportMemberController {
    private readonly supportMemberService;
    private readonly assignmentService;
    constructor(supportMemberService: SupportMemberService, assignmentService: AssignmentService);
    create(createDto: CreateSupportMemberDto, req: any): Promise<import("../database/entities").SupportMember>;
    findAll(queryDto: SupportMemberQueryDto): Promise<{
        data: import("../database/entities").SupportMember[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAnalytics(): Promise<{
        totalMembers: number;
        activeMembers: number;
        totalCustomersSupported: number;
        averageCustomersPerMember: number;
        memberDistribution: any[];
    }>;
    findOne(id: string): Promise<import("../database/entities").SupportMember>;
    update(id: string, updateDto: UpdateSupportMemberDto): Promise<import("../database/entities").SupportMember>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<import("../database/entities").SupportMember>;
    uploadProfilePic(id: string, file: Express.Multer.File): Promise<import("../database/entities").SupportMember>;
    assignCustomer(assignDto: AssignCustomerDto): Promise<import("../database/entities").CustomerSupportMapping>;
    reassignCustomer(reassignDto: ReassignCustomerDto): Promise<import("../database/entities").CustomerSupportMapping>;
    rebalanceAssignments(): Promise<{
        message: string;
        details: any;
    }>;
    recalculateCounts(): Promise<{
        updated: number;
    }>;
}

import { Repository, DataSource } from 'typeorm';
import { SupportMember, CustomerSupportMapping, Admin, Customer } from '../database/entities';
export declare class AssignmentService {
    private supportMemberRepository;
    private mappingRepository;
    private adminRepository;
    private customerRepository;
    private dataSource;
    private readonly logger;
    constructor(supportMemberRepository: Repository<SupportMember>, mappingRepository: Repository<CustomerSupportMapping>, adminRepository: Repository<Admin>, customerRepository: Repository<Customer>, dataSource: DataSource);
    autoAssignCustomer(customerId: string): Promise<CustomerSupportMapping>;
    manualAssignCustomer(customerId: string, supportMemberId: string | null, notes?: string): Promise<CustomerSupportMapping>;
    reassignAllCustomers(fromMemberId: string, toMemberId?: string): Promise<{
        reassignedCount: number;
    }>;
    rebalanceAssignments(): Promise<{
        message: string;
        details: any;
    }>;
    recalculateCustomerCount(memberId: string): Promise<number>;
    recalculateAllCustomerCounts(): Promise<{
        updated: number;
    }>;
    findActiveAssignment(customerId: string): Promise<CustomerSupportMapping | null>;
    private getDefaultAdmin;
}

import { Customer } from './customer.entity';
import { SupportMember } from './support-member.entity';
import { Admin } from './admin.entity';
export declare class CustomerSupportMapping {
    id: string;
    customerId: string;
    supportMemberId?: string;
    adminId?: string;
    assignedAt: Date;
    isActive: boolean;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    customer: Customer;
    supportMember?: SupportMember;
    admin?: Admin;
}

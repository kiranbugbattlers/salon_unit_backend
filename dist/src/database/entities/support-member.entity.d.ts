import { Gender } from '../../common/enums';
import { Admin } from './admin.entity';
import { CustomerSupportMapping } from './customer-support-mapping.entity';
export declare class SupportMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePic?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    isActive: boolean;
    customerCount: number;
    joiningDate: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    admin: Admin;
    customerMappings: CustomerSupportMapping[];
    get fullName(): string;
}

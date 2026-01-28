import { Repository } from 'typeorm';
import { BusinessOwner } from '../../database/entities';
import { VendorStatus } from '../../common/enums/vendor-status.enum';
export declare class VendorStatusService {
    private readonly businessOwnerRepository;
    private readonly logger;
    constructor(businessOwnerRepository: Repository<BusinessOwner>);
    updateVendorStatusOnApproval(businessOwnerId: string): Promise<void>;
    manuallyUpdateVendorStatus(businessOwnerId: string, newStatus: VendorStatus, remarks?: string): Promise<BusinessOwner>;
    getVendorStatusStats(): Promise<any>;
    calculateCreditUsage(businessOwnerId: string): Promise<{
        creditLimit: number;
        totalDueAmount: number;
        totalPaidAmount: number;
        remainingCredit: number;
        usagePercentage: number;
        isOverdue: boolean;
    }>;
    checkAndUpdateVendorStatusBasedOnCreditUsage(businessOwnerId: string): Promise<{
        previousStatus: string;
        newStatus: string;
        creditUsage: any;
    }>;
    preserveVendorStatusOnOverdue(businessOwnerId: string): Promise<void>;
    preserveVendorStatusOnPayment(businessOwnerId: string): Promise<void>;
}

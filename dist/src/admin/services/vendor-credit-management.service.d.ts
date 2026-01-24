import { Repository } from 'typeorm';
import { BusinessOwner } from '../../database/entities';
import { VendorStatus } from '../../common/enums/vendor-status.enum';
import { AddVendorCreditDto, VendorCreditStatusDto } from '../dto/vendor-credit-management.dto';
export declare class VendorCreditManagementService {
    private readonly businessOwnerRepository;
    constructor(businessOwnerRepository: Repository<BusinessOwner>);
    addCreditToVendor(businessOwnerId: string, addCreditDto: AddVendorCreditDto): Promise<{
        id: string;
        shopId: string;
        businessName: string;
        ownerName: string;
        phone: string;
        previousCreditLimit: number;
        creditPointsAdded: number;
        newCreditLimit: number;
        accountStatus: VendorStatus;
        isActive: boolean;
        reason: string;
        activatedAt: Date;
    }>;
    checkAndUpdateOverdueVendors(): Promise<{
        totalOverdue: number;
        vendors: {
            id: string;
            shopId: string;
            businessName: string;
            ownerName: string;
            currentStatus: VendorStatus;
            creditLimit: number;
            isOverdue: boolean;
            note: string;
        }[];
        message: string;
    }>;
    getVendorCreditInfo(businessOwnerId: string): Promise<{
        id: string;
        shopId: string;
        businessName: string;
        ownerName: string;
        phone: string;
        email: string;
        currentCreditLimit: number;
        isApproved: boolean;
        isActive: boolean;
        vendorStatus: VendorStatus;
        creditStatus: string;
        isOverdue: boolean;
        accountCreated: Date;
        lastUpdated: Date;
    }>;
    updateVendorCreditStatus(businessOwnerId: string, statusDto: VendorCreditStatusDto): Promise<{
        id: string;
        shopId: string;
        businessName: string;
        ownerName: string;
        previousStatus: VendorStatus;
        newStatus: VendorStatus;
        isActive: boolean;
        notes: string;
        updatedAt: Date;
    }>;
    getAllVendorsCreditStatus(): Promise<{
        id: string;
        shopId: string;
        businessName: string;
        ownerName: string;
        phone: string;
        email: string;
        currentCreditLimit: number;
        isApproved: boolean;
        isActive: boolean;
        vendorStatus: VendorStatus;
        creditStatus: string;
        isOverdue: boolean;
    }[]>;
}

import { Repository } from 'typeorm';
import { BusinessOwner } from '../../database/entities';
import { UpdateVendorStatusDto } from '../dto/update-vendor-status.dto';
import { AddVendorCreditDto, VendorCreditStatusDto } from '../dto/vendor-credit-management.dto';
import { VendorCreditManagementService } from '../services/vendor-credit-management.service';
export declare class AdminVendorController {
    private readonly businessOwnerRepository;
    private readonly vendorCreditManagementService;
    constructor(businessOwnerRepository: Repository<BusinessOwner>, vendorCreditManagementService: VendorCreditManagementService);
    searchVendors(query: string, page?: number, limit?: number): Promise<any>;
    updateVendorStatus(businessOwnerId: string, updateDto: UpdateVendorStatusDto): Promise<any>;
    addVendorCredit(businessOwnerId: string, addCreditDto: AddVendorCreditDto): Promise<any>;
    getVendorCreditInfo(businessOwnerId: string): Promise<any>;
    updateVendorCreditStatus(businessOwnerId: string, statusDto: VendorCreditStatusDto): Promise<any>;
    checkOverdueVendors(): Promise<any>;
    getAllVendorsCreditStatus(): Promise<any>;
}

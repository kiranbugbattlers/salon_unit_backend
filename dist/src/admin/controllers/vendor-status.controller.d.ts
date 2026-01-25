import { VendorStatusService } from '../services/vendor-status.service';
import { VendorStatus } from '../../common/enums/vendor-status.enum';
export declare class VendorStatusController {
    private readonly vendorStatusService;
    constructor(vendorStatusService: VendorStatusService);
    getVendorStatusStats(): Promise<any>;
    getBusinessOwnersByVendorStatus(status?: VendorStatus, page?: number, limit?: number): Promise<any>;
    manuallyUpdateVendorStatus(businessOwnerId: string, updateDto: {
        status: VendorStatus;
        adminRemarks?: string;
    }): Promise<any>;
}

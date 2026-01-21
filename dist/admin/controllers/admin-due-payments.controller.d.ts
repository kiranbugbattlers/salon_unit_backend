import { Repository } from 'typeorm';
import { VendorDuePayment, DuePaymentStatus, BusinessOwner } from '../../database/entities';
import { VendorStatusService } from '../services/vendor-status.service';
export declare class AdminDuePaymentsController {
    private readonly vendorDuePaymentRepository;
    private readonly businessOwnerRepository;
    private readonly vendorStatusService;
    private readonly logger;
    constructor(vendorDuePaymentRepository: Repository<VendorDuePayment>, businessOwnerRepository: Repository<BusinessOwner>, vendorStatusService: VendorStatusService);
    getAllDuePayments(status?: DuePaymentStatus, businessOwnerId?: string, fromDate?: string, toDate?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<any>;
    getDuePaymentsSummaryEndpoint(businessOwnerId?: string, fromDate?: string, toDate?: string): Promise<any>;
    getCreditUsage(businessOwnerId: string): Promise<any>;
    getDuePaymentById(id: string): Promise<any>;
    checkCreditStatus(businessOwnerId: string): Promise<any>;
    setCreditLimit(businessOwnerId: string, setCreditDto: {
        creditLimit: number;
        remarks?: string;
    }): Promise<any>;
    createDuePayment(createDto: any): Promise<any>;
    updateDuePayment(id: string, updateDto: any): Promise<any>;
    private getDuePaymentsSummary;
}

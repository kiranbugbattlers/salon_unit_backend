"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VendorStatusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorStatusService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
const vendor_status_enum_1 = require("../../common/enums/vendor-status.enum");
let VendorStatusService = VendorStatusService_1 = class VendorStatusService {
    constructor(businessOwnerRepository) {
        this.businessOwnerRepository = businessOwnerRepository;
        this.logger = new common_1.Logger(VendorStatusService_1.name);
    }
    async updateVendorStatusOnApproval(businessOwnerId) {
        try {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { id: businessOwnerId },
            });
            if (!businessOwner) {
                this.logger.warn(`Business owner ${businessOwnerId} not found`);
                return;
            }
            const oldStatus = businessOwner.vendorStatus;
            if (businessOwner.isApproved && businessOwner.vendorStatus !== vendor_status_enum_1.VendorStatus.ACTIVE) {
                businessOwner.vendorStatus = vendor_status_enum_1.VendorStatus.ACTIVE;
                this.logger.log(`Business owner ${businessOwnerId} approved - vendor status changed from ${oldStatus} to ${vendor_status_enum_1.VendorStatus.ACTIVE}`);
            }
            else if (!businessOwner.isApproved && businessOwner.vendorStatus === vendor_status_enum_1.VendorStatus.ACTIVE) {
                businessOwner.vendorStatus = vendor_status_enum_1.VendorStatus.HOLD_ACCOUNT;
                this.logger.log(`Business owner ${businessOwnerId} unapproved - vendor status changed from ${oldStatus} to ${vendor_status_enum_1.VendorStatus.HOLD_ACCOUNT}`);
            }
            await this.businessOwnerRepository.save(businessOwner);
        }
        catch (error) {
            this.logger.error(`Failed to update vendor status for business owner ${businessOwnerId}:`, error);
            throw error;
        }
    }
    async manuallyUpdateVendorStatus(businessOwnerId, newStatus, adminRemarks) {
        try {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { id: businessOwnerId },
            });
            if (!businessOwner) {
                throw new Error('Business owner not found');
            }
            const oldStatus = businessOwner.vendorStatus;
            businessOwner.vendorStatus = newStatus;
            await this.businessOwnerRepository.save(businessOwner);
            this.logger.log(`Admin manually updated vendor status for business owner ${businessOwnerId} ` +
                `from ${oldStatus} to ${newStatus}${adminRemarks ? ` - Remarks: ${adminRemarks}` : ''}`);
            return businessOwner;
        }
        catch (error) {
            this.logger.error(`Failed to manually update vendor status for business owner ${businessOwnerId}:`, error);
            throw error;
        }
    }
    async getVendorStatusStats() {
        try {
            const stats = await this.businessOwnerRepository
                .createQueryBuilder('businessOwner')
                .select('businessOwner.vendorStatus', 'status')
                .addSelect('COUNT(*)', 'count')
                .groupBy('businessOwner.vendorStatus')
                .getRawMany();
            return stats;
        }
        catch (error) {
            this.logger.error('Failed to get vendor status statistics:', error);
            throw error;
        }
    }
    async calculateCreditUsage(businessOwnerId) {
        try {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { id: businessOwnerId },
            });
            if (!businessOwner) {
                throw new Error('Business owner not found');
            }
            const paymentStats = await this.businessOwnerRepository
                .createQueryBuilder('bo')
                .leftJoin('bo.duePayments', 'vdp')
                .select('bo.id', 'businessOwnerId')
                .addSelect('COALESCE(SUM(vdp.due_amount), 0)', 'totalDueAmount')
                .addSelect('COALESCE(SUM(vdp.paid_amount), 0)', 'totalPaidAmount')
                .where('bo.id = :businessOwnerId', { businessOwnerId })
                .groupBy('bo.id')
                .getRawOne();
            const creditLimit = businessOwner.creditLimit || 0;
            const totalDueAmount = parseFloat(paymentStats?.totalDueAmount || '0');
            const totalPaidAmount = parseFloat(paymentStats?.totalPaidAmount || '0');
            const remainingCredit = creditLimit - (totalDueAmount - totalPaidAmount);
            const usagePercentage = creditLimit > 0 ? ((totalDueAmount - totalPaidAmount) / creditLimit) * 100 : 0;
            const isOverdue = remainingCredit < 0;
            return {
                creditLimit,
                totalDueAmount,
                totalPaidAmount,
                remainingCredit,
                usagePercentage,
                isOverdue,
            };
        }
        catch (error) {
            this.logger.error(`Failed to calculate credit usage for business owner ${businessOwnerId}:`, error);
            throw error;
        }
    }
    async checkAndUpdateVendorStatusBasedOnCreditUsage(businessOwnerId) {
        try {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { id: businessOwnerId },
            });
            if (!businessOwner) {
                throw new Error('Business owner not found');
            }
            const previousStatus = businessOwner.vendorStatus;
            const creditUsage = await this.calculateCreditUsage(businessOwnerId);
            let newStatus = previousStatus;
            if (creditUsage.isOverdue && previousStatus === vendor_status_enum_1.VendorStatus.ACTIVE) {
                this.logger.warn(`Business owner ${businessOwnerId} has overdue payments but remains ACTIVE. ` +
                    `Usage: ₹${creditUsage.totalDueAmount - creditUsage.totalPaidAmount} / ₹${creditUsage.creditLimit}. ` +
                    `Vendor remains active despite overdue payments.`);
                newStatus = previousStatus;
            }
            return {
                previousStatus,
                newStatus,
                creditUsage,
            };
        }
        catch (error) {
            this.logger.error(`Failed to check and update vendor status for business owner ${businessOwnerId}:`, error);
            throw error;
        }
    }
    async preserveVendorStatusOnOverdue(businessOwnerId) {
        try {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { id: businessOwnerId },
            });
            if (!businessOwner) {
                this.logger.warn(`Business owner ${businessOwnerId} not found for status preservation`);
                return;
            }
            this.logger.debug(`Preserving vendor status ${businessOwner.vendorStatus} for business owner ${businessOwnerId} during overdue operation`);
            await this.businessOwnerRepository.save(businessOwner);
        }
        catch (error) {
            this.logger.error(`Failed to preserve vendor status for business owner ${businessOwnerId}:`, error);
        }
    }
    async preserveVendorStatusOnPayment(businessOwnerId) {
        try {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { id: businessOwnerId },
            });
            if (!businessOwner) {
                this.logger.warn(`Business owner ${businessOwnerId} not found for status preservation`);
                return;
            }
            this.logger.debug(`Preserving vendor status ${businessOwner.vendorStatus} for business owner ${businessOwnerId} after payment operation`);
            await this.businessOwnerRepository.save(businessOwner);
        }
        catch (error) {
            this.logger.error(`Failed to preserve vendor status for business owner ${businessOwnerId}:`, error);
        }
    }
};
exports.VendorStatusService = VendorStatusService;
exports.VendorStatusService = VendorStatusService = VendorStatusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VendorStatusService);
//# sourceMappingURL=vendor-status.service.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorCreditManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
const vendor_status_enum_1 = require("../../common/enums/vendor-status.enum");
let VendorCreditManagementService = class VendorCreditManagementService {
    constructor(businessOwnerRepository) {
        this.businessOwnerRepository = businessOwnerRepository;
    }
    async addCreditToVendor(businessOwnerId, addCreditDto) {
        const vendor = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user'],
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        if (!vendor.isApproved) {
            throw new common_1.BadRequestException('Vendor must be approved to add credit points');
        }
        const previousCreditLimit = parseFloat((vendor.creditLimit || 0).toString());
        const newCreditLimit = previousCreditLimit + addCreditDto.creditPoints;
        vendor.creditLimit = newCreditLimit;
        vendor.vendorStatus = vendor_status_enum_1.VendorStatus.ACTIVE;
        vendor.isActive = true;
        const updatedVendor = await this.businessOwnerRepository.save(vendor);
        return {
            id: updatedVendor.id,
            shopId: updatedVendor.shopId,
            businessName: updatedVendor.businessName,
            ownerName: updatedVendor.firstName && updatedVendor.lastName
                ? `${updatedVendor.firstName} ${updatedVendor.lastName}`.trim()
                : updatedVendor.businessName || 'N/A',
            phone: vendor.user?.phone || 'N/A',
            previousCreditLimit,
            creditPointsAdded: addCreditDto.creditPoints,
            newCreditLimit: parseFloat(updatedVendor.creditLimit.toFixed(2)),
            accountStatus: updatedVendor.vendorStatus,
            isActive: updatedVendor.isActive,
            reason: addCreditDto.reason || 'Credit points added by admin - account activated',
            activatedAt: updatedVendor.updatedAt,
        };
    }
    async checkAndUpdateOverdueVendors() {
        const overdueVendors = await this.businessOwnerRepository.find({
            where: [
                { creditLimit: (0, typeorm_2.LessThanOrEqual)(0) },
                { creditLimit: null },
            ],
            relations: ['user'],
        });
        const updatedVendors = [];
        for (const vendor of overdueVendors) {
            if (vendor.vendorStatus !== vendor_status_enum_1.VendorStatus.INACTIVE) {
                vendor.vendorStatus = vendor_status_enum_1.VendorStatus.INACTIVE;
                vendor.isActive = false;
                await this.businessOwnerRepository.save(vendor);
                updatedVendors.push({
                    id: vendor.id,
                    shopId: vendor.shopId,
                    businessName: vendor.businessName,
                    ownerName: vendor.firstName && vendor.lastName
                        ? `${vendor.firstName} ${vendor.lastName}`.trim()
                        : vendor.businessName || 'N/A',
                    previousStatus: vendor.vendorStatus,
                    newStatus: vendor_status_enum_1.VendorStatus.INACTIVE,
                    creditLimit: vendor.creditLimit || 0,
                    markedOverdueAt: new Date(),
                });
            }
        }
        return {
            totalOverdue: updatedVendors.length,
            vendors: updatedVendors,
        };
    }
    async getVendorCreditInfo(businessOwnerId) {
        const vendor = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user'],
            select: {
                id: true,
                shopId: true,
                businessName: true,
                firstName: true,
                lastName: true,
                creditLimit: true,
                isApproved: true,
                isActive: true,
                vendorStatus: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    phone: true,
                    email: true,
                },
            },
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        let creditStatus = 'active';
        let isOverdue = false;
        if ((vendor.creditLimit || 0) <= 0) {
            creditStatus = 'overdue';
            isOverdue = true;
        }
        else if (!vendor.isActive) {
            creditStatus = 'suspended';
        }
        return {
            id: vendor.id,
            shopId: vendor.shopId,
            businessName: vendor.businessName,
            ownerName: vendor.firstName && vendor.lastName
                ? `${vendor.firstName} ${vendor.lastName}`.trim()
                : vendor.businessName || 'N/A',
            phone: vendor.user?.phone || 'N/A',
            email: vendor.user?.email || 'N/A',
            currentCreditLimit: vendor.creditLimit || 0,
            isApproved: vendor.isApproved,
            isActive: vendor.isActive,
            vendorStatus: vendor.vendorStatus,
            creditStatus: creditStatus,
            isOverdue: isOverdue,
            accountCreated: vendor.createdAt,
            lastUpdated: vendor.updatedAt,
        };
    }
    async updateVendorCreditStatus(businessOwnerId, statusDto) {
        const vendor = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user'],
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        const previousStatus = vendor.vendorStatus;
        if (statusDto.status === 'active') {
            vendor.vendorStatus = vendor_status_enum_1.VendorStatus.ACTIVE;
            vendor.isActive = true;
        }
        else if (statusDto.status === 'overdue' || statusDto.status === 'suspended') {
            vendor.vendorStatus = vendor_status_enum_1.VendorStatus.INACTIVE;
            vendor.isActive = false;
        }
        const updatedVendor = await this.businessOwnerRepository.save(vendor);
        return {
            id: updatedVendor.id,
            shopId: updatedVendor.shopId,
            businessName: updatedVendor.businessName,
            ownerName: updatedVendor.firstName && updatedVendor.lastName
                ? `${updatedVendor.firstName} ${updatedVendor.lastName}`.trim()
                : updatedVendor.businessName || 'N/A',
            previousStatus,
            newStatus: updatedVendor.vendorStatus,
            isActive: updatedVendor.isActive,
            notes: statusDto.notes || `Status updated by admin`,
            updatedAt: updatedVendor.updatedAt,
        };
    }
    async getAllVendorsCreditStatus() {
        const vendors = await this.businessOwnerRepository.find({
            relations: ['user'],
            select: {
                id: true,
                shopId: true,
                businessName: true,
                firstName: true,
                lastName: true,
                creditLimit: true,
                isApproved: true,
                isActive: true,
                vendorStatus: true,
                user: {
                    phone: true,
                    email: true,
                },
            },
            order: { updatedAt: 'DESC' },
        });
        return vendors.map(vendor => {
            let creditStatus = 'active';
            if ((vendor.creditLimit || 0) <= 0) {
                creditStatus = 'overdue';
            }
            else if (!vendor.isActive) {
                creditStatus = 'suspended';
            }
            return {
                id: vendor.id,
                shopId: vendor.shopId,
                businessName: vendor.businessName || 'N/A',
                ownerName: vendor.firstName && vendor.lastName
                    ? `${vendor.firstName} ${vendor.lastName}`.trim()
                    : vendor.businessName || 'N/A',
                phone: vendor.user?.phone || 'N/A',
                email: vendor.user?.email || 'N/A',
                currentCreditLimit: vendor.creditLimit || 0,
                isApproved: vendor.isApproved,
                isActive: vendor.isActive,
                vendorStatus: vendor.vendorStatus,
                creditStatus: creditStatus,
                isOverdue: (vendor.creditLimit || 0) <= 0,
            };
        });
    }
};
exports.VendorCreditManagementService = VendorCreditManagementService;
exports.VendorCreditManagementService = VendorCreditManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VendorCreditManagementService);
//# sourceMappingURL=vendor-credit-management.service.js.map
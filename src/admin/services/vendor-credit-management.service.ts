import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { BusinessOwner } from '../../database/entities';
import { VendorStatus } from '../../common/enums/vendor-status.enum';
import { AddVendorCreditDto, VendorCreditStatusDto } from '../dto/vendor-credit-management.dto';

@Injectable()
export class VendorCreditManagementService {
  constructor(
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
  ) {}

  async addCreditToVendor(businessOwnerId: string, addCreditDto: AddVendorCreditDto) {
    const vendor = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['user'],
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (!vendor.isApproved) {
      throw new BadRequestException('Vendor must be approved to add credit points');
    }

    const previousCreditLimit = parseFloat((vendor.creditLimit || 0).toString());
    const newCreditLimit = previousCreditLimit + addCreditDto.creditPoints;
    
    // Update vendor credit and ensure account is active
    vendor.creditLimit = newCreditLimit;
    // Ensure vendor account is active when credit points are added
    vendor.vendorStatus = VendorStatus.ACTIVE;
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
      reason: addCreditDto.reason || 'Credit points added by admin - vendor account activated',
      activatedAt: updatedVendor.updatedAt,
    };
  }

  async checkAndUpdateOverdueVendors() {
    // DEPRECATED: This method should no longer change vendor status automatically
    // Vendor status should only be changed by admin manually
    // This method now only returns information without changing status
    
    const overdueVendors = await this.businessOwnerRepository.find({
      where: [
        { creditLimit: LessThanOrEqual(0) },
        { creditLimit: null },
      ],
      relations: ['user'],
    });

    const overdueInfo = overdueVendors.map(vendor => ({
      id: vendor.id,
      shopId: vendor.shopId,
      businessName: vendor.businessName,
      ownerName: vendor.firstName && vendor.lastName
        ? `${vendor.firstName} ${vendor.lastName}`.trim()
        : vendor.businessName || 'N/A',
      currentStatus: vendor.vendorStatus,
      creditLimit: vendor.creditLimit || 0,
      isOverdue: (vendor.creditLimit || 0) <= 0,
      note: 'Vendor status remains unchanged - only admin can modify vendor status',
    }));

    return {
      totalOverdue: overdueInfo.length,
      vendors: overdueInfo,
      message: 'Vendor status check completed - no automatic changes made',
    };
  }

  async getVendorCreditInfo(businessOwnerId: string) {
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
      throw new NotFoundException('Vendor not found');
    }

    // Determine credit status
    let creditStatus = 'active';
    let isOverdue = false;
    
    if ((vendor.creditLimit || 0) <= 0) {
      creditStatus = 'overdue';
      isOverdue = true;
    } else if (!vendor.isActive) {
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

  async updateVendorCreditStatus(businessOwnerId: string, statusDto: VendorCreditStatusDto) {
    const vendor = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['user'],
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const previousStatus = vendor.vendorStatus;
    
    // DEPRECATED: Do NOT automatically change vendor status based on credit status
    // Vendor status should only be changed manually by admin
    // This method now only logs the request without changing status
    
    console.log(`DEPRECATED: updateVendorCreditStatus called for vendor ${businessOwnerId}. ` +
                `Requested status: ${statusDto.status}. Vendor status remains ${previousStatus} - ` +
                'only admin can manually change vendor status.');

    // Return unchanged vendor info
    return {
      id: vendor.id,
      shopId: vendor.shopId,
      businessName: vendor.businessName,
      ownerName: vendor.firstName && vendor.lastName
        ? `${vendor.firstName} ${vendor.lastName}`.trim()
        : vendor.businessName || 'N/A',
      previousStatus,
      newStatus: previousStatus, // Status unchanged
      isActive: vendor.isActive,
      notes: `Status change request ignored - vendor status remains ${previousStatus}. Only admin can manually change vendor status.`,
      updatedAt: vendor.updatedAt,
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
      } else if (!vendor.isActive) {
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
}

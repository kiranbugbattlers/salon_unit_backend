import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessOwner } from '../../database/entities';
import { VendorStatus } from '../../common/enums/vendor-status.enum';

@Injectable()
export class VendorStatusService {
  private readonly logger = new Logger(VendorStatusService.name);

  constructor(
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
  ) {}

  /**
   * Update vendor status based on business owner approval status
   * This is the only automated way vendor status should change
   */
  async updateVendorStatusOnApproval(businessOwnerId: string): Promise<void> {
    try {
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { id: businessOwnerId },
      });

      if (!businessOwner) {
        this.logger.warn(`Business owner ${businessOwnerId} not found`);
        return;
      }

      const oldStatus = businessOwner.vendorStatus;
      
      // Only change vendor status based on approval status
      if (businessOwner.isApproved && businessOwner.vendorStatus !== VendorStatus.ACTIVE) {
        businessOwner.vendorStatus = VendorStatus.ACTIVE;
        this.logger.log(`Business owner ${businessOwnerId} approved - vendor status changed from ${oldStatus} to ${VendorStatus.ACTIVE}`);
      } else if (!businessOwner.isApproved && businessOwner.vendorStatus === VendorStatus.ACTIVE) {
        businessOwner.vendorStatus = VendorStatus.HOLD_ACCOUNT;
        this.logger.log(`Business owner ${businessOwnerId} unapproved - vendor status changed from ${oldStatus} to ${VendorStatus.HOLD_ACCOUNT}`);
      }

      await this.businessOwnerRepository.save(businessOwner);
    } catch (error) {
      this.logger.error(`Failed to update vendor status for business owner ${businessOwnerId}:`, error);
      throw error;
    }
  }

  /**
   * Manual vendor status update by admin only
   * This bypasses the automated approval-based logic
   */
  async manuallyUpdateVendorStatus(
    businessOwnerId: string, 
    newStatus: VendorStatus,
    adminRemarks?: string
  ): Promise<BusinessOwner> {
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

      this.logger.log(
        `Admin manually updated vendor status for business owner ${businessOwnerId} ` +
        `from ${oldStatus} to ${newStatus}${adminRemarks ? ` - Remarks: ${adminRemarks}` : ''}`
      );

      return businessOwner;
    } catch (error) {
      this.logger.error(`Failed to manually update vendor status for business owner ${businessOwnerId}:`, error);
      throw error;
    }
  }

  /**
   * Get vendor status statistics
   */
  async getVendorStatusStats(): Promise<any> {
    try {
      const stats = await this.businessOwnerRepository
        .createQueryBuilder('businessOwner')
        .select('businessOwner.vendorStatus', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('businessOwner.vendorStatus')
        .getRawMany();

      return stats;
    } catch (error) {
      this.logger.error('Failed to get vendor status statistics:', error);
      throw error;
    }
  }

  /**
   * Calculate credit usage for a business owner
   * Returns total due amount vs credit limit
   */
  async calculateCreditUsage(businessOwnerId: string): Promise<{
    creditLimit: number;
    totalDueAmount: number;
    totalPaidAmount: number;
    remainingCredit: number;
    usagePercentage: number;
    isOverdue: boolean;
  }> {
    try {
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { id: businessOwnerId },
      });

      if (!businessOwner) {
        throw new Error('Business owner not found');
      }

      // Calculate total due and paid amounts
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
    } catch (error) {
      this.logger.error(`Failed to calculate credit usage for business owner ${businessOwnerId}:`, error);
      throw error;
    }
  }

  /**
   * Check and update vendor status based on credit usage
   * If usage exceeds credit limit, mark as overdue
   */
  async checkAndUpdateVendorStatusBasedOnCreditUsage(businessOwnerId: string): Promise<{
    previousStatus: string;
    newStatus: string;
    creditUsage: any;
  }> {
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

      // Vendors with due payments should NOT be suspended - keep them active
      if (creditUsage.isOverdue && previousStatus === VendorStatus.ACTIVE) {
        // Don't suspend vendors with due payments - keep them active
        this.logger.warn(
          `Business owner ${businessOwnerId} has overdue payments but remains ACTIVE. ` +
          `Usage: ₹${creditUsage.totalDueAmount - creditUsage.totalPaidAmount} / ₹${creditUsage.creditLimit}. ` +
          `Vendor remains active despite overdue payments.`
        );
        newStatus = previousStatus; // Keep same status - remain ACTIVE
      }

      return {
        previousStatus,
        newStatus,
        creditUsage,
      };
    } catch (error) {
      this.logger.error(`Failed to check and update vendor status for business owner ${businessOwnerId}:`, error);
      throw error;
    }
  }

  /**
   * Ensure vendor status doesn't change on overdue operations
   * This method should be called after overdue status changes to maintain status
   */
  async preserveVendorStatusOnOverdue(businessOwnerId: string): Promise<void> {
    try {
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { id: businessOwnerId },
      });

      if (!businessOwner) {
        this.logger.warn(`Business owner ${businessOwnerId} not found for status preservation`);
        return;
      }

      // Log that vendor status is being preserved during overdue operation
      this.logger.debug(
        `Preserving vendor status ${businessOwner.vendorStatus} for business owner ${businessOwnerId} during overdue operation`
      );

      // No status change - this ensures overdue status doesn't affect vendor status
      await this.businessOwnerRepository.save(businessOwner);
    } catch (error) {
      this.logger.error(`Failed to preserve vendor status for business owner ${businessOwnerId}:`, error);
    }
  }

  /**
   * Ensure vendor status doesn't change on payment or due status changes
   * This method should be called after payment operations to maintain status
   */
  async preserveVendorStatusOnPayment(businessOwnerId: string): Promise<void> {
    try {
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { id: businessOwnerId },
      });

      if (!businessOwner) {
        this.logger.warn(`Business owner ${businessOwnerId} not found for status preservation`);
        return;
      }

      // Log that vendor status is being preserved
      this.logger.debug(
        `Preserving vendor status ${businessOwner.vendorStatus} for business owner ${businessOwnerId} after payment operation`
      );

      // No status change - this ensures payments don't affect vendor status
      await this.businessOwnerRepository.save(businessOwner);
    } catch (error) {
      this.logger.error(`Failed to preserve vendor status for business owner ${businessOwnerId}:`, error);
    }
  }
}

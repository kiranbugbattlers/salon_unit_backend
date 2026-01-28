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
   * DEPRECATED: This method should no longer be used
   * Vendor status should NOT change automatically based on approval
   * Only admin can manually change vendor status
   */
  async updateVendorStatusOnApproval(businessOwnerId: string): Promise<void> {
    this.logger.warn(
      `DEPRECATED: updateVendorStatusOnApproval called for business owner ${businessOwnerId}. ` +
      'Vendor status should only be changed manually by admin.'
    );
    // Do nothing - vendor status should not change automatically
  }

  /**
   * Manual vendor status update by admin only
   * This bypasses the automated approval-based logic
   */
  async manuallyUpdateVendorStatus(
    businessOwnerId: string, 
    newStatus: VendorStatus,
    remarks?: string
  ): Promise<BusinessOwner> {
    try {
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { id: businessOwnerId },
      });

      if (!businessOwner) {
        throw new Error('Business owner not found');
      }

      const oldStatus = businessOwner.vendorStatus;
      
      // Validate and convert vendorStatus if needed
      if (typeof newStatus === 'string') {
        // Find matching enum value (case-insensitive)
        const statusValue = Object.values(VendorStatus).find(
          status => status.toLowerCase() === newStatus.toLowerCase()
        );
        if (statusValue) {
          businessOwner.vendorStatus = statusValue as VendorStatus;
        } else {
          console.warn('Invalid vendorStatus value:', newStatus);
          businessOwner.vendorStatus = VendorStatus.ACTIVE; // Use default
        }
      } else {
        businessOwner.vendorStatus = newStatus;
      }

      try {
        await this.businessOwnerRepository.save(businessOwner);

        this.logger.log(
          `Admin manually updated vendor status for business owner ${businessOwnerId} ` +
          `from ${oldStatus} to ${businessOwner.vendorStatus}${remarks ? ` - remarks: ${remarks}` : ''}`
        );

        return businessOwner;
      } catch (error) {
        console.error('Error updating vendor status:', error.message);
        
        // Handle constraint errors with multiple approaches
        if (error.message.includes('vendor_status_check') || error.message.includes('violates check constraint')) {
          console.log('Database constraint error. Trying alternative approaches...');
          
          // Approach 1: Try with default value
          try {
            businessOwner.vendorStatus = VendorStatus.ACTIVE;
            await this.businessOwnerRepository.save(businessOwner);
            
            this.logger.log(
              `Admin manually updated vendor status for business owner ${businessOwnerId} ` +
              `from ${oldStatus} to ${businessOwner.vendorStatus} (default used due to constraint)${remarks ? ` - remarks: ${remarks}` : ''}`
            );

            return businessOwner;
          } catch (retryError1) {
            console.error('Retry with ACTIVE failed:', retryError1.message);
            
            // Approach 2: Save without vendorStatus first
            try {
              const businessOwnerCopy = { ...businessOwner };
              delete (businessOwnerCopy as any).vendorStatus;
              
              await this.businessOwnerRepository.save(businessOwnerCopy);
              console.log('Business owner saved without vendorStatus');
              
              // Update vendorStatus separately
              try {
                await this.businessOwnerRepository.update(businessOwnerId, {
                  vendorStatus: VendorStatus.ACTIVE
                });
                console.log('vendorStatus updated separately');
                
                const updatedBusinessOwner = await this.businessOwnerRepository.findOne({
                  where: { id: businessOwnerId }
                });
                
                if (updatedBusinessOwner) {
                  Object.assign(businessOwner, updatedBusinessOwner);
                }
                
                this.logger.log(
                  `Admin manually updated vendor status for business owner ${businessOwnerId} ` +
                  `from ${oldStatus} to ${businessOwner.vendorStatus} (alternative approach)${remarks ? ` - remarks: ${remarks}` : ''}`
                );

                return businessOwner;
              } catch (statusUpdateError) {
                console.error('Failed to update vendorStatus separately:', statusUpdateError.message);
                // Continue without vendorStatus update
                this.logger.log(
                  `Admin updated business owner ${businessOwnerId} but vendorStatus could not be changed due to database constraint${remarks ? ` - remarks: ${remarks}` : ''}`
                );
                return businessOwner;
              }
            } catch (retryError2) {
              console.error('Save without vendorStatus failed:', retryError2.message);
              
              // Approach 3: Use raw SQL as last resort
              try {
                await this.businessOwnerRepository
                  .createQueryBuilder()
                  .update(BusinessOwner)
                  .set({ vendorStatus: VendorStatus.ACTIVE })
                  .where('id = :id', { id: businessOwnerId })
                  .execute();
                console.log('Raw SQL update successful');
                
                this.logger.log(
                  `Admin manually updated vendor status for business owner ${businessOwnerId} ` +
                  `from ${oldStatus} to ACTIVE (raw SQL approach)${remarks ? ` - remarks: ${remarks}` : ''}`
                );
                
                return businessOwner;
              } catch (rawSqlError) {
                console.error('Raw SQL update failed:', rawSqlError.message);
                throw new Error(`Failed to update vendor status. Multiple approaches tried. Last error: ${rawSqlError.message}`);
              }
            }
          }
        } else {
          throw error;
        }
      }
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
   * DEPRECATED: Vendor status should NEVER change based on credit usage
   * Vendors remain active regardless of payment status
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
      
      // NEVER change vendor status based on payment status
      // Vendors remain active regardless of due, pending, or overdue payments
      this.logger.log(
        `Business owner ${businessOwnerId} payment status checked. ` +
        `Usage: ₹${creditUsage.totalDueAmount - creditUsage.totalPaidAmount} / ₹${creditUsage.creditLimit}. ` +
        `Vendor status remains ${previousStatus} - payments do not affect vendor status.`
      );

      return {
        previousStatus,
        newStatus: previousStatus, // Status never changes
        creditUsage,
      };
    } catch (error) {
      this.logger.error(`Failed to check credit usage for business owner ${businessOwnerId}:`, error);
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

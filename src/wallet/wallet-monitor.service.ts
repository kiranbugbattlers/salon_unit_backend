import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Wallet, WalletUserType, BusinessOwner, Admin } from '../database/entities';
import { NotificationService } from '../common/services/notification.service';

@Injectable()
export class WalletMonitorService {
  private readonly logger = new Logger(WalletMonitorService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @Inject('EmailNotificationService')
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Check for business owners with negative wallet balances
   * Runs daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async checkNegativeBalances(): Promise<void> {
    this.logger.log('🔍 Starting daily wallet balance check for defaulters...');

    try {
      // Find all business owner wallets with negative balance
      const negativeWallets = await this.walletRepository.find({
        where: {
          userType: WalletUserType.BUSINESS_OWNER,
          balance: LessThan(0),
          isActive: true,
        },
      });

      this.logger.log(`Found ${negativeWallets.length} business owner wallets with negative balance`);

      // Get admins for notification
      const admins = await this.adminRepository.find({ where: { isActive: true } });
      const adminEmails = admins.filter((admin) => admin.email).map((admin) => admin.email);

      if (adminEmails.length === 0) {
        this.logger.warn('No active admins with email found for notifications');
      }

      let notifiedCount = 0;

      for (const wallet of negativeWallets) {
        // Find the business owner
        const businessOwner = await this.businessOwnerRepository.findOne({
          where: { userId: wallet.userId },
        });

        if (!businessOwner) {
          this.logger.warn(`Business owner not found for wallet ${wallet.id} (userId: ${wallet.userId})`);
          continue;
        }

        const creditLimit = Number(businessOwner.creditLimit || 0);
        const balance = Number(wallet.balance);

        // Check if balance exceeds credit limit (balance is negative, so we check if balance < -creditLimit)
        // e.g. Balance -1000, Limit 500. -1000 < -500 is true.
        if (balance < -creditLimit) {
           this.logger.warn(
            `⚠️ Business owner exceeded credit limit: ${businessOwner.businessName} (${businessOwner.shopId}) | ` +
              `Balance: ₹${balance} | Limit: ₹${creditLimit}`,
          );

          // Notify Admins
          // We do NOT mark as defaulter automatically ("no change will occur")
          // Just notify admin
          
          for (const email of adminEmails) {
            await this.notificationService.sendEmailNotification({
              to: email,
              subject: `Credit Limit Exceeded: ${businessOwner.businessName}`,
              body: `
                Hello Admin,

                The following business owner has exceeded their credit limit:

                Business Name: ${businessOwner.businessName}
                Shop ID: ${businessOwner.shopId}
                Current Balance: ₹${balance}
                Credit Limit: ₹${creditLimit}
                
                Please review their account.
              `,
            });
          }
          notifiedCount++;
        }
      }

      this.logger.log(
        `✅ Wallet balance check completed. ` +
          `Notified admins for ${notifiedCount} business owners exceeding limit.`,
      );
    } catch (error) {
      this.logger.error(`Failed to check wallet balances: ${error.message}`, error.stack);
    }
  }

  /**
   * Manual method to check credit limit breaches
   * Can be called via admin API
   */
  async checkCreditLimitBreaches(): Promise<{
    notifiedCount: number;
    totalNegativeWallets: number;
  }> {
    this.logger.log('🔍 Manual credit limit check initiated...');

    const negativeWallets = await this.walletRepository.find({
      where: {
        userType: WalletUserType.BUSINESS_OWNER,
        balance: LessThan(0),
        isActive: true,
      },
    });

    // Get admins for notification
    const admins = await this.adminRepository.find({ where: { isActive: true } });
    const adminEmails = admins.filter((admin) => admin.email).map((admin) => admin.email);

    let notifiedCount = 0;

    for (const wallet of negativeWallets) {
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { userId: wallet.userId },
      });

      if (!businessOwner) {
        continue;
      }

      const creditLimit = Number(businessOwner.creditLimit || 0);
      const balance = Number(wallet.balance);

      // Check if balance exceeds credit limit
      if (balance < -creditLimit) {
        // Notify Admins
        for (const email of adminEmails) {
          await this.notificationService.sendEmailNotification({
            to: email,
            subject: `Credit Limit Exceeded (Manual Check): ${businessOwner.businessName}`,
            body: `
              Hello Admin,

              The following business owner has exceeded their credit limit (detected via manual check):

              Business Name: ${businessOwner.businessName}
              Shop ID: ${businessOwner.shopId}
              Current Balance: ₹${balance}
              Credit Limit: ₹${creditLimit}
              
              Please review their account.
            `,
          });
        }
        notifiedCount++;
      }
    }

    return {
      notifiedCount,
      totalNegativeWallets: negativeWallets.length,
    };
  }

  /**
   * Get summary of defaulters
   */
  async getDefaultersSummary(): Promise<{
    totalDefaulters: number;
    totalNegativeBalance: number;
    defaulters: Array<{
      businessOwnerId: string;
      shopId: string;
      businessName: string;
      walletBalance: number;
      defaulterSince: Date;
    }>;
  }> {
    const defaulters = await this.businessOwnerRepository.find({
      where: { isDefaulter: true },
      order: { defaulterSince: 'DESC' },
    });

    let totalNegativeBalance = 0;
    const defaulterDetails = [];

    for (const businessOwner of defaulters) {
      const wallet = await this.walletRepository.findOne({
        where: {
          userId: businessOwner.userId,
          userType: WalletUserType.BUSINESS_OWNER,
        },
      });

      if (wallet) {
        totalNegativeBalance += Number(wallet.balance);
        defaulterDetails.push({
          businessOwnerId: businessOwner.id,
          shopId: businessOwner.shopId,
          businessName: businessOwner.businessName,
          walletBalance: Number(wallet.balance),
          defaulterSince: businessOwner.defaulterSince,
        });
      }
    }

    return {
      totalDefaulters: defaulters.length,
      totalNegativeBalance,
      defaulters: defaulterDetails,
    };
  }
}

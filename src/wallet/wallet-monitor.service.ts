import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Wallet, WalletUserType, BusinessOwner } from '../database/entities';

@Injectable()
export class WalletMonitorService {
  private readonly logger = new Logger(WalletMonitorService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
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

      let markedCount = 0;
      let alreadyMarkedCount = 0;

      for (const wallet of negativeWallets) {
        // Find the business owner
        const businessOwner = await this.businessOwnerRepository.findOne({
          where: { userId: wallet.userId },
        });

        if (!businessOwner) {
          this.logger.warn(`Business owner not found for wallet ${wallet.id} (userId: ${wallet.userId})`);
          continue;
        }

        // If not already marked as defaulter, mark them
        if (!businessOwner.isDefaulter) {
          businessOwner.isDefaulter = true;
          businessOwner.defaulterSince = new Date();
          await this.businessOwnerRepository.save(businessOwner);

          this.logger.warn(
            `⚠️ Marked business owner as DEFAULTER: ${businessOwner.businessName} (${businessOwner.shopId}) | ` +
              `Wallet balance: ₹${wallet.balance}`,
          );
          markedCount++;
        } else {
          alreadyMarkedCount++;
        }
      }

      this.logger.log(
        `✅ Wallet balance check completed. ` +
          `Newly marked as defaulters: ${markedCount}, Already marked: ${alreadyMarkedCount}`,
      );
    } catch (error) {
      this.logger.error(`Failed to check wallet balances: ${error.message}`, error.stack);
    }
  }

  /**
   * Manual method to check and mark defaulters
   * Can be called via admin API
   */
  async checkAndMarkDefaulters(): Promise<{
    newDefaulters: number;
    alreadyDefaulters: number;
    totalNegativeWallets: number;
  }> {
    this.logger.log('🔍 Manual wallet balance check initiated...');

    const negativeWallets = await this.walletRepository.find({
      where: {
        userType: WalletUserType.BUSINESS_OWNER,
        balance: LessThan(0),
        isActive: true,
      },
    });

    let newDefaulters = 0;
    let alreadyDefaulters = 0;

    for (const wallet of negativeWallets) {
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { userId: wallet.userId },
      });

      if (!businessOwner) {
        continue;
      }

      if (!businessOwner.isDefaulter) {
        businessOwner.isDefaulter = true;
        businessOwner.defaulterSince = new Date();
        await this.businessOwnerRepository.save(businessOwner);
        newDefaulters++;
      } else {
        alreadyDefaulters++;
      }
    }

    return {
      newDefaulters,
      alreadyDefaulters,
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

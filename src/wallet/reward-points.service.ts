import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import {
  CustomerRewardPoints,
  RewardTier,
  Wallet,
  WalletUserType,
  WalletTransactionCategory,
} from '../database/entities';
import { WalletService } from './wallet.service';

@Injectable()
export class RewardPointsService {
  private readonly logger = new Logger(RewardPointsService.name);

  // Tier thresholds
  private readonly TIER_THRESHOLDS = {
    [RewardTier.BRONZE]: 0,
    [RewardTier.SILVER]: 10,
    [RewardTier.GOLD]: 25,
    [RewardTier.PLATINUM]: 50,
  };

  // Points expiry: 365 days
  private readonly POINTS_EXPIRY_DAYS = 365;

  constructor(
    @InjectRepository(CustomerRewardPoints)
    private readonly rewardPointsRepository: Repository<CustomerRewardPoints>,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get or create reward points record for customer
   */
  async getOrCreateRewardPoints(customerId: string): Promise<CustomerRewardPoints> {
    let rewardPoints = await this.rewardPointsRepository.findOne({
      where: { customerId },
      relations: ['customer'],
    });

    if (!rewardPoints) {
      rewardPoints = this.rewardPointsRepository.create({
        customerId,
        totalPoints: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        expiringPoints: 0,
        tier: RewardTier.BRONZE,
        totalBookings: 0,
      });
      rewardPoints = await this.rewardPointsRepository.save(rewardPoints);
      this.logger.log(`Created reward points record for customer ${customerId}`);
    }

    return rewardPoints;
  }

  /**
   * Get customer reward points
   */
  async getRewardPoints(customerId: string): Promise<CustomerRewardPoints> {
    const rewardPoints = await this.rewardPointsRepository.findOne({
      where: { customerId },
      relations: ['customer'],
    });

    if (!rewardPoints) {
      throw new NotFoundException(`Reward points not found for customer ${customerId}`);
    }

    return rewardPoints;
  }

  /**
   * Redeem reward points (convert to wallet balance)
   * 1 point = 1 INR
   */
  async redeemPoints(customerId: string, pointsToRedeem: number): Promise<{
    rewardPoints: CustomerRewardPoints;
    walletBalance: number;
  }> {
    if (pointsToRedeem <= 0) {
      throw new BadRequestException('Points to redeem must be positive');
    }

    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      const rewardPoints = await transactionalEntityManager.findOne(CustomerRewardPoints, {
        where: { customerId },
      });

      if (!rewardPoints) {
        throw new NotFoundException(`Reward points not found for customer ${customerId}`);
      }

      const availablePoints = Number(rewardPoints.totalPoints);

      if (pointsToRedeem > availablePoints) {
        throw new BadRequestException(
          `Insufficient reward points. Available: ${availablePoints}, Requested: ${pointsToRedeem}`,
        );
      }

      // Get customer with user relation
      const customer = await transactionalEntityManager.findOne('Customer', {
        where: { id: customerId },
        relations: ['user'],
      }) as any;

      if (!customer || !customer.user) {
        throw new NotFoundException(`Customer not found with ID: ${customerId}`);
      }

      // Get or create customer wallet
      const wallet = await this.walletService.getOrCreateWallet(customer.user.id, WalletUserType.CUSTOMER);

      // Credit wallet with redeemed points (1 point = 1 INR)
      await this.walletService.credit(
        wallet.id,
        WalletTransactionCategory.REWARD_POINTS,
        pointsToRedeem,
        `Redeemed ${pointsToRedeem} reward points`,
        {
          additionalData: {
            customerId,
            pointsRedeemed: pointsToRedeem,
          },
        },
      );

      // Update reward points
      rewardPoints.totalPoints = availablePoints - pointsToRedeem;
      rewardPoints.totalRedeemed = Number(rewardPoints.totalRedeemed) + pointsToRedeem;
      rewardPoints.lastRedeemedAt = new Date();

      await transactionalEntityManager.save(CustomerRewardPoints, rewardPoints);

      const updatedWallet = await this.walletService.getWalletById(wallet.id);

      this.logger.log(
        `Customer ${customerId} redeemed ${pointsToRedeem} points. New balance: ${rewardPoints.totalPoints} points`,
      );

      return {
        rewardPoints,
        walletBalance: Number(updatedWallet.balance),
      };
    });
  }

  /**
   * Get tier benefits description
   */
  getTierBenefits(tier: RewardTier): {
    tier: RewardTier;
    minBookings: number;
    benefits: string[];
  } {
    const benefits = {
      [RewardTier.BRONZE]: {
        tier: RewardTier.BRONZE,
        minBookings: 0,
        benefits: ['Earn reward points on bookings', 'Basic customer support'],
      },
      [RewardTier.SILVER]: {
        tier: RewardTier.SILVER,
        minBookings: 10,
        benefits: [
          'Earn 1.5x reward points on bookings',
          'Priority customer support',
          'Exclusive monthly offers',
        ],
      },
      [RewardTier.GOLD]: {
        tier: RewardTier.GOLD,
        minBookings: 25,
        benefits: [
          'Earn 2x reward points on bookings',
          'VIP customer support',
          'Early access to new services',
          'Birthday special offers',
        ],
      },
      [RewardTier.PLATINUM]: {
        tier: RewardTier.PLATINUM,
        minBookings: 50,
        benefits: [
          'Earn 3x reward points on bookings',
          'Dedicated account manager',
          'Complimentary service upgrades',
          'Exclusive platinum-only events',
          'Lifetime validity of points',
        ],
      },
    };

    return benefits[tier];
  }

  /**
   * Calculate tier multiplier for reward points
   */
  getTierMultiplier(tier: RewardTier): number {
    const multipliers = {
      [RewardTier.BRONZE]: 1,
      [RewardTier.SILVER]: 1.5,
      [RewardTier.GOLD]: 2,
      [RewardTier.PLATINUM]: 3,
    };

    return multipliers[tier];
  }

  /**
   * Get customer tier progress
   */
  async getTierProgress(customerId: string): Promise<{
    currentTier: RewardTier;
    totalBookings: number;
    nextTier: RewardTier | null;
    bookingsToNextTier: number;
    progress: number;
  }> {
    const rewardPoints = await this.getRewardPoints(customerId);
    const currentTier = rewardPoints.tier;
    const totalBookings = rewardPoints.totalBookings;

    let nextTier: RewardTier | null = null;
    let bookingsToNextTier = 0;
    let progress = 0;

    const tiers = [RewardTier.BRONZE, RewardTier.SILVER, RewardTier.GOLD, RewardTier.PLATINUM];
    const currentTierIndex = tiers.indexOf(currentTier);

    if (currentTierIndex < tiers.length - 1) {
      nextTier = tiers[currentTierIndex + 1];
      const nextTierThreshold = this.TIER_THRESHOLDS[nextTier];
      bookingsToNextTier = Math.max(0, nextTierThreshold - totalBookings);

      const currentTierThreshold = this.TIER_THRESHOLDS[currentTier];
      const bookingsInCurrentTier = totalBookings - currentTierThreshold;
      const bookingsNeededForNextTier = nextTierThreshold - currentTierThreshold;
      progress = Math.min(100, (bookingsInCurrentTier / bookingsNeededForNextTier) * 100);
    } else {
      progress = 100;
    }

    return {
      currentTier,
      totalBookings,
      nextTier,
      bookingsToNextTier,
      progress: Math.round(progress),
    };
  }

  /**
   * Expire old reward points (run daily via cron)
   */
  async expireOldPoints(): Promise<void> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - this.POINTS_EXPIRY_DAYS);

    // Find customers with points expiring
    // Note: This requires tracking point earning dates individually
    // For now, we'll implement a simple check
    this.logger.log(`Checking for expired reward points older than ${this.POINTS_EXPIRY_DAYS} days`);

    // In production, you would:
    // 1. Track individual point transactions with earning dates
    // 2. Expire points FIFO (First In, First Out)
    // 3. Send notifications to customers before points expire
    // 4. Update expiringPoints and nextExpiryDate fields

    // Placeholder for now
    this.logger.log('Point expiry check completed');
  }

  /**
   * Calculate expiring points for customers
   */
  async calculateExpiringPoints(): Promise<void> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Update expiring points for customers
    // This requires individual point transaction tracking
    // Placeholder implementation

    this.logger.log('Calculated expiring points for all customers');
  }

  /**
   * Get reward points history (would require a separate reward_points_history table)
   */
  async getPointsHistory(
    customerId: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ): Promise<{
    totalPoints: number;
    history: any[];
  }> {
    const rewardPoints = await this.getRewardPoints(customerId);

    // In production, query from reward_points_history table
    // For now, return summary
    return {
      totalPoints: Number(rewardPoints.totalPoints),
      history: [],
    };
  }

  /**
   * Get leaderboard (top customers by points)
   */
  async getLeaderboard(limit: number = 10): Promise<CustomerRewardPoints[]> {
    return await this.rewardPointsRepository.find({
      order: {
        totalEarned: 'DESC',
      },
      take: limit,
      relations: ['customer', 'customer.user'],
    });
  }

  /**
   * Get comprehensive customer wallet overview
   * Combines wallet stats, reward points, and tier progress in a single call
   */
  async getCustomerWalletOverview(customerId: string, userId: string): Promise<{
    wallet: {
      balance: number;
      totalEarned: number;
      totalSpent: number;
      totalCommissionReceived: number;
      transactionCount: number;
      lastTransactionAt: Date | null;
    };
    rewardPoints: {
      totalPoints: number;
      totalEarned: number;
      totalRedeemed: number;
      tier: string;
      totalBookings: number;
      expiringPoints: number;
      nextExpiryDate: Date | null;
      lastEarnedAt: Date | null;
      lastRedeemedAt: Date | null;
    };
    tierProgress: {
      currentTier: string;
      totalBookings: number;
      nextTier: string | null;
      bookingsToNextTier: number;
      progress: number;
    };
  }> {
    // Get wallet stats
    const wallet = await this.walletService.getOrCreateWallet(userId, WalletUserType.CUSTOMER);
    const walletStats = await this.walletService.getWalletStats(wallet.id);

    // Get reward points
    const rewardPoints = await this.getOrCreateRewardPoints(customerId);

    // Get tier progress
    const tierProgress = await this.getTierProgress(customerId);

    return {
      wallet: {
        balance: walletStats.balance,
        totalEarned: walletStats.totalEarned,
        totalSpent: walletStats.totalSpent,
        totalCommissionReceived: walletStats.totalCommissionReceived,
        transactionCount: walletStats.transactionCount,
        lastTransactionAt: walletStats.lastTransactionAt,
      },
      rewardPoints: {
        totalPoints: Number(rewardPoints.totalPoints),
        totalEarned: Number(rewardPoints.totalEarned),
        totalRedeemed: Number(rewardPoints.totalRedeemed),
        tier: rewardPoints.tier,
        totalBookings: rewardPoints.totalBookings,
        expiringPoints: Number(rewardPoints.expiringPoints),
        nextExpiryDate: rewardPoints.nextExpiryDate || null,
        lastEarnedAt: rewardPoints.lastEarnedAt || null,
        lastRedeemedAt: rewardPoints.lastRedeemedAt || null,
      },
      tierProgress: {
        currentTier: tierProgress.currentTier,
        totalBookings: tierProgress.totalBookings,
        nextTier: tierProgress.nextTier,
        bookingsToNextTier: tierProgress.bookingsToNextTier,
        progress: tierProgress.progress,
      },
    };
  }
}

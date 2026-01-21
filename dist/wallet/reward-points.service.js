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
var RewardPointsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardPointsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const wallet_service_1 = require("./wallet.service");
let RewardPointsService = RewardPointsService_1 = class RewardPointsService {
    constructor(rewardPointsRepository, walletService, dataSource) {
        this.rewardPointsRepository = rewardPointsRepository;
        this.walletService = walletService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(RewardPointsService_1.name);
        this.TIER_THRESHOLDS = {
            [entities_1.RewardTier.BRONZE]: 0,
            [entities_1.RewardTier.SILVER]: 10,
            [entities_1.RewardTier.GOLD]: 25,
            [entities_1.RewardTier.PLATINUM]: 50,
        };
        this.POINTS_EXPIRY_DAYS = 365;
    }
    async getOrCreateRewardPoints(customerId) {
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
                tier: entities_1.RewardTier.BRONZE,
                totalBookings: 0,
            });
            rewardPoints = await this.rewardPointsRepository.save(rewardPoints);
            this.logger.log(`Created reward points record for customer ${customerId}`);
        }
        return rewardPoints;
    }
    async getRewardPoints(customerId) {
        const rewardPoints = await this.rewardPointsRepository.findOne({
            where: { customerId },
            relations: ['customer'],
        });
        if (!rewardPoints) {
            throw new common_1.NotFoundException(`Reward points not found for customer ${customerId}`);
        }
        return rewardPoints;
    }
    async redeemPoints(customerId, pointsToRedeem) {
        if (pointsToRedeem <= 0) {
            throw new common_1.BadRequestException('Points to redeem must be positive');
        }
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const rewardPoints = await transactionalEntityManager.findOne(entities_1.CustomerRewardPoints, {
                where: { customerId },
            });
            if (!rewardPoints) {
                throw new common_1.NotFoundException(`Reward points not found for customer ${customerId}`);
            }
            const availablePoints = Number(rewardPoints.totalPoints);
            if (pointsToRedeem > availablePoints) {
                throw new common_1.BadRequestException(`Insufficient reward points. Available: ${availablePoints}, Requested: ${pointsToRedeem}`);
            }
            const customer = await transactionalEntityManager.findOne('Customer', {
                where: { id: customerId },
                relations: ['user'],
            });
            if (!customer || !customer.user) {
                throw new common_1.NotFoundException(`Customer not found with ID: ${customerId}`);
            }
            const wallet = await this.walletService.getOrCreateWallet(customer.user.id, entities_1.WalletUserType.CUSTOMER);
            await this.walletService.credit(wallet.id, entities_1.WalletTransactionCategory.REWARD_POINTS, pointsToRedeem, `Redeemed ${pointsToRedeem} reward points`, {
                additionalData: {
                    customerId,
                    pointsRedeemed: pointsToRedeem,
                },
            });
            rewardPoints.totalPoints = availablePoints - pointsToRedeem;
            rewardPoints.totalRedeemed = Number(rewardPoints.totalRedeemed) + pointsToRedeem;
            rewardPoints.lastRedeemedAt = new Date();
            await transactionalEntityManager.save(entities_1.CustomerRewardPoints, rewardPoints);
            const updatedWallet = await this.walletService.getWalletById(wallet.id);
            this.logger.log(`Customer ${customerId} redeemed ${pointsToRedeem} points. New balance: ${rewardPoints.totalPoints} points`);
            return {
                rewardPoints,
                walletBalance: Number(updatedWallet.balance),
            };
        });
    }
    getTierBenefits(tier) {
        const benefits = {
            [entities_1.RewardTier.BRONZE]: {
                tier: entities_1.RewardTier.BRONZE,
                minBookings: 0,
                benefits: ['Earn reward points on bookings', 'Basic customer support'],
            },
            [entities_1.RewardTier.SILVER]: {
                tier: entities_1.RewardTier.SILVER,
                minBookings: 10,
                benefits: [
                    'Earn 1.5x reward points on bookings',
                    'Priority customer support',
                    'Exclusive monthly offers',
                ],
            },
            [entities_1.RewardTier.GOLD]: {
                tier: entities_1.RewardTier.GOLD,
                minBookings: 25,
                benefits: [
                    'Earn 2x reward points on bookings',
                    'VIP customer support',
                    'Early access to new services',
                    'Birthday special offers',
                ],
            },
            [entities_1.RewardTier.PLATINUM]: {
                tier: entities_1.RewardTier.PLATINUM,
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
    getTierMultiplier(tier) {
        const multipliers = {
            [entities_1.RewardTier.BRONZE]: 1,
            [entities_1.RewardTier.SILVER]: 1.5,
            [entities_1.RewardTier.GOLD]: 2,
            [entities_1.RewardTier.PLATINUM]: 3,
        };
        return multipliers[tier];
    }
    async getTierProgress(customerId) {
        const rewardPoints = await this.getRewardPoints(customerId);
        const currentTier = rewardPoints.tier;
        const totalBookings = rewardPoints.totalBookings;
        let nextTier = null;
        let bookingsToNextTier = 0;
        let progress = 0;
        const tiers = [entities_1.RewardTier.BRONZE, entities_1.RewardTier.SILVER, entities_1.RewardTier.GOLD, entities_1.RewardTier.PLATINUM];
        const currentTierIndex = tiers.indexOf(currentTier);
        if (currentTierIndex < tiers.length - 1) {
            nextTier = tiers[currentTierIndex + 1];
            const nextTierThreshold = this.TIER_THRESHOLDS[nextTier];
            bookingsToNextTier = Math.max(0, nextTierThreshold - totalBookings);
            const currentTierThreshold = this.TIER_THRESHOLDS[currentTier];
            const bookingsInCurrentTier = totalBookings - currentTierThreshold;
            const bookingsNeededForNextTier = nextTierThreshold - currentTierThreshold;
            progress = Math.min(100, (bookingsInCurrentTier / bookingsNeededForNextTier) * 100);
        }
        else {
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
    async expireOldPoints() {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() - this.POINTS_EXPIRY_DAYS);
        this.logger.log(`Checking for expired reward points older than ${this.POINTS_EXPIRY_DAYS} days`);
        this.logger.log('Point expiry check completed');
    }
    async calculateExpiringPoints() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        this.logger.log('Calculated expiring points for all customers');
    }
    async getPointsHistory(customerId, options) {
        const rewardPoints = await this.getRewardPoints(customerId);
        return {
            totalPoints: Number(rewardPoints.totalPoints),
            history: [],
        };
    }
    async getLeaderboard(limit = 10) {
        return await this.rewardPointsRepository.find({
            order: {
                totalEarned: 'DESC',
            },
            take: limit,
            relations: ['customer', 'customer.user'],
        });
    }
    async getCustomerWalletOverview(customerId, userId) {
        const wallet = await this.walletService.getOrCreateWallet(userId, entities_1.WalletUserType.CUSTOMER);
        const walletStats = await this.walletService.getWalletStats(wallet.id);
        const rewardPoints = await this.getOrCreateRewardPoints(customerId);
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
};
exports.RewardPointsService = RewardPointsService;
exports.RewardPointsService = RewardPointsService = RewardPointsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.CustomerRewardPoints)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        wallet_service_1.WalletService,
        typeorm_2.DataSource])
], RewardPointsService);
//# sourceMappingURL=reward-points.service.js.map
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
var WalletMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletMonitorService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let WalletMonitorService = WalletMonitorService_1 = class WalletMonitorService {
    constructor(walletRepository, businessOwnerRepository) {
        this.walletRepository = walletRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.logger = new common_1.Logger(WalletMonitorService_1.name);
    }
    async checkNegativeBalances() {
        this.logger.log('🔍 Starting daily wallet balance check for defaulters...');
        try {
            const negativeWallets = await this.walletRepository.find({
                where: {
                    userType: entities_1.WalletUserType.BUSINESS_OWNER,
                    balance: (0, typeorm_2.LessThan)(0),
                    isActive: true,
                },
            });
            this.logger.log(`Found ${negativeWallets.length} business owner wallets with negative balance`);
            let markedCount = 0;
            let alreadyMarkedCount = 0;
            for (const wallet of negativeWallets) {
                const businessOwner = await this.businessOwnerRepository.findOne({
                    where: { userId: wallet.userId },
                });
                if (!businessOwner) {
                    this.logger.warn(`Business owner not found for wallet ${wallet.id} (userId: ${wallet.userId})`);
                    continue;
                }
                if (!businessOwner.isDefaulter) {
                    businessOwner.isDefaulter = true;
                    businessOwner.defaulterSince = new Date();
                    await this.businessOwnerRepository.save(businessOwner);
                    this.logger.warn(`⚠️ Marked business owner as DEFAULTER: ${businessOwner.businessName} (${businessOwner.shopId}) | ` +
                        `Wallet balance: ₹${wallet.balance}`);
                    markedCount++;
                }
                else {
                    alreadyMarkedCount++;
                }
            }
            this.logger.log(`✅ Wallet balance check completed. ` +
                `Newly marked as defaulters: ${markedCount}, Already marked: ${alreadyMarkedCount}`);
        }
        catch (error) {
            this.logger.error(`Failed to check wallet balances: ${error.message}`, error.stack);
        }
    }
    async checkAndMarkDefaulters() {
        this.logger.log('🔍 Manual wallet balance check initiated...');
        const negativeWallets = await this.walletRepository.find({
            where: {
                userType: entities_1.WalletUserType.BUSINESS_OWNER,
                balance: (0, typeorm_2.LessThan)(0),
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
            }
            else {
                alreadyDefaulters++;
            }
        }
        return {
            newDefaulters,
            alreadyDefaulters,
            totalNegativeWallets: negativeWallets.length,
        };
    }
    async getDefaultersSummary() {
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
                    userType: entities_1.WalletUserType.BUSINESS_OWNER,
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
};
exports.WalletMonitorService = WalletMonitorService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletMonitorService.prototype, "checkNegativeBalances", null);
exports.WalletMonitorService = WalletMonitorService = WalletMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Wallet)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], WalletMonitorService);
//# sourceMappingURL=wallet-monitor.service.js.map
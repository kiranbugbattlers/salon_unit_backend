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
const notification_service_1 = require("../common/services/notification.service");
let WalletMonitorService = WalletMonitorService_1 = class WalletMonitorService {
    constructor(walletRepository, businessOwnerRepository, adminRepository, notificationService) {
        this.walletRepository = walletRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.adminRepository = adminRepository;
        this.notificationService = notificationService;
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
            const admins = await this.adminRepository.find({ where: { isActive: true } });
            const adminEmails = admins.filter((admin) => admin.email).map((admin) => admin.email);
            if (adminEmails.length === 0) {
                this.logger.warn('No active admins with email found for notifications');
            }
            let notifiedCount = 0;
            for (const wallet of negativeWallets) {
                const businessOwner = await this.businessOwnerRepository.findOne({
                    where: { userId: wallet.userId },
                });
                if (!businessOwner) {
                    this.logger.warn(`Business owner not found for wallet ${wallet.id} (userId: ${wallet.userId})`);
                    continue;
                }
                const creditLimit = Number(businessOwner.creditLimit || 0);
                const balance = Number(wallet.balance);
                if (balance < -creditLimit) {
                    this.logger.warn(`⚠️ Business owner exceeded credit limit: ${businessOwner.businessName} (${businessOwner.shopId}) | ` +
                        `Balance: ₹${balance} | Limit: ₹${creditLimit}`);
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
            this.logger.log(`✅ Wallet balance check completed. ` +
                `Notified admins for ${notifiedCount} business owners exceeding limit.`);
        }
        catch (error) {
            this.logger.error(`Failed to check wallet balances: ${error.message}`, error.stack);
        }
    }
    async checkCreditLimitBreaches() {
        this.logger.log('🔍 Manual credit limit check initiated...');
        const negativeWallets = await this.walletRepository.find({
            where: {
                userType: entities_1.WalletUserType.BUSINESS_OWNER,
                balance: (0, typeorm_2.LessThan)(0),
                isActive: true,
            },
        });
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
            if (balance < -creditLimit) {
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
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Admin)),
    __param(3, (0, common_1.Inject)('EmailNotificationService')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], WalletMonitorService);
//# sourceMappingURL=wallet-monitor.service.js.map
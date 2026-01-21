"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities = __importStar(require("./entities"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let SeederService = class SeederService {
    constructor(userRepository, userRoleRepository, customerRepository, customerFavoriteRepository, userAddressRepository, customerOnboardingRepository, businessOwnerRepository, businessOwnerOnboardingRepository, businessAddressRepository, businessMediaRepository, businessOperatingHoursRepository, businessServiceRepository, servicePackageRepository, servicePackageItemRepository, refreshTokenRepository, otpTokenRepository, adminRepository, agentRepository, businessApprovalRepository, subscriptionPlanRepository, businessSubscriptionRepository, subscriptionTransactionRepository, staffRepository, serviceCategoryRepository, serviceRepository, staffServiceRepository, staffScheduleOverrideRepository, staffBreakRepository, staffWorkingHoursRepository, bookingRepository, bookingRequestRepository, bookingRequestServiceRepository, bookingServiceRepository, reviewRepository, businessSettingsRepository, paymentRepository, advertisementRepository, supportMemberRepository, customerSupportMappingRepository, walletRepository, walletTransactionRepository, commissionConfigRepository, commissionTransactionRepository, monthlySettlementRepository, settlementTransactionRepository, codTransactionRepository, customerRewardPointsRepository, bankingInfoRepository, idempotencyKeyRepository, adminActionAuditRepository, commissionPaymentRepository, deviceTokenRepository, notificationLogRepository, scheduledNotificationRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.customerRepository = customerRepository;
        this.customerFavoriteRepository = customerFavoriteRepository;
        this.userAddressRepository = userAddressRepository;
        this.customerOnboardingRepository = customerOnboardingRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.businessOwnerOnboardingRepository = businessOwnerOnboardingRepository;
        this.businessAddressRepository = businessAddressRepository;
        this.businessMediaRepository = businessMediaRepository;
        this.businessOperatingHoursRepository = businessOperatingHoursRepository;
        this.businessServiceRepository = businessServiceRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.servicePackageItemRepository = servicePackageItemRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpTokenRepository = otpTokenRepository;
        this.adminRepository = adminRepository;
        this.agentRepository = agentRepository;
        this.businessApprovalRepository = businessApprovalRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.businessSubscriptionRepository = businessSubscriptionRepository;
        this.subscriptionTransactionRepository = subscriptionTransactionRepository;
        this.staffRepository = staffRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.serviceRepository = serviceRepository;
        this.staffServiceRepository = staffServiceRepository;
        this.staffScheduleOverrideRepository = staffScheduleOverrideRepository;
        this.staffBreakRepository = staffBreakRepository;
        this.staffWorkingHoursRepository = staffWorkingHoursRepository;
        this.bookingRepository = bookingRepository;
        this.bookingRequestRepository = bookingRequestRepository;
        this.bookingRequestServiceRepository = bookingRequestServiceRepository;
        this.bookingServiceRepository = bookingServiceRepository;
        this.reviewRepository = reviewRepository;
        this.businessSettingsRepository = businessSettingsRepository;
        this.paymentRepository = paymentRepository;
        this.advertisementRepository = advertisementRepository;
        this.supportMemberRepository = supportMemberRepository;
        this.customerSupportMappingRepository = customerSupportMappingRepository;
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.commissionConfigRepository = commissionConfigRepository;
        this.commissionTransactionRepository = commissionTransactionRepository;
        this.monthlySettlementRepository = monthlySettlementRepository;
        this.settlementTransactionRepository = settlementTransactionRepository;
        this.codTransactionRepository = codTransactionRepository;
        this.customerRewardPointsRepository = customerRewardPointsRepository;
        this.bankingInfoRepository = bankingInfoRepository;
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.adminActionAuditRepository = adminActionAuditRepository;
        this.commissionPaymentRepository = commissionPaymentRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.notificationLogRepository = notificationLogRepository;
        this.scheduledNotificationRepository = scheduledNotificationRepository;
    }
    async seedFromJSON(filePath) {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (data.users) {
                await this.userRepository.save(data.users);
                console.log(`✅ Imported ${data.users.length} users`);
            }
            if (data.userRoles) {
                await this.userRoleRepository.save(data.userRoles);
                console.log(`✅ Imported ${data.userRoles.length} user roles`);
            }
            if (data.customers) {
                await this.customerRepository.save(data.customers);
                console.log(`✅ Imported ${data.customers.length} customers`);
            }
            if (data.customerFavorites) {
                await this.customerFavoriteRepository.save(data.customerFavorites);
                console.log(`✅ Imported ${data.customerFavorites.length} customer favorites`);
            }
            if (data.userAddresses) {
                await this.userAddressRepository.save(data.userAddresses);
                console.log(`✅ Imported ${data.userAddresses.length} user addresses`);
            }
            if (data.customerOnboardings) {
                await this.customerOnboardingRepository.save(data.customerOnboardings);
                console.log(`✅ Imported ${data.customerOnboardings.length} customer onboardings`);
            }
            if (data.businessOwners) {
                await this.businessOwnerRepository.save(data.businessOwners);
                console.log(`✅ Imported ${data.businessOwners.length} business owners`);
            }
            if (data.businessOwnerOnboardings) {
                await this.businessOwnerOnboardingRepository.save(data.businessOwnerOnboardings);
                console.log(`✅ Imported ${data.businessOwnerOnboardings.length} business owner onboardings`);
            }
            if (data.businessAddresses) {
                await this.businessAddressRepository.save(data.businessAddresses);
                console.log(`✅ Imported ${data.businessAddresses.length} business addresses`);
            }
            if (data.businessMedia) {
                await this.businessMediaRepository.save(data.businessMedia);
                console.log(`✅ Imported ${data.businessMedia.length} business media`);
            }
            if (data.businessOperatingHours) {
                await this.businessOperatingHoursRepository.save(data.businessOperatingHours);
                console.log(`✅ Imported ${data.businessOperatingHours.length} business operating hours`);
            }
            if (data.businessServices) {
                await this.businessServiceRepository.save(data.businessServices);
                console.log(`✅ Imported ${data.businessServices.length} business services`);
            }
            if (data.servicePackages) {
                await this.servicePackageRepository.save(data.servicePackages);
                console.log(`✅ Imported ${data.servicePackages.length} service packages`);
            }
            if (data.servicePackageItems) {
                await this.servicePackageItemRepository.save(data.servicePackageItems);
                console.log(`✅ Imported ${data.servicePackageItems.length} service package items`);
            }
            if (data.refreshTokens) {
                await this.refreshTokenRepository.save(data.refreshTokens);
                console.log(`✅ Imported ${data.refreshTokens.length} refresh tokens`);
            }
            if (data.otpTokens) {
                await this.otpTokenRepository.save(data.otpTokens);
                console.log(`✅ Imported ${data.otpTokens.length} OTP tokens`);
            }
            if (data.admins) {
                await this.adminRepository.save(data.admins);
                console.log(`✅ Imported ${data.admins.length} admins`);
            }
            if (data.agents) {
                await this.agentRepository.save(data.agents);
                console.log(`✅ Imported ${data.agents.length} agents`);
            }
            if (data.businessApprovals) {
                await this.businessApprovalRepository.save(data.businessApprovals);
                console.log(`✅ Imported ${data.businessApprovals.length} business approvals`);
            }
            if (data.subscriptionPlans) {
                await this.subscriptionPlanRepository.save(data.subscriptionPlans);
                console.log(`✅ Imported ${data.subscriptionPlans.length} subscription plans`);
            }
            if (data.businessSubscriptions) {
                await this.businessSubscriptionRepository.save(data.businessSubscriptions);
                console.log(`✅ Imported ${data.businessSubscriptions.length} business subscriptions`);
            }
            if (data.subscriptionTransactions) {
                await this.subscriptionTransactionRepository.save(data.subscriptionTransactions);
                console.log(`✅ Imported ${data.subscriptionTransactions.length} subscription transactions`);
            }
            if (data.staff) {
                await this.staffRepository.save(data.staff);
                console.log(`✅ Imported ${data.staff.length} staff`);
            }
            if (data.serviceCategories) {
                await this.serviceCategoryRepository.save(data.serviceCategories);
                console.log(`✅ Imported ${data.serviceCategories.length} service categories`);
            }
            if (data.services) {
                await this.serviceRepository.save(data.services);
                console.log(`✅ Imported ${data.services.length} services`);
            }
            if (data.staffServices) {
                await this.staffServiceRepository.save(data.staffServices);
                console.log(`✅ Imported ${data.staffServices.length} staff services`);
            }
            if (data.staffScheduleOverrides) {
                await this.staffScheduleOverrideRepository.save(data.staffScheduleOverrides);
                console.log(`✅ Imported ${data.staffScheduleOverrides.length} staff schedule overrides`);
            }
            if (data.staffBreaks) {
                await this.staffBreakRepository.save(data.staffBreaks);
                console.log(`✅ Imported ${data.staffBreaks.length} staff breaks`);
            }
            if (data.staffWorkingHours) {
                await this.staffWorkingHoursRepository.save(data.staffWorkingHours);
                console.log(`✅ Imported ${data.staffWorkingHours.length} staff working hours`);
            }
            if (data.bookings) {
                await this.bookingRepository.save(data.bookings);
                console.log(`✅ Imported ${data.bookings.length} bookings`);
            }
            if (data.bookingRequests) {
                await this.bookingRequestRepository.save(data.bookingRequests);
                console.log(`✅ Imported ${data.bookingRequests.length} booking requests`);
            }
            if (data.bookingRequestServices) {
                await this.bookingRequestServiceRepository.save(data.bookingRequestServices);
                console.log(`✅ Imported ${data.bookingRequestServices.length} booking request services`);
            }
            if (data.bookingServices) {
                await this.bookingServiceRepository.save(data.bookingServices);
                console.log(`✅ Imported ${data.bookingServices.length} booking services`);
            }
            if (data.reviews) {
                await this.reviewRepository.save(data.reviews);
                console.log(`✅ Imported ${data.reviews.length} reviews`);
            }
            if (data.businessSettings) {
                await this.businessSettingsRepository.save(data.businessSettings);
                console.log(`✅ Imported ${data.businessSettings.length} business settings`);
            }
            if (data.payments) {
                await this.paymentRepository.save(data.payments);
                console.log(`✅ Imported ${data.payments.length} payments`);
            }
            if (data.advertisements) {
                await this.advertisementRepository.save(data.advertisements);
                console.log(`✅ Imported ${data.advertisements.length} advertisements`);
            }
            if (data.supportMembers) {
                await this.supportMemberRepository.save(data.supportMembers);
                console.log(`✅ Imported ${data.supportMembers.length} support members`);
            }
            if (data.customerSupportMappings) {
                await this.customerSupportMappingRepository.save(data.customerSupportMappings);
                console.log(`✅ Imported ${data.customerSupportMappings.length} customer support mappings`);
            }
            if (data.wallets) {
                await this.walletRepository.save(data.wallets);
                console.log(`✅ Imported ${data.wallets.length} wallets`);
            }
            if (data.walletTransactions) {
                await this.walletTransactionRepository.save(data.walletTransactions);
                console.log(`✅ Imported ${data.walletTransactions.length} wallet transactions`);
            }
            if (data.commissionConfigs) {
                await this.commissionConfigRepository.save(data.commissionConfigs);
                console.log(`✅ Imported ${data.commissionConfigs.length} commission configs`);
            }
            if (data.commissionTransactions) {
                await this.commissionTransactionRepository.save(data.commissionTransactions);
                console.log(`✅ Imported ${data.commissionTransactions.length} commission transactions`);
            }
            if (data.monthlySettlements) {
                await this.monthlySettlementRepository.save(data.monthlySettlements);
                console.log(`✅ Imported ${data.monthlySettlements.length} monthly settlements`);
            }
            if (data.settlementTransactions) {
                await this.settlementTransactionRepository.save(data.settlementTransactions);
                console.log(`✅ Imported ${data.settlementTransactions.length} settlement transactions`);
            }
            if (data.codTransactions) {
                await this.codTransactionRepository.save(data.codTransactions);
                console.log(`✅ Imported ${data.codTransactions.length} COD transactions`);
            }
            if (data.customerRewardPoints) {
                await this.customerRewardPointsRepository.save(data.customerRewardPoints);
                console.log(`✅ Imported ${data.customerRewardPoints.length} customer reward points`);
            }
            if (data.bankingInfo) {
                await this.bankingInfoRepository.save(data.bankingInfo);
                console.log(`✅ Imported ${data.bankingInfo.length} banking info`);
            }
            if (data.idempotencyKeys) {
                await this.idempotencyKeyRepository.save(data.idempotencyKeys);
                console.log(`✅ Imported ${data.idempotencyKeys.length} idempotency keys`);
            }
            if (data.adminActionAudits) {
                await this.adminActionAuditRepository.save(data.adminActionAudits);
                console.log(`✅ Imported ${data.adminActionAudits.length} admin action audits`);
            }
            if (data.commissionPayments) {
                await this.commissionPaymentRepository.save(data.commissionPayments);
                console.log(`✅ Imported ${data.commissionPayments.length} commission payments`);
            }
            if (data.deviceTokens) {
                await this.deviceTokenRepository.save(data.deviceTokens);
                console.log(`✅ Imported ${data.deviceTokens.length} device tokens`);
            }
            if (data.notificationLogs) {
                await this.notificationLogRepository.save(data.notificationLogs);
                console.log(`✅ Imported ${data.notificationLogs.length} notification logs`);
            }
            if (data.scheduledNotifications) {
                await this.scheduledNotificationRepository.save(data.scheduledNotifications);
                console.log(`✅ Imported ${data.scheduledNotifications.length} scheduled notifications`);
            }
        }
        catch (error) {
            console.error('❌ Seeding failed:', error);
            throw error;
        }
    }
    async importAllDataFiles() {
        const dataDir = path.join(process.cwd(), 'data');
        const files = fs.readdirSync(dataDir);
        const publicTableFiles = files.filter(file => file.startsWith('public_') && file.endsWith('.json'));
        console.log(`Found ${publicTableFiles.length} data files to import`);
        for (const file of publicTableFiles) {
            const filePath = path.join(dataDir, file);
            console.log(`\n📁 Processing: ${file}`);
            try {
                await this.seedFromJSON(filePath);
            }
            catch (error) {
                console.error(`❌ Failed to import ${file}:`, error.message);
            }
        }
        console.log('\n✅ All data import completed!');
    }
    async seedFromCSV(tableName, filePath) {
        try {
            const query = `
        COPY ${tableName} FROM '${filePath}' WITH CSV HEADER
      `;
            await this.userRepository.query(query);
            console.log(`✅ Imported data to ${tableName}`);
        }
        catch (error) {
            console.error('❌ CSV import failed:', error);
            throw error;
        }
    }
};
exports.SeederService = SeederService;
exports.SeederService = SeederService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities.UserRole)),
    __param(2, (0, typeorm_1.InjectRepository)(entities.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(entities.CustomerFavorite)),
    __param(4, (0, typeorm_1.InjectRepository)(entities.UserAddress)),
    __param(5, (0, typeorm_1.InjectRepository)(entities.CustomerOnboarding)),
    __param(6, (0, typeorm_1.InjectRepository)(entities.BusinessOwner)),
    __param(7, (0, typeorm_1.InjectRepository)(entities.BusinessOwnerOnboarding)),
    __param(8, (0, typeorm_1.InjectRepository)(entities.BusinessAddress)),
    __param(9, (0, typeorm_1.InjectRepository)(entities.BusinessMedia)),
    __param(10, (0, typeorm_1.InjectRepository)(entities.BusinessOperatingHours)),
    __param(11, (0, typeorm_1.InjectRepository)(entities.BusinessService)),
    __param(12, (0, typeorm_1.InjectRepository)(entities.ServicePackage)),
    __param(13, (0, typeorm_1.InjectRepository)(entities.ServicePackageItem)),
    __param(14, (0, typeorm_1.InjectRepository)(entities.RefreshToken)),
    __param(15, (0, typeorm_1.InjectRepository)(entities.OtpToken)),
    __param(16, (0, typeorm_1.InjectRepository)(entities.Admin)),
    __param(17, (0, typeorm_1.InjectRepository)(entities.Agent)),
    __param(18, (0, typeorm_1.InjectRepository)(entities.BusinessApproval)),
    __param(19, (0, typeorm_1.InjectRepository)(entities.SubscriptionPlan)),
    __param(20, (0, typeorm_1.InjectRepository)(entities.BusinessSubscription)),
    __param(21, (0, typeorm_1.InjectRepository)(entities.SubscriptionTransaction)),
    __param(22, (0, typeorm_1.InjectRepository)(entities.Staff)),
    __param(23, (0, typeorm_1.InjectRepository)(entities.ServiceCategory)),
    __param(24, (0, typeorm_1.InjectRepository)(entities.Service)),
    __param(25, (0, typeorm_1.InjectRepository)(entities.StaffService)),
    __param(26, (0, typeorm_1.InjectRepository)(entities.StaffScheduleOverride)),
    __param(27, (0, typeorm_1.InjectRepository)(entities.StaffBreak)),
    __param(28, (0, typeorm_1.InjectRepository)(entities.StaffWorkingHours)),
    __param(29, (0, typeorm_1.InjectRepository)(entities.Booking)),
    __param(30, (0, typeorm_1.InjectRepository)(entities.BookingRequest)),
    __param(31, (0, typeorm_1.InjectRepository)(entities.BookingRequestService)),
    __param(32, (0, typeorm_1.InjectRepository)(entities.BookingService)),
    __param(33, (0, typeorm_1.InjectRepository)(entities.Review)),
    __param(34, (0, typeorm_1.InjectRepository)(entities.BusinessSettings)),
    __param(35, (0, typeorm_1.InjectRepository)(entities.Payment)),
    __param(36, (0, typeorm_1.InjectRepository)(entities.Advertisement)),
    __param(37, (0, typeorm_1.InjectRepository)(entities.SupportMember)),
    __param(38, (0, typeorm_1.InjectRepository)(entities.CustomerSupportMapping)),
    __param(39, (0, typeorm_1.InjectRepository)(entities.Wallet)),
    __param(40, (0, typeorm_1.InjectRepository)(entities.WalletTransaction)),
    __param(41, (0, typeorm_1.InjectRepository)(entities.CommissionConfig)),
    __param(42, (0, typeorm_1.InjectRepository)(entities.CommissionTransaction)),
    __param(43, (0, typeorm_1.InjectRepository)(entities.MonthlySettlement)),
    __param(44, (0, typeorm_1.InjectRepository)(entities.SettlementTransaction)),
    __param(45, (0, typeorm_1.InjectRepository)(entities.CODTransaction)),
    __param(46, (0, typeorm_1.InjectRepository)(entities.CustomerRewardPoints)),
    __param(47, (0, typeorm_1.InjectRepository)(entities.BankingInfo)),
    __param(48, (0, typeorm_1.InjectRepository)(entities.IdempotencyKey)),
    __param(49, (0, typeorm_1.InjectRepository)(entities.AdminActionAudit)),
    __param(50, (0, typeorm_1.InjectRepository)(entities.CommissionPayment)),
    __param(51, (0, typeorm_1.InjectRepository)(entities.DeviceToken)),
    __param(52, (0, typeorm_1.InjectRepository)(entities.NotificationLog)),
    __param(53, (0, typeorm_1.InjectRepository)(entities.ScheduledNotification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeederService);
//# sourceMappingURL=seeder.service.js.map
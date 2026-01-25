import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as entities from './entities';
import * as fs from 'fs';
import * as path from 'path';
import { BookingStatus } from '../common/enums';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(entities.User)
    private userRepository: Repository<entities.User>,
    @InjectRepository(entities.UserRole)
    private userRoleRepository: Repository<entities.UserRole>,
    @InjectRepository(entities.Customer)
    private customerRepository: Repository<entities.Customer>,
    @InjectRepository(entities.CustomerFavorite)
    private customerFavoriteRepository: Repository<entities.CustomerFavorite>,
    @InjectRepository(entities.UserAddress)
    private userAddressRepository: Repository<entities.UserAddress>,
    @InjectRepository(entities.CustomerOnboarding)
    private customerOnboardingRepository: Repository<entities.CustomerOnboarding>,
    @InjectRepository(entities.BusinessOwner)
    private businessOwnerRepository: Repository<entities.BusinessOwner>,
    @InjectRepository(entities.BusinessOwnerOnboarding)
    private businessOwnerOnboardingRepository: Repository<entities.BusinessOwnerOnboarding>,
    @InjectRepository(entities.BusinessAddress)
    private businessAddressRepository: Repository<entities.BusinessAddress>,
    @InjectRepository(entities.BusinessMedia)
    private businessMediaRepository: Repository<entities.BusinessMedia>,
    @InjectRepository(entities.BusinessOperatingHours)
    private businessOperatingHoursRepository: Repository<entities.BusinessOperatingHours>,
    @InjectRepository(entities.BusinessService)
    private businessServiceRepository: Repository<entities.BusinessService>,
    @InjectRepository(entities.ServicePackage)
    private servicePackageRepository: Repository<entities.ServicePackage>,
    @InjectRepository(entities.ServicePackageItem)
    private servicePackageItemRepository: Repository<entities.ServicePackageItem>,
    @InjectRepository(entities.RefreshToken)
    private refreshTokenRepository: Repository<entities.RefreshToken>,
    @InjectRepository(entities.OtpToken)
    private otpTokenRepository: Repository<entities.OtpToken>,
    @InjectRepository(entities.Admin)
    private adminRepository: Repository<entities.Admin>,
    @InjectRepository(entities.Agent)
    private agentRepository: Repository<entities.Agent>,
    @InjectRepository(entities.BusinessApproval)
    private businessApprovalRepository: Repository<entities.BusinessApproval>,
    @InjectRepository(entities.SubscriptionPlan)
    private subscriptionPlanRepository: Repository<entities.SubscriptionPlan>,
    @InjectRepository(entities.BusinessSubscription)
    private businessSubscriptionRepository: Repository<entities.BusinessSubscription>,
    @InjectRepository(entities.SubscriptionTransaction)
    private subscriptionTransactionRepository: Repository<entities.SubscriptionTransaction>,
    @InjectRepository(entities.Staff)
    private staffRepository: Repository<entities.Staff>,
    @InjectRepository(entities.ServiceCategory)
    private serviceCategoryRepository: Repository<entities.ServiceCategory>,
    @InjectRepository(entities.Service)
    private serviceRepository: Repository<entities.Service>,
    @InjectRepository(entities.StaffService)
    private staffServiceRepository: Repository<entities.StaffService>,
    @InjectRepository(entities.StaffScheduleOverride)
    private staffScheduleOverrideRepository: Repository<entities.StaffScheduleOverride>,
    @InjectRepository(entities.StaffBreak)
    private staffBreakRepository: Repository<entities.StaffBreak>,
    @InjectRepository(entities.StaffWorkingHours)
    private staffWorkingHoursRepository: Repository<entities.StaffWorkingHours>,
    @InjectRepository(entities.Booking)
    private bookingRepository: Repository<entities.Booking>,
    @InjectRepository(entities.BookingRequest)
    private bookingRequestRepository: Repository<entities.BookingRequest>,
    @InjectRepository(entities.BookingRequestService)
    private bookingRequestServiceRepository: Repository<entities.BookingRequestService>,
    @InjectRepository(entities.BookingService)
    private bookingServiceRepository: Repository<entities.BookingService>,
    @InjectRepository(entities.Review)
    private reviewRepository: Repository<entities.Review>,
    @InjectRepository(entities.BusinessSettings)
    private businessSettingsRepository: Repository<entities.BusinessSettings>,
    @InjectRepository(entities.Payment)
    private paymentRepository: Repository<entities.Payment>,
    @InjectRepository(entities.Advertisement)
    private advertisementRepository: Repository<entities.Advertisement>,
    @InjectRepository(entities.SupportMember)
    private supportMemberRepository: Repository<entities.SupportMember>,
    @InjectRepository(entities.CustomerSupportMapping)
    private customerSupportMappingRepository: Repository<entities.CustomerSupportMapping>,
    @InjectRepository(entities.Wallet)
    private walletRepository: Repository<entities.Wallet>,
    @InjectRepository(entities.WalletTransaction)
    private walletTransactionRepository: Repository<entities.WalletTransaction>,
    @InjectRepository(entities.CommissionConfig)
    private commissionConfigRepository: Repository<entities.CommissionConfig>,
    @InjectRepository(entities.CommissionTransaction)
    private commissionTransactionRepository: Repository<entities.CommissionTransaction>,
    @InjectRepository(entities.MonthlySettlement)
    private monthlySettlementRepository: Repository<entities.MonthlySettlement>,
    @InjectRepository(entities.SettlementTransaction)
    private settlementTransactionRepository: Repository<entities.SettlementTransaction>,
    @InjectRepository(entities.CODTransaction)
    private codTransactionRepository: Repository<entities.CODTransaction>,
    @InjectRepository(entities.CustomerRewardPoints)
    private customerRewardPointsRepository: Repository<entities.CustomerRewardPoints>,
    @InjectRepository(entities.BankingInfo)
    private bankingInfoRepository: Repository<entities.BankingInfo>,
    @InjectRepository(entities.IdempotencyKey)
    private idempotencyKeyRepository: Repository<entities.IdempotencyKey>,
    @InjectRepository(entities.AdminActionAudit)
    private adminActionAuditRepository: Repository<entities.AdminActionAudit>,
    @InjectRepository(entities.CommissionPayment)
    private commissionPaymentRepository: Repository<entities.CommissionPayment>,
    @InjectRepository(entities.DeviceToken)
    private deviceTokenRepository: Repository<entities.DeviceToken>,
    @InjectRepository(entities.NotificationLog)
    private notificationLogRepository: Repository<entities.NotificationLog>,
    @InjectRepository(entities.ScheduledNotification)
    private scheduledNotificationRepository: Repository<entities.ScheduledNotification>,
  ) {}

  async seedFromJSON(filePath: string) {
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
      
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  async importAllDataFiles() {
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir);
    
    // Filter only public table files (exclude pg_catalog and information_schema)
    const publicTableFiles = files.filter(file => 
      file.startsWith('public_') && file.endsWith('.json')
    );
    
    console.log(`Found ${publicTableFiles.length} data files to import`);
    
    for (const file of publicTableFiles) {
      const filePath = path.join(dataDir, file);
      console.log(`\n📁 Processing: ${file}`);
      
      try {
        await this.seedFromJSON(filePath);
      } catch (error) {
        console.error(`❌ Failed to import ${file}:`, error.message);
      }
    }
    
    console.log('\n✅ All data import completed!');
  }

  async seedFromCSV(tableName: string, filePath: string) {
    try {
      const query = `
        COPY ${tableName} FROM '${filePath}' WITH CSV HEADER
      `;
      
      await this.userRepository.query(query);
      console.log(`✅ Imported data to ${tableName}`);
      
    } catch (error) {
      console.error('❌ CSV import failed:', error);
      throw error;
    }
  }

  async createPositiveSettlementTestData() {
    const boUserPhone = '9990001111';
    const customerUserPhone = '9990002222';

    let boUser = await this.userRepository.findOne({ where: { phone: boUserPhone } });
    if (!boUser) {
      boUser = this.userRepository.create({
        phone: boUserPhone,
        email: 'bo.sample@example.com',
        isPhoneVerified: true,
      });
      boUser = await this.userRepository.save(boUser);
    }

    let businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId: boUser.id },
    });
    if (!businessOwner) {
      businessOwner = this.businessOwnerRepository.create({
        userId: boUser.id,
        businessName: 'Sample Salon',
        shopId: 'sample-shop-001',
        isApproved: true,
        isActive: true,
      });
      businessOwner = await this.businessOwnerRepository.save(businessOwner);
    } else {
      if (!businessOwner.isApproved) {
        businessOwner.isApproved = true;
        await this.businessOwnerRepository.save(businessOwner);
      }
    }

    let customerUser = await this.userRepository.findOne({ where: { phone: customerUserPhone } });
    if (!customerUser) {
      customerUser = this.userRepository.create({
        phone: customerUserPhone,
        email: 'customer.sample@example.com',
        isPhoneVerified: true,
      });
      customerUser = await this.userRepository.save(customerUser);
    }

    let customer = await this.customerRepository.findOne({ where: { userId: customerUser.id } });
    if (!customer) {
      customer = this.customerRepository.create({
        userId: customerUser.id,
        firstName: 'Sample',
        lastName: 'Customer',
      });
      customer = await this.customerRepository.save(customer);
    }

    let staff = await this.staffRepository.findOne({ where: { businessOwnerId: businessOwner.id } });
    if (!staff) {
      staff = this.staffRepository.create({
        businessOwnerId: businessOwner.id,
        firstName: 'Alex',
        lastName: 'Doe',
      });
      staff = await this.staffRepository.save(staff);
    }

    let serviceCategory = await this.serviceCategoryRepository.findOne({
      where: { name: 'Hair' },
    });
    if (!serviceCategory) {
      serviceCategory = this.serviceCategoryRepository.create({
        name: 'Hair',
        description: 'Hair services',
        isActive: true,
      });
      serviceCategory = await this.serviceCategoryRepository.save(serviceCategory);
    }

    let service = await this.serviceRepository.findOne({
      where: { name: 'Haircut', categoryId: serviceCategory.id },
    });
    if (!service) {
      service = this.serviceRepository.create({
        categoryId: serviceCategory.id,
        name: 'Haircut',
        description: 'Basic haircut',
        basePrice: 600,
        defaultDuration: 30,
        isActive: true,
      });
      service = await this.serviceRepository.save(service);
    }

    let businessService = await this.businessServiceRepository.findOne({
      where: { businessOwnerId: businessOwner.id, serviceId: service.id },
    });
    if (!businessService) {
      businessService = this.businessServiceRepository.create({
        businessOwnerId: businessOwner.id,
        serviceId: service.id,
        customPrice: 600,
        customDurationMinutes: 30,
        isActive: true,
      });
      await this.businessServiceRepository.save(businessService);
    }

    let bankingInfo = await this.bankingInfoRepository.findOne({
      where: { businessOwnerId: businessOwner.id },
    });
    if (!bankingInfo) {
      bankingInfo = this.bankingInfoRepository.create({
        businessOwnerId: businessOwner.id,
        bankName: 'HDFC Bank',
        branch: 'Sample Branch',
        accountHolderName: 'Sample Owner',
        accountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        isVerified: true,
        verifiedAt: new Date(),
      });
      bankingInfo = await this.bankingInfoRepository.save(bankingInfo);
    }

    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 10, 0, 0);
    const lastMonthMid = new Date(now.getFullYear(), now.getMonth() - 1, 15, 12, 0, 0);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 25, 15, 30, 0);

    const bookingsData = [
      {
        appointmentDate: lastMonthStart,
        startTime: '10:00:00',
        endTime: '10:30:00',
        totalAmount: 600,
      },
      {
        appointmentDate: lastMonthMid,
        startTime: '12:00:00',
        endTime: '12:45:00',
        totalAmount: 800,
      },
      {
        appointmentDate: lastMonthEnd,
        startTime: '15:00:00',
        endTime: '15:40:00',
        totalAmount: 700,
      },
    ];

    for (const b of bookingsData) {
      const exists = await this.bookingRepository.findOne({
        where: {
          businessOwnerId: businessOwner.id,
          appointmentDate: b.appointmentDate instanceof Date
            ? b.appointmentDate.toISOString().split('T')[0] as any
            : b.appointmentDate,
          startTime: b.startTime,
        } as any,
      });
      if (exists) continue;

      const booking = this.bookingRepository.create({
        customerId: customer.id,
        businessOwnerId: businessOwner.id,
        staffId: staff.id,
        serviceId: service.id,
        appointmentDate: new Date(b.appointmentDate),
        startTime: b.startTime,
        endTime: b.endTime,
        totalAmount: b.totalAmount,
        status: BookingStatus.COMPLETED,
        otpCode: '123456',
        paymentCompleted: true,
        serviceStartedAt: new Date(b.appointmentDate),
        serviceCompletedAt: new Date(b.appointmentDate),
      });
      await this.bookingRepository.save(booking);
    }

    return {
      businessOwnerId: businessOwner.id,
      customerId: customer.id,
      info: 'Sample data created for positive settlement testing',
    };
  }
}

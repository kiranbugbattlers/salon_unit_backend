"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const wallet_monitor_service_1 = require("../src/wallet/wallet-monitor.service");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../src/database/entities");
async function runTest() {
    console.log('🚀 Starting Credit Limit Test Script...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const walletMonitorService = app.get(wallet_monitor_service_1.WalletMonitorService);
        const businessOwnerRepo = app.get((0, typeorm_1.getRepositoryToken)(entities_1.BusinessOwner));
        const walletRepo = app.get((0, typeorm_1.getRepositoryToken)(entities_1.Wallet));
        const adminRepo = app.get((0, typeorm_1.getRepositoryToken)(entities_1.Admin));
        console.log('\n1️⃣  Setting up Admin...');
        let admin = await adminRepo.findOne({ where: { isActive: true } });
        if (!admin) {
            console.log('No active admin found. Creating test admin...');
            admin = adminRepo.create({
                username: 'test_admin_script',
                password: 'password123',
                firstName: 'Test',
                lastName: 'Admin',
                email: 'test-admin@example.com',
                isActive: true
            });
            await adminRepo.save(admin);
            console.log(`Created test admin: ${admin.email}`);
        }
        else {
            if (!admin.email) {
                admin.email = 'test-admin@example.com';
                await adminRepo.save(admin);
                console.log(`Updated existing admin with email: ${admin.email}`);
            }
            else {
                console.log(`Using existing admin: ${admin.email}`);
            }
        }
        console.log('\n2️⃣  Setting up Business Owner & Wallet...');
        let businessOwner = await businessOwnerRepo.findOne({
            relations: ['user']
        });
        if (!businessOwner) {
            console.error('❌ No business owner found in database. Please seed database first.');
            return;
        }
        console.log(`Selected Business Owner: ${businessOwner.businessName || 'Unnamed'} (${businessOwner.shopId})`);
        const TEST_CREDIT_LIMIT = 500;
        businessOwner.creditLimit = TEST_CREDIT_LIMIT;
        await businessOwnerRepo.save(businessOwner);
        console.log(`✅ Set Credit Limit to: ₹${TEST_CREDIT_LIMIT}`);
        let wallet = await walletRepo.findOne({
            where: { userId: businessOwner.userId, userType: entities_1.WalletUserType.BUSINESS_OWNER }
        });
        if (!wallet) {
            console.log('Wallet not found. Creating...');
            wallet = walletRepo.create({
                userId: businessOwner.userId,
                userType: entities_1.WalletUserType.BUSINESS_OWNER,
                balance: 0,
                isActive: true
            });
            await walletRepo.save(wallet);
        }
        const TEST_BALANCE = -1000;
        wallet.balance = TEST_BALANCE;
        await walletRepo.save(wallet);
        console.log(`✅ Set Wallet Balance to: ₹${TEST_BALANCE}`);
        console.log(`\nScenario: Balance (₹${TEST_BALANCE}) < -Limit (₹-${TEST_CREDIT_LIMIT}) is TRUE.`);
        console.log('Expected Result: Admin notification should be sent.');
        console.log('\n3️⃣  Running WalletMonitorService.checkCreditLimitBreaches()...');
        const result = await walletMonitorService.checkCreditLimitBreaches();
        console.log('\n📊 Test Results:');
        console.log('--------------------------------------------------');
        console.log(`Notified Count: ${result.notifiedCount}`);
        console.log(`Total Negative Wallets Scanned: ${result.totalNegativeWallets}`);
        if (result.notifiedCount > 0) {
            console.log('\n✅ SUCCESS: Admin notification logic triggered!');
        }
        else {
            console.log('\n❌ FAILURE: No notifications were sent.');
        }
        console.log('--------------------------------------------------');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
    finally {
        await app.close();
    }
}
runTest();
//# sourceMappingURL=test-credit-limit.js.map
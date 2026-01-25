import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { WalletMonitorService } from '../src/wallet/wallet-monitor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BusinessOwner, Wallet, Admin, WalletUserType } from '../src/database/entities';
import { Repository } from 'typeorm';

async function runTest() {
  console.log('🚀 Starting Credit Limit Test Script...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const walletMonitorService = app.get(WalletMonitorService);
    const businessOwnerRepo = app.get<Repository<BusinessOwner>>(getRepositoryToken(BusinessOwner));
    const walletRepo = app.get<Repository<Wallet>>(getRepositoryToken(Wallet));
    const adminRepo = app.get<Repository<Admin>>(getRepositoryToken(Admin));

    // 1. Setup Test Admin
    console.log('\n1️⃣  Setting up Admin...');
    let admin = await adminRepo.findOne({ where: { isActive: true } });
    if (!admin) {
        // Create dummy admin if none exists
        console.log('No active admin found. Creating test admin...');
        // Note: Password hashing happens in entity hook
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
    } else {
        if (!admin.email) {
            admin.email = 'test-admin@example.com';
            await adminRepo.save(admin);
            console.log(`Updated existing admin with email: ${admin.email}`);
        } else {
            console.log(`Using existing admin: ${admin.email}`);
        }
    }

    // 2. Setup Business Owner and Wallet
    console.log('\n2️⃣  Setting up Business Owner & Wallet...');
    // Find a business owner
    let businessOwner = await businessOwnerRepo.findOne({ 
        relations: ['user'] 
    });

    if (!businessOwner) {
        console.error('❌ No business owner found in database. Please seed database first.');
        return;
    }

    console.log(`Selected Business Owner: ${businessOwner.businessName || 'Unnamed'} (${businessOwner.shopId})`);

    // Set Credit Limit
    const TEST_CREDIT_LIMIT = 500;
    businessOwner.creditLimit = TEST_CREDIT_LIMIT;
    await businessOwnerRepo.save(businessOwner);
    console.log(`✅ Set Credit Limit to: ₹${TEST_CREDIT_LIMIT}`);

    // Get Wallet
    let wallet = await walletRepo.findOne({
        where: { userId: businessOwner.userId, userType: WalletUserType.BUSINESS_OWNER }
    });

    if (!wallet) {
        // Create wallet if missing
        console.log('Wallet not found. Creating...');
        wallet = walletRepo.create({
            userId: businessOwner.userId,
            userType: WalletUserType.BUSINESS_OWNER,
            balance: 0,
            isActive: true
        });
        await walletRepo.save(wallet);
    }

    // Set Negative Balance exceeding limit
    const TEST_BALANCE = -1000;
    wallet.balance = TEST_BALANCE;
    await walletRepo.save(wallet);
    console.log(`✅ Set Wallet Balance to: ₹${TEST_BALANCE}`);

    console.log(`\nScenario: Balance (₹${TEST_BALANCE}) < -Limit (₹-${TEST_CREDIT_LIMIT}) is TRUE.`);
    console.log('Expected Result: Admin notification should be sent.');

    // 3. Run the Check
    console.log('\n3️⃣  Running WalletMonitorService.checkCreditLimitBreaches()...');
    const result = await walletMonitorService.checkCreditLimitBreaches();

    console.log('\n📊 Test Results:');
    console.log('--------------------------------------------------');
    console.log(`Notified Count: ${result.notifiedCount}`);
    console.log(`Total Negative Wallets Scanned: ${result.totalNegativeWallets}`);
    
    if (result.notifiedCount > 0) {
        console.log('\n✅ SUCCESS: Admin notification logic triggered!');
    } else {
        console.log('\n❌ FAILURE: No notifications were sent.');
    }
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await app.close();
  }
}

runTest();

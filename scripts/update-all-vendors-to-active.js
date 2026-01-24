import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BusinessOwner } from './database/entities';
import { VendorStatus } from './common/enums/vendor-status.enum';

async function updateAllVendorsToActive() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const businessOwnerRepository = app.get('BusinessOwnerRepository');
  
  try {
    console.log('Updating all vendor statuses to ACTIVE...');
    
    // Find all vendors that are not already ACTIVE
    const vendorsToUpdate = await businessOwnerRepository.find({
      where: [
        { vendorStatus: VendorStatus.HOLD_ACCOUNT },
        { vendorStatus: VendorStatus.INACTIVE },
        { vendorStatus: VendorStatus.SUSPENDED },
        { vendorStatus: VendorStatus.SERVICES_HIDDEN },
      ]
    });
    
    console.log(`Found ${vendorsToUpdate.length} vendors to update`);
    
    // Update all vendors to ACTIVE
    for (const vendor of vendorsToUpdate) {
      const oldStatus = vendor.vendorStatus;
      vendor.vendorStatus = VendorStatus.ACTIVE;
      await businessOwnerRepository.save(vendor);
      
      console.log(`Updated vendor ${vendor.shopId} (${vendor.businessName}) from ${oldStatus} to ACTIVE`);
    }
    
    console.log('✅ All vendors updated to ACTIVE status successfully');
    
    // Get final statistics
    const stats = await businessOwnerRepository
      .createQueryBuilder('businessOwner')
      .select('businessOwner.vendorStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('businessOwner.vendorStatus')
      .getRawMany();
    
    console.log('\nFinal vendor status statistics:');
    stats.forEach(stat => {
      console.log(`${stat.status}: ${stat.count}`);
    });
    
  } catch (error) {
    console.error('Error updating vendors:', error);
  } finally {
    await app.close();
  }
}

updateAllVendorsToActive();

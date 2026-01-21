const { Client } = require('pg');

async function updateVendorStatusDefault() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'Pass@123',
    database: process.env.DATABASE_NAME || 'salon_backend',
  });

  try {
    await client.connect();
    console.log('Database connection established');

    // Update existing records with null vendor_status to hold_account
    const updateResult = await client.query(`
      UPDATE business_owner 
      SET vendor_status = 'hold_account' 
      WHERE vendor_status IS NULL OR vendor_status = 'active'
    `);

    console.log(`✅ Updated ${updateResult.rowCount} business owners to hold_account status`);

    // Verify the update
    const verifyResult = await client.query(`
      SELECT vendor_status, COUNT(*) as count 
      FROM business_owner 
      GROUP BY vendor_status
    `);

    console.log('\nVendor status distribution:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.vendor_status}: ${row.count} business owners`);
    });

    // Check if any business owners need to be updated to active (approved ones)
    const approvedOwners = await client.query(`
      UPDATE business_owner 
      SET vendor_status = 'active' 
      WHERE is_approved = true AND vendor_status = 'hold_account'
      RETURNING id, business_name, vendor_status
    `);

    if (approvedOwners.rowCount > 0) {
      console.log(`\n✅ Updated ${approvedOwners.rowCount} approved business owners to active status`);
      approvedOwners.rows.forEach(owner => {
        console.log(`  - ${owner.business_name}: ${owner.vendor_status}`);
      });
    }

    console.log('\n✅ Vendor status default update completed successfully');

  } catch (error) {
    console.error('❌ Error updating vendor status default:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

updateVendorStatusDefault();

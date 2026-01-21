const { Client } = require('pg');

async function updateVendorStatusEnum() {
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

    // First, drop the existing enum
    console.log('Dropping existing vendor_status enum...');
    await client.query(`ALTER TABLE business_owner DROP COLUMN vendor_status`);
    await client.query(`DROP TYPE IF EXISTS business_owner_vendor_status_enum`);

    // Create new enum with hold_account as first option
    console.log('Creating new vendor_status enum with hold_account...');
    await client.query(`
      CREATE TYPE business_owner_vendor_status_enum AS ENUM (
        'hold_account',
        'active', 
        'inactive', 
        'suspended', 
        'services_hidden'
      )
    `);

    // Add the column back with new default
    console.log('Adding vendor_status column with hold_account default...');
    await client.query(`
      ALTER TABLE business_owner 
      ADD COLUMN vendor_status business_owner_vendor_status_enum DEFAULT 'hold_account'
    `);

    // Update existing records - set approved ones to active, others to hold_account
    console.log('Updating existing business owner records...');
    const updateResult = await client.query(`
      UPDATE business_owner 
      SET vendor_status = CASE 
        WHEN is_approved = true THEN 'active'::business_owner_vendor_status_enum
        ELSE 'hold_account'::business_owner_vendor_status_enum
      END
    `);

    console.log(`✅ Updated ${updateResult.rowCount} business owners`);

    // Verify the update
    const verifyResult = await client.query(`
      SELECT vendor_status, COUNT(*) as count 
      FROM business_owner 
      GROUP BY vendor_status
      ORDER BY count DESC
    `);

    console.log('\nVendor status distribution:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.vendor_status}: ${row.count} business owners`);
    });

    console.log('\n✅ Vendor status enum update completed successfully');

  } catch (error) {
    console.error('❌ Error updating vendor status enum:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

updateVendorStatusEnum();

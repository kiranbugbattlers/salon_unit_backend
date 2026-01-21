const { Client } = require('pg');

async function createSimpleOverdueCheck() {
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

    // Create simple function to check if vendor has overdue payments
    console.log('Creating simple function to check vendor overdue status...');
    
    await client.query(`
      CREATE OR REPLACE FUNCTION check_vendor_overdue(vendor_business_owner_id UUID)
      RETURNS BOOLEAN AS $$
      DECLARE
        overdue_count INTEGER;
      BEGIN
        -- Count overdue payments
        SELECT COUNT(*) INTO overdue_count
        FROM vendor_due_payments 
        WHERE business_owner_id = vendor_business_owner_id 
        AND status = 'overdue';
        
        -- Return true if has overdue payments
        RETURN overdue_count > 0;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ check_vendor_overdue function created successfully');

    // Create function to update vendor status to services_hidden when overdue
    console.log('Creating function to update vendor status to services_hidden...');
    
    await client.query(`
      CREATE OR REPLACE FUNCTION hide_vendor_services_if_overdue()
      RETURNS VOID AS $$
      DECLARE
        vendor_record RECORD;
      BEGIN
        -- Update all vendors with overdue payments to services_hidden
        UPDATE business_owner 
        SET vendor_status = 'services_hidden',
            updated_at = NOW()
        WHERE id IN (
          SELECT DISTINCT business_owner_id 
          FROM vendor_due_payments 
          WHERE status = 'overdue'
        ) AND is_approved = true;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ hide_vendor_services_if_overdue function created successfully');

    // Test the function with existing data
    const testResult = await client.query(`
      SELECT 
        bo.id,
        bo.business_name,
        bo.vendor_status,
        check_vendor_overdue(bo.id) as is_overdue
      FROM business_owner bo
      WHERE bo.is_approved = true
      ORDER BY bo.business_name
      LIMIT 5
    `);

    console.log('\nVendor overdue status test results:');
    testResult.rows.forEach(vendor => {
      console.log(`  ${vendor.business_name}: ${vendor.vendor_status} (Overdue: ${vendor.is_overdue})`);
    });

    // Manually update vendors with overdue payments
    console.log('\nUpdating vendors with overdue payments...');
    const updateResult = await client.query(`
      SELECT hide_vendor_services_if_overdue()
    `);

    console.log(`✅ Updated vendors with overdue payments`);

    // Verify the update
    const verifyResult = await client.query(`
      SELECT 
        bo.id,
        bo.business_name,
        bo.vendor_status,
        check_vendor_overdue(bo.id) as is_overdue
      FROM business_owner bo
      WHERE bo.is_approved = true
      ORDER BY bo.business_name
      LIMIT 5
    `);

    console.log('\nVendor status after update:');
    verifyResult.rows.forEach(vendor => {
      console.log(`  ${vendor.business_name}: ${vendor.vendor_status} (Overdue: ${vendor.is_overdue})`);
    });

    console.log('\n✅ Simple vendor overdue check system implemented successfully');

  } catch (error) {
    console.error('❌ Error creating overdue check system:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

createSimpleOverdueCheck();

const { Client } = require('pg');

async function createOverduePayment() {
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

    // Find a business owner to create overdue payment for
    const businessOwner = await client.query(`
      SELECT id, business_name, first_name, last_name
      FROM business_owner 
      WHERE is_approved = true 
      AND business_name = 'Royal Elite Salon'
    `);

    if (businessOwner.rows.length > 0) {
      const owner = businessOwner.rows[0];
      
      // Create an overdue payment
      const overduePayment = await client.query(`
        INSERT INTO vendor_due_payments (
          business_owner_id, 
          due_amount, 
          paid_amount, 
          remaining_amount, 
          alternate_number, 
          salon_name, 
          owner_name, 
          mobile_number, 
          is_business_enabled, 
          due_date, 
          status, 
          description, 
          admin_remarks, 
          created_at, 
          updated_at
        ) VALUES (
          $1, 
          10000, 
          2000, 
          8000, 
          '7777777777', 
          $2, 
          $3, 
          '9876543210', 
          true, 
          NOW() - INTERVAL '10 days', 
          'overdue', 
          'Overdue payment for testing booking restriction', 
          'Admin: This vendor exceeded credit limit', 
          NOW(), 
          NOW()
        ) RETURNING *
      `, [
        owner.id,
        owner.business_name,
        `${owner.first_name} ${owner.last_name}`.trim()
      ]);

      console.log('Created overdue payment:', overduePayment.rows[0]);
      
      // Update vendor status to services_hidden
      const updateResult = await client.query(`
        SELECT hide_vendor_services_if_overdue()
      `);

      console.log('✅ Updated vendor status to services_hidden');

      // Verify the update
      const verifyResult = await client.query(`
        SELECT 
          bo.id,
          bo.business_name,
          bo.vendor_status,
          check_vendor_overdue(bo.id) as is_overdue
        FROM business_owner bo
        WHERE bo.business_name = 'Royal Elite Salon'
      `);

      console.log('\nVendor status after creating overdue payment:');
      verifyResult.rows.forEach(vendor => {
        console.log(`  ${vendor.business_name}: ${vendor.vendor_status} (Overdue: ${vendor.is_overdue})`);
      });

    } else {
      console.log('No business owner found with name "Royal Elite Salon"');
    }

    console.log('\n✅ Overdue payment test completed successfully');

  } catch (error) {
    console.error('❌ Error creating overdue payment:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

createOverduePayment();

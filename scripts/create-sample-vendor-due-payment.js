const { Client } = require('pg');

async function createSampleVendorDuePayment() {
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

    // Check if there are any business owners
    const businessOwners = await client.query(`
      SELECT id, business_name, first_name, last_name, user_id
      FROM business_owner 
      WHERE is_approved = true 
      LIMIT 3
    `);

    console.log(`Found ${businessOwners.rows.length} approved business owners`);

    if (businessOwners.rows.length === 0) {
      console.log('No approved business owners found. Creating sample data...');
      
      // Create a sample business owner first
      const newUser = await client.query(`
        INSERT INTO users (id, email, phone, password_hash, created_at, updated_at)
        VALUES (gen_random_uuid(), 'test@salon.com', '9876543210', '$2b$10$dummy', NOW(), NOW())
        RETURNING id
      `);

      const newBusinessOwner = await client.query(`
        INSERT INTO business_owner (id, user_id, business_name, first_name, last_name, is_approved, approved_at, shop_id, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, 'Test Salon', 'John', 'Doe', true, NOW(), 'SH-123456', NOW(), NOW())
        RETURNING id, business_name, first_name, last_name
      `, [newUser.rows[0].id]);

      console.log('Created sample business owner:', newBusinessOwner.rows[0]);
      
      // Create sample due payment
      const sampleDuePayment = await client.query(`
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
          50000, 
          0, 
          50000, 
          '9999999999', 
          $2, 
          $3, 
          $4, 
          true, 
          NOW() + INTERVAL '30 days', 
          'pending', 
          'Sample due payment for testing', 
          'Admin remarks for testing', 
          NOW(), 
          NOW()
        ) RETURNING *
      `, [
        newBusinessOwner.rows[0].id,
        newBusinessOwner.rows[0].business_name,
        `${newBusinessOwner.rows[0].first_name} ${newBusinessOwner.rows[0].last_name}`,
        '9876543210'
      ]);

      console.log('Created sample due payment:', sampleDuePayment.rows[0]);
      
    } else {
      // Create sample due payment for existing business owner
      const businessOwner = businessOwners.rows[0];
      
      const sampleDuePayment = await client.query(`
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
          25000, 
          0, 
          25000, 
          '8888888888', 
          $2, 
          $3, 
          $4, 
          true, 
          NOW() + INTERVAL '15 days', 
          'pending', 
          'Test due payment', 
          'Admin test remarks', 
          NOW(), 
          NOW()
        ) RETURNING *
      `, [
        businessOwner.id,
        businessOwner.business_name || 'Unknown Salon',
        `${businessOwner.first_name || ''} ${businessOwner.last_name || ''}`.trim() || 'Unknown Owner',
        '1234567890'
      ]);

      console.log('Created sample due payment:', sampleDuePayment.rows[0]);
    }

    // Verify the data was inserted
    const count = await client.query('SELECT COUNT(*) as count FROM vendor_due_payments');
    console.log(`\nTotal vendor due payments in database: ${count.rows[0].count}`);

    // Show all due payments
    const allDuePayments = await client.query(`
      SELECT id, business_owner_id, salon_name, owner_name, mobile_number, 
             due_amount, status, due_date, admin_remarks
      FROM vendor_due_payments 
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('\nRecent vendor due payments:');
    allDuePayments.rows.forEach(payment => {
      console.log(`  ID: ${payment.id}`);
      console.log(`  Salon: ${payment.salon_name}`);
      console.log(`  Owner: ${payment.owner_name}`);
      console.log(`  Mobile: ${payment.mobile_number}`);
      console.log(`  Due Amount: ${payment.due_amount}`);
      console.log(`  Status: ${payment.status}`);
      console.log(`  Due Date: ${payment.due_date}`);
      console.log(`  Admin Remarks: ${payment.admin_remarks}`);
      console.log('  ---');
    });

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

createSampleVendorDuePayment();

const { Client } = require('pg');

async function makeBookingIdNullable() {
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

    // Make booking_id nullable in user_booking_history
    console.log('Making booking_id nullable in user_booking_history table...');
    
    await client.query(`
      ALTER TABLE user_booking_history 
      ALTER COLUMN booking_id DROP NOT NULL
    `);

    console.log('✅ booking_id column is now nullable');

    // Now create sample data
    await createSampleData(client);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function createSampleData(client) {
  // Get any approved business owner and user
  const businessOwner = await client.query(`
    SELECT id, business_name, first_name, last_name
    FROM business_owner 
    WHERE is_approved = true 
    LIMIT 1
  `);

  const user = await client.query(`
    SELECT id, phone, email
    FROM users 
    LIMIT 1
  `);

  if (businessOwner.rows.length > 0) {
    const owner = businessOwner.rows[0];
    
    console.log(`Creating transaction history for ${owner.business_name}...`);

    // Create sample user booking history (without requiring existing bookings)
    for (let i = 0; i < 3; i++) {
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - (i * 3));
      
      const bookingAmount = 1500 + (i * 500);
      const commissionAmount = bookingAmount * 0.1; // 10% commission
      const vendorEarning = bookingAmount - commissionAmount;
      
      await client.query(`
        INSERT INTO user_booking_history (
          user_id, 
          booking_id, 
          business_owner_id, 
          customer_name, 
          customer_mobile, 
          booking_date, 
          booking_amount, 
          payment_status, 
          payment_method, 
          vendor_payment_status, 
          vendor_paid_amount, 
          commission_amount, 
          vendor_earning, 
          booking_status, 
          remarks, 
          created_at, 
          updated_at
        ) VALUES (
          $1, 
          NULL, 
          $2, 
          $3, 
          $4, 
          $5, 
          $6, 
          'paid', 
          'online', 
          'pending', 
          0, 
          $7, 
          $8, 
          'completed', 
          'Sample booking history #${i + 1}', 
          NOW(), 
          NOW()
        )
      `, [
        user.rows[0].id,
        owner.id,
        user.rows[0].email || `Customer ${i + 1}`,
        user.rows[0].phone,
        bookingDate,
        bookingAmount,
        commissionAmount,
        vendorEarning
      ]);
    }

    console.log('✅ User booking history created');

    // Create vendor payment summary
    const summaryDate = new Date();
    summaryDate.setDate(summaryDate.getDate() - 1);
    
    const totalBookings = 3;
    const totalRevenue = 6000;
    const totalCommission = totalRevenue * 0.1;
    const vendorEarning = totalRevenue - totalCommission;
    
    await client.query(`
      INSERT INTO vendor_payment_summary (
        business_owner_id, 
        summary_date, 
        total_bookings, 
        total_revenue, 
        total_commission, 
        vendor_earning, 
        amount_paid, 
        amount_due, 
        payment_status, 
        created_at, 
        updated_at
      ) VALUES (
        $1, 
        $2, 
        $3, 
        $4, 
        $5, 
        $6, 
        0, 
        $6, 
        'pending', 
        NOW(), 
        NOW()
      )
    `, [
      owner.id,
      summaryDate,
      totalBookings,
      totalRevenue,
      totalCommission,
      vendorEarning
    ]);

    console.log('✅ Vendor payment summary created');

    // Verify the data
    const transactionCount = await client.query(`
      SELECT COUNT(*) as count FROM business_owner_transaction_history 
      WHERE business_owner_id = $1
    `, [owner.id]);

    const bookingHistoryCount = await client.query(`
      SELECT COUNT(*) as count FROM user_booking_history 
      WHERE business_owner_id = $1
    `, [owner.id]);

    console.log('\n📊 Summary:');
    console.log(`  Transaction History Records: ${transactionCount.rows[0].count}`);
    console.log(`  Booking History Records: ${bookingHistoryCount.rows[0].count}`);
    console.log(`  Business Owner: ${owner.business_name}`);

  } else {
    console.log('No approved business owners found');
  }

  console.log('\n✅ Sample transaction history data created successfully');
}

// Load environment variables
require('dotenv').config();

makeBookingIdNullable();

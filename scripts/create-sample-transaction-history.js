const { Client } = require('pg');

async function createSampleTransactionHistory() {
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

    // Get business owner and booking data
    const businessOwner = await client.query(`
      SELECT id, business_name, first_name, last_name
      FROM business_owner 
      WHERE is_approved = true 
      AND business_name = 'royal look'
    `);

    console.log(`Found ${businessOwner.rows.length} business owners matching 'royal look'`);
    
    if (businessOwner.rows.length === 0) {
      // Try any approved business owner
      const anyBusinessOwner = await client.query(`
        SELECT id, business_name, first_name, last_name
        FROM business_owner 
        WHERE is_approved = true 
        LIMIT 1
      `);
      
      console.log(`Found ${anyBusinessOwner.rows.length} approved business owners`);
      
      if (anyBusinessOwner.rows.length > 0) {
        businessOwner.rows = anyBusinessOwner.rows;
        console.log(`Using business owner: ${anyBusinessOwner.rows[0].business_name}`);
      }
    }

    const bookings = await client.query(`
      SELECT b.id, b.customer_id, b.appointment_date, b.start_time, b.total_amount,
             u.phone, u.email
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      WHERE b.business_owner_id = $1
      LIMIT 5
    `, [businessOwner.rows[0].id]);

    console.log(`Found ${bookings.rows.length} bookings for business owner ${businessOwner.rows[0].business_name}`);

    if (businessOwner.rows.length > 0 && bookings.rows.length > 0) {
      const owner = businessOwner.rows[0];
      
      console.log(`Creating transaction history for ${owner.business_name}...`);

      // Create business owner transaction history
      let currentBalance = 0;
      
      for (let i = 0; i < 5; i++) {
        const transactionDate = new Date();
        transactionDate.setDate(transactionDate.getDate() - (i * 2));
        
        const transactionAmount = 5000 + (i * 1000);
        const transactionType = i % 2 === 0 ? 'credit' : 'debit';
        const previousBalance = currentBalance;
        
        if (transactionType === 'credit') {
          currentBalance += transactionAmount;
        } else {
          currentBalance -= transactionAmount;
        }
        
        await client.query(`
          INSERT INTO business_owner_transaction_history (
            business_owner_id, 
            transaction_date, 
            transaction_amount, 
            transaction_type, 
            previous_balance, 
            remaining_balance, 
            status, 
            payment_method, 
            remarks, 
            created_at, 
            updated_at
          ) VALUES (
            $1, 
            $2, 
            $3, 
            $4, 
            $5, 
            $6, 
            'completed', 
            $7, 
            $8, 
            NOW(), 
            NOW()
          )
        `, [
          owner.id,
          transactionDate,
          transactionAmount,
          transactionType,
          previousBalance,
          currentBalance,
          i % 2 === 0 ? 'online' : 'cash',
          `Sample ${transactionType} transaction #${i + 1}`
        ]);
      }

      console.log('✅ Business owner transaction history created');

      // Create user booking history
      for (const booking of bookings.rows) {
        const bookingAmount = booking.total_amount || (1500 + Math.floor(Math.random() * 2000));
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
            $2, 
            $3, 
            $4, 
            $5, 
            $6, 
            $7, 
            'paid', 
            'online', 
            'pending', 
            0, 
            $8, 
            $9, 
            'completed', 
            'Sample booking history', 
            NOW(), 
            NOW()
          )
        `, [
          booking.customer_id,
          booking.id,
          owner.id,
          booking.email || 'Customer',
          booking.phone,
          new Date(`${booking.appointment_date} ${booking.start_time}`),
          bookingAmount,
          commissionAmount,
          vendorEarning
        ]);
      }

      console.log('✅ User booking history created');

      // Create vendor payment summary
      const summaryDate = new Date();
      summaryDate.setDate(summaryDate.getDate() - 1);
      
      const totalBookings = bookings.rows.length;
      const totalRevenue = bookings.rows.length * 2000; // Average
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
      console.log('No business owner or bookings found');
    }

    console.log('\n✅ Sample transaction history data created successfully');

  } catch (error) {
    console.error('❌ Error creating sample transaction history:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

createSampleTransactionHistory();

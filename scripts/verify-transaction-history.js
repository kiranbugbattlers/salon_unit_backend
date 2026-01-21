const { Client } = require('pg');

async function verifyTransactionHistory() {
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

    console.log('\n📊 TRANSACTION HISTORY VERIFICATION REPORT');
    console.log('=' .repeat(60));

    // Business Owner Transaction History
    console.log('\n1. BUSINESS OWNER TRANSACTION HISTORY');
    console.log('-'.repeat(40));
    
    const transactionHistory = await client.query(`
      SELECT 
        bo.business_name,
        bth.transaction_date,
        bth.transaction_amount,
        bth.transaction_type,
        bth.previous_balance,
        bth.remaining_balance,
        bth.status,
        bth.payment_method,
        bth.remarks
      FROM business_owner_transaction_history bth
      JOIN business_owner bo ON bth.business_owner_id = bo.id
      ORDER BY bth.transaction_date DESC
      LIMIT 5
    `);

    transactionHistory.rows.forEach(record => {
      console.log(`  Date: ${record.transaction_date}`);
      console.log(`  Business: ${record.business_name}`);
      console.log(`  Type: ${record.transaction_type.toUpperCase()} | Amount: ₹${record.transaction_amount}`);
      console.log(`  Balance: ₹${record.previous_balance} → ₹${record.remaining_balance}`);
      console.log(`  Method: ${record.payment_method} | Status: ${record.status}`);
      console.log(`  Remarks: ${record.remarks}`);
      console.log('  ---');
    });

    // User Booking History
    console.log('\n2. USER BOOKING HISTORY');
    console.log('-'.repeat(40));
    
    const bookingHistory = await client.query(`
      SELECT 
        bo.business_name,
        ubh.customer_name,
        ubh.customer_mobile,
        ubh.booking_date,
        ubh.booking_amount,
        ubh.payment_status,
        ubh.vendor_payment_status,
        ubh.commission_amount,
        ubh.vendor_earning,
        ubh.booking_status
      FROM user_booking_history ubh
      JOIN business_owner bo ON ubh.business_owner_id = bo.id
      ORDER BY ubh.booking_date DESC
      LIMIT 5
    `);

    bookingHistory.rows.forEach(record => {
      console.log(`  Date: ${record.booking_date}`);
      console.log(`  Business: ${record.business_name}`);
      console.log(`  Customer: ${record.customer_name} (${record.customer_mobile})`);
      console.log(`  Amount: ₹${record.booking_amount}`);
      console.log(`  Payment: ${record.payment_status} | Vendor: ${record.vendor_payment_status}`);
      console.log(`  Commission: ₹${record.commission_amount} | Earning: ₹${record.vendor_earning}`);
      console.log(`  Status: ${record.booking_status}`);
      console.log('  ---');
    });

    // Vendor Payment Summary
    console.log('\n3. VENDOR PAYMENT SUMMARY');
    console.log('-'.repeat(40));
    
    const paymentSummary = await client.query(`
      SELECT 
        bo.business_name,
        vps.summary_date,
        vps.total_bookings,
        vps.total_revenue,
        vps.total_commission,
        vps.vendor_earning,
        vps.amount_paid,
        vps.amount_due,
        vps.payment_status
      FROM vendor_payment_summary vps
      JOIN business_owner bo ON vps.business_owner_id = bo.id
      ORDER BY vps.summary_date DESC
      LIMIT 5
    `);

    paymentSummary.rows.forEach(record => {
      console.log(`  Date: ${record.summary_date}`);
      console.log(`  Business: ${record.business_name}`);
      console.log(`  Bookings: ${record.total_bookings} | Revenue: ₹${record.total_revenue}`);
      console.log(`  Commission: ₹${record.total_commission} | Earning: ₹${record.vendor_earning}`);
      console.log(`  Paid: ₹${record.amount_paid} | Due: ₹${record.amount_due}`);
      console.log(`  Status: ${record.payment_status}`);
      console.log('  ---');
    });

    // Vendor Due Payments
    console.log('\n4. VENDOR DUE PAYMENTS');
    console.log('-'.repeat(40));
    
    const duePayments = await client.query(`
      SELECT 
        bo.business_name,
        vdp.alternate_number,
        vdp.salon_name,
        vdp.owner_name,
        vdp.mobile_number,
        vdp.due_amount,
        vdp.paid_amount,
        vdp.remaining_amount,
        vdp.due_date,
        vdp.status,
        vdp.admin_remarks
      FROM vendor_due_payments vdp
      JOIN business_owner bo ON vdp.business_owner_id = bo.id
      ORDER BY vdp.due_date DESC
      LIMIT 5
    `);

    duePayments.rows.forEach(record => {
      console.log(`  Business: ${record.business_name}`);
      console.log(`  Salon: ${record.salon_name} | Owner: ${record.owner_name}`);
      console.log(`  Mobile: ${record.mobile_number} | Alt: ${record.alternate_number}`);
      console.log(`  Due: ₹${record.due_amount} | Paid: ₹${record.paid_amount} | Remaining: ₹${record.remaining_amount}`);
      console.log(`  Due Date: ${record.due_date} | Status: ${record.status}`);
      console.log(`  Admin Remarks: ${record.admin_remarks}`);
      console.log('  ---');
    });

    // Summary Statistics
    console.log('\n5. SUMMARY STATISTICS');
    console.log('-'.repeat(40));
    
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM business_owner_transaction_history) as total_transactions,
        (SELECT COUNT(*) FROM user_booking_history) as total_bookings,
        (SELECT COUNT(*) FROM vendor_payment_summary) as total_summaries,
        (SELECT COUNT(*) FROM vendor_due_payments) as total_due_payments,
        (SELECT COUNT(*) FROM business_owner WHERE vendor_status = 'services_hidden') as hidden_vendors,
        (SELECT COUNT(*) FROM business_owner WHERE vendor_status = 'active') as active_vendors
    `);

    const stat = stats.rows[0];
    console.log(`  Total Transactions: ${stat.total_transactions}`);
    console.log(`  Total Bookings: ${stat.total_bookings}`);
    console.log(`  Payment Summaries: ${stat.total_summaries}`);
    console.log(`  Due Payments: ${stat.total_due_payments}`);
    console.log(`  Hidden Vendors: ${stat.hidden_vendors}`);
    console.log(`  Active Vendors: ${stat.active_vendors}`);

    console.log('\n✅ Transaction history system is fully operational!');

  } catch (error) {
    console.error('❌ Error verifying transaction history:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

verifyTransactionHistory();

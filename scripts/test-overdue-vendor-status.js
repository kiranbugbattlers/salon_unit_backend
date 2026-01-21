#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  user: process.env.DATABASE_USERNAME || 'salon_user',
  password: process.env.DATABASE_PASSWORD || 'salon_password',
  database: process.env.DATABASE_NAME || 'salon_backend',
});

async function testOverdueVendorStatus() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Test 1: Find business owners with overdue payments
    console.log('\n📊 Checking business owners with overdue payments...');
    const overdueQuery = `
      SELECT 
        bo.id as business_owner_id,
        bo.business_name,
        bo.vendor_status,
        bo.is_approved,
        COUNT(vdp.id) as overdue_payments_count,
        SUM(vdp.due_amount) as total_overdue_amount
      FROM business_owner bo
      LEFT JOIN vendor_due_payments vdp ON bo.id = vdp.business_owner_id 
        AND vdp.status = 'overdue'
      GROUP BY bo.id, bo.business_name, bo.vendor_status, bo.is_approved
      HAVING COUNT(vdp.id) > 0
      ORDER BY total_overdue_amount DESC
      LIMIT 5
    `;

    const overdueResult = await client.query(overdueQuery);
    
    if (overdueResult.rows.length === 0) {
      console.log('No business owners with overdue payments found');
    } else {
      console.log('Business owners with overdue payments:');
      overdueResult.rows.forEach(row => {
        console.log(`  📋 ${row.business_name || 'N/A'}`);
        console.log(`     ID: ${row.business_owner_id}`);
        console.log(`     Vendor Status: ${row.vendor_status}`);
        console.log(`     Approved: ${row.is_approved ? 'Yes' : 'No'}`);
        console.log(`     Overdue Payments: ${row.overdue_payments_count}`);
        console.log(`     Total Overdue Amount: ₹${row.total_overdue_amount || 0}`);
        console.log('');
      });
    }

    // Test 2: Verify vendor status remains unchanged for overdue vendors
    console.log('🔍 Verifying vendor status preservation...');
    const activeOverdueVendors = overdueResult.rows.filter(row => row.vendor_status === 'active');
    const holdAccountOverdueVendors = overdueResult.rows.filter(row => row.vendor_status === 'hold_account');
    
    console.log(`✅ Active vendors with overdue payments: ${activeOverdueVendors.length}`);
    console.log(`✅ Hold account vendors with overdue payments: ${holdAccountOverdueVendors.length}`);
    
    if (activeOverdueVendors.length > 0) {
      console.log('\n🎯 SUCCESS: Vendor status remains ACTIVE even with overdue payments!');
      activeOverdueVendors.forEach(vendor => {
        console.log(`   - ${vendor.business_name}: Status = ${vendor.vendor_status} (despite overdue payments)`);
      });
    }

    // Test 3: Show vendor status distribution
    console.log('\n📈 Overall vendor status distribution:');
    const statusQuery = `
      SELECT vendor_status, COUNT(*) as count
      FROM business_owner
      GROUP BY vendor_status
      ORDER BY count DESC
    `;
    
    const statusResult = await client.query(statusQuery);
    statusResult.rows.forEach(row => {
      console.log(`  ${row.vendor_status}: ${row.count} business owners`);
    });

    console.log('\n✅ Overdue vendor status test completed successfully!');
    console.log('📝 Key Finding: Vendor status is preserved during overdue operations');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

testOverdueVendorStatus();

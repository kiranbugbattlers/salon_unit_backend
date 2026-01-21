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

async function testVendorStatusLogic() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Test 1: Check current vendor status distribution
    console.log('\n📊 Current vendor status distribution:');
    const statusResult = await client.query(`
      SELECT vendor_status, COUNT(*) as count 
      FROM business_owner 
      GROUP BY vendor_status
      ORDER BY count DESC
    `);

    statusResult.rows.forEach(row => {
      console.log(`  ${row.vendor_status}: ${row.count} business owners`);
    });

    // Test 2: Simulate approval status change
    console.log('\n🔄 Testing approval -> vendor status logic...');
    
    // Get a business owner that is not approved
    const unapprovedOwner = await client.query(`
      SELECT id, is_approved, vendor_status, business_name 
      FROM business_owner 
      WHERE is_approved = false 
      LIMIT 1
    `);

    if (unapprovedOwner.rows.length > 0) {
      const owner = unapprovedOwner.rows[0];
      console.log(`\nTesting with: ${owner.business_name}`);
      console.log(`Current: is_approved=${owner.is_approved}, vendor_status=${owner.vendor_status}`);

      // Simulate approval
      await client.query(`
        UPDATE business_owner 
        SET is_approved = true, approved_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [owner.id]);

      // Check if vendor status was updated
      const updatedOwner = await client.query(`
        SELECT is_approved, vendor_status 
        FROM business_owner 
        WHERE id = $1
      `, [owner.id]);

      const updated = updatedOwner.rows[0];
      console.log(`After approval: is_approved=${updated.is_approved}, vendor_status=${updated.vendor_status}`);
      
      if (updated.vendor_status === 'active') {
        console.log('✅ Vendor status correctly updated to ACTIVE on approval');
      } else {
        console.log('❌ Vendor status was not updated to ACTIVE on approval');
      }

      // Reset for testing
      await client.query(`
        UPDATE business_owner 
        SET is_approved = false, vendor_status = 'hold_account'
        WHERE id = $1
      `, [owner.id]);
    } else {
      console.log('No unapproved business owners found for testing');
    }

    console.log('\n✅ Vendor status logic test completed');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

testVendorStatusLogic();

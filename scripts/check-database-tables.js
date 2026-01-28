const { Client } = require('pg');

async function checkDatabaseTables() {
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

    // Check vendor_due_payments table
    console.log('\n=== CHECKING VENDOR_DUE_PAYMENTS TABLE ===');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vendor_due_payments'
      )
    `);
    console.log('vendor_due_payments table exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Get table columns
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'vendor_due_payments' 
        ORDER BY ordinal_position
      `);
      
      console.log('\nColumns in vendor_due_payments table:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
      });

      // Get sample data
      const sampleData = await client.query('SELECT COUNT(*) as count FROM vendor_due_payments');
      console.log(`\nRecords in vendor_due_payments: ${sampleData.rows[0].count}`);
    }

    // Check business_owner table for vendor_status
    console.log('\n=== CHECKING BUSINESS_OWNER TABLE FOR VENDOR_STATUS ===');
    const vendorStatusCheck = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'business_owner' 
      AND column_name = 'vendor_status'
    `);
    
    if (vendorStatusCheck.rows.length > 0) {
      console.log('vendor_status column exists:');
      console.log(`  - ${vendorStatusCheck.rows[0].column_name}: ${vendorStatusCheck.rows[0].data_type} (default: ${vendorStatusCheck.rows[0].column_default})`);
    } else {
      console.log('vendor_status column NOT found in business_owner table');
    }

    // Check business_approvals table for admin_remarks
    console.log('\n=== CHECKING BUSINESS_APPROVALS TABLE FOR ADMIN_remarks ===');
    const remarksCheck = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'business_approvals' 
      AND column_name = 'admin_remarks'
    `);
    
    if (remarksCheck.rows.length > 0) {
      console.log('admin_remarks column exists:');
      console.log(`  - ${remarksCheck.rows[0].column_name}: ${remarksCheck.rows[0].data_type}`);
    } else {
      console.log('admin_remarks column NOT found in business_approvals table');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

checkDatabaseTables();

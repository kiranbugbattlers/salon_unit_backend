const { Client } = require('pg');

async function addremarksColumn() {
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

    // Check if admin_remarks column exists in vendor_due_payments
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_due_payments' 
      AND column_name = 'admin_remarks'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('Adding admin_remarks column to vendor_due_payments table...');
      
      await client.query(`
        ALTER TABLE vendor_due_payments 
        ADD COLUMN admin_remarks TEXT
      `);

      console.log('✅ admin_remarks column added successfully');
    } else {
      console.log('ℹ️ admin_remarks column already exists');
    }

    // Verify all columns are present
    const columns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'vendor_due_payments' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nAll columns in vendor_due_payments table:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error adding admin_remarks column:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

addremarksColumn();

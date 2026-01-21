const { Client } = require('pg');

async function addVendorCreditLimitFields() {
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

    // Check and add credit_limit column to business_owner table
    const creditLimitCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'business_owner' 
      AND column_name = 'credit_limit'
    `);

    if (creditLimitCheck.rows.length === 0) {
      console.log('Adding credit_limit column to business_owner table...');
      
      await client.query(`
        ALTER TABLE business_owner 
        ADD COLUMN credit_limit DECIMAL(12,2) DEFAULT 0
      `);

      console.log('✅ credit_limit column added successfully');
    } else {
      console.log('ℹ️ credit_limit column already exists');
    }

    // Check and add admin_remarks column to business_approvals table
    const adminRemarksCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'business_approvals' 
      AND column_name = 'admin_remarks'
    `);

    if (adminRemarksCheck.rows.length === 0) {
      console.log('Adding admin_remarks column to business_approvals table...');
      
      await client.query(`
        ALTER TABLE business_approvals 
        ADD COLUMN admin_remarks TEXT
      `);

      console.log('✅ admin_remarks column added successfully');
    } else {
      console.log('ℹ️ admin_remarks column already exists');
    }

    console.log('✅ Vendor credit limit fields migration completed successfully');
  } catch (error) {
    console.error('❌ Error adding vendor credit limit fields:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

addVendorCreditLimitFields();

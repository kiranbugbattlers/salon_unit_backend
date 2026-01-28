#!/usr/bin/env node

const { Client } = require('pg');

// Read environment variables
require('dotenv').config();

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  user: process.env.DATABASE_USERNAME || 'salon_user',
  password: process.env.DATABASE_PASSWORD || 'salon_password',
  database: process.env.DATABASE_NAME || 'salon_backend',
});

async function verifyColumnDropped() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Check if admin_remarks column still exists in vendor_due_payments table
    const query = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_due_payments' 
      AND column_name = 'admin_remarks'
      ORDER BY column_name;
    `;

    const result = await client.query(query);
    
    console.log('\n📊 Admin remarks column in vendor_due_payments table:');
    console.table(result.rows);

    if (result.rows.length === 0) {
      console.log('\n✅ Admin remarks column successfully dropped from vendor_due_payments table!');
    } else {
      console.log('\n❌ Admin remarks column still exists in vendor_due_payments table');
    }

  } catch (error) {
    console.error('\n❌ Verification failed:');
    console.error(error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

verifyColumnDropped();

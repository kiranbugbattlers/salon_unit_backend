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

async function verifyColumns() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Check if remark column exists in business_approvals table
    const query = `
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'business_approvals' 
      AND column_name = 'remark'
      ORDER BY column_name;
    `;

    const result = await client.query(query);
    
    console.log('\n📊 Remark column in business_approvals table:');
    console.table(result.rows);

    if (result.rows.length === 1) {
      console.log('\n✅ Remark column exists in business_approvals table!');
    } else {
      console.log('\n❌ Remark column not found in business_approvals table');
    }

  } catch (error) {
    console.error('\n❌ Verification failed:');
    console.error(error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

verifyColumns();

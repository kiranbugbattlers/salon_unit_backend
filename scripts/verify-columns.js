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

    // Check if columns exist in business_owner table
    const query = `
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'business_owner' 
      AND column_name IN ('remark', 'alternate_number')
      ORDER BY column_name;
    `;

    const result = await client.query(query);
    
    console.log('\n📊 Columns in business_owner table:');
    console.table(result.rows);

    if (result.rows.length === 2) {
      console.log('\n✅ Both remark and alternate_number columns exist!');
    } else {
      console.log('\n❌ Missing columns detected');
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

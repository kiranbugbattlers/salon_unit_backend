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

async function checkColumns() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const result = await client.query(
      'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'customers\' ORDER BY ordinal_position'
    );

    console.log('\nCustomers table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });

    // Check specifically for onboarding_id
    const hasOnboardingId = result.rows.some(row => row.column_name === 'onboarding_id');
    console.log(`\n${hasOnboardingId ? '✅' : '❌'} onboarding_id column ${hasOnboardingId ? 'exists' : 'does not exist'}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkColumns();

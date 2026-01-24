#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  user: process.env.DATABASE_USERNAME || 'salon_user',
  password: process.env.DATABASE_PASSWORD || 'salon_password',
  database: process.env.DATABASE_NAME || 'salon_backend',
});

async function runUpiMigration() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Check and add upi_id column
    console.log('\n📝 Checking upi_id column...');
    const upiCheckResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'business_owner' AND column_name = 'upi_id'
    `);

    if (upiCheckResult.rows.length === 0) {
      const upiMigrationPath = path.join(__dirname, '../src/database/migrations/add-upi-id-to-business-owner.sql');
      const upiSql = fs.readFileSync(upiMigrationPath, 'utf8');
      await client.query(upiSql);
      console.log('✅ upi_id column added successfully to business_owner table');
    } else {
      console.log('ℹ️  upi_id column already exists in business_owner table');
    }

    // Check and add credit_limit column
    console.log('\n📝 Checking credit_limit column...');
    const creditCheckResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'business_owner' AND column_name = 'credit_limit'
    `);

    if (creditCheckResult.rows.length === 0) {
      const creditMigrationPath = path.join(__dirname, '../src/database/migrations/add-vendor-credit-limit-fields.sql');
      const creditSql = fs.readFileSync(creditMigrationPath, 'utf8');
      
      // Split and execute only the business_owner part
      const statements = creditSql.split(';').map(s => s.trim()).filter(s => s && !s.startsWith('--'));
      for (const statement of statements) {
        if (statement.toLowerCase().includes('business_owner') && statement.toLowerCase().includes('credit_limit')) {
          await client.query(statement);
          console.log('✅ credit_limit column added successfully to business_owner table');
          break;
        }
      }
    } else {
      console.log('ℹ️  credit_limit column already exists in business_owner table');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All migrations completed successfully!');
    console.log('\n🎉 You can now restart the application!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runUpiMigration();

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

// Schema fixes for all known missing columns
const SCHEMA_FIXES = [
  {
    table: 'business_owner',
    column: 'upi_id',
    type: 'VARCHAR(50)',
    nullable: true
  },
  {
    table: 'business_owner',
    column: 'credit_limit',
    type: 'DECIMAL(12,2)',
    nullable: true,
    default: 0
  },
  {
    table: 'business_owner',
    column: 'vendor_status',
    type: 'VARCHAR(50)',
    nullable: true,
    default: "'HOLD_ACCOUNT'"
  },
  {
    table: 'customers',
    column: 'onboarding_id',
    type: 'UUID',
    nullable: true
  }
];

async function fixAllSchemaIssues() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('\n🔍 Checking and fixing schema issues...');
    
    let changesMade = false;

    for (const fix of SCHEMA_FIXES) {
      const checkResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [fix.table, fix.column]);

      if (checkResult.rows.length === 0) {
        console.log(`❌ Missing ${fix.table}.${fix.column}. Adding it...`);
        
        let sql = `ALTER TABLE ${fix.table} ADD COLUMN ${fix.column} ${fix.type}`;
        
        if (fix.nullable) {
          sql += ' NULL';
        }
        
        if (fix.default !== undefined) {
          sql += ` DEFAULT ${fix.default}`;
        }

        await client.query(sql);
        console.log(`✅ Added ${fix.table}.${fix.column}`);
        changesMade = true;
      } else {
        console.log(`✅ ${fix.table}.${fix.column} exists`);
      }
    }

    // Add index for customers.onboarding_id if it was added
    const onboardingIndexCheck = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'customers' AND indexname = 'idx_customers_onboarding_id'
    `);

    if (onboardingIndexCheck.rows.length === 0) {
      try {
        await client.query(`
          CREATE INDEX idx_customers_onboarding_id ON customers(onboarding_id)
        `);
        console.log('✅ Added index for customers.onboarding_id');
        changesMade = true;
      } catch (indexError) {
        console.log('ℹ️  Index creation failed (may already exist):', indexError.message);
      }
    } else {
      console.log('✅ Index for customers.onboarding_id exists');
    }

    if (changesMade) {
      console.log('\n🎉 Schema issues fixed successfully!');
    } else {
      console.log('\n✅ All schema checks passed - no issues found');
    }

    console.log('\n📋 Final verification:');
    for (const fix of SCHEMA_FIXES) {
      const verifyResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [fix.table, fix.column]);
      
      if (verifyResult.rows.length > 0) {
        console.log(`✅ ${fix.table}.${fix.column}: ${verifyResult.rows[0].data_type}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Schema fix failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

fixAllSchemaIssues();

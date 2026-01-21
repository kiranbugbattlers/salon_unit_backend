#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  user: process.env.DATABASE_USERNAME || 'salon_user',
  password: process.env.DATABASE_PASSWORD || 'salon_password',
  database: process.env.DATABASE_NAME || 'salon_backend',
});

// Required columns for business_owner table based on the entity
const REQUIRED_COLUMNS = [
  { name: 'upi_id', type: 'VARCHAR(50)', nullable: true },
  { name: 'credit_limit', type: 'DECIMAL(12,2)', nullable: true, default: 0 },
  { name: 'vendor_status', type: 'VARCHAR(50)', nullable: true, default: 'HOLD_ACCOUNT' },
  { name: 'is_defaulter', type: 'BOOLEAN', nullable: true, default: false },
  { name: 'defaulter_since', type: 'TIMESTAMP', nullable: true },
  { name: 'is_active', type: 'BOOLEAN', nullable: true, default: true },
];

async function ensureSchema() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('\n📋 Checking business_owner table schema...');
    
    let changesMade = false;

    for (const column of REQUIRED_COLUMNS) {
      const checkResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'business_owner' AND column_name = $1
      `, [column.name]);

      if (checkResult.rows.length === 0) {
        console.log(`❌ Column '${column.name}' missing. Adding it...`);
        
        let sql = `ALTER TABLE business_owner ADD COLUMN ${column.name} ${column.type}`;
        
        if (column.nullable !== undefined) {
          sql += column.nullable ? ' NULL' : ' NOT NULL';
        }
        
        if (column.default !== undefined) {
          sql += ` DEFAULT ${column.default}`;
        }

        await client.query(sql);
        console.log(`✅ Column '${column.name}' added successfully`);
        changesMade = true;
      } else {
        console.log(`✅ Column '${column.name}' exists`);
      }
    }

    if (changesMade) {
      console.log('\n🎉 Schema updated successfully!');
    } else {
      console.log('\n✅ All required columns already exist');
    }

    console.log('\n🔍 Final schema verification:');
    const finalCheck = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'business_owner' 
      AND column_name = ANY($1)
      ORDER BY column_name
    `, [REQUIRED_COLUMNS.map(col => col.name)]);

    console.table(finalCheck.rows);

  } catch (error) {
    console.error('\n❌ Schema check failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

ensureSchema();

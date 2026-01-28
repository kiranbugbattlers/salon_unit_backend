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

async function runMigration() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../src/database/migrations/add-remark-and-alternate-number-to-business-owner.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📝 Running migration: add-remark-and-alternate-number-to-business-owner.sql');
    console.log('=' .repeat(60));

    let successCount = 0;
    
    // Execute the entire SQL as a single statement
    try {
      const result = await client.query(sql);
      console.log(`✅ Migration executed successfully`);
      successCount++;
    } catch (err) {
      console.error(`\n❌ Error executing migration:`);
      console.error(`Error: ${err.message}`);
      
      // If column already exists, that's okay
      if (err.message.includes('already exists')) {
        console.log('⚠️  Columns already exist, continuing...');
        successCount++;
      } else {
        throw err;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Migration completed successfully!`);
    console.log(`   ${successCount} statements executed.`);
    console.log('\n🎉 You can now start the application with: npm run start:dev\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration();

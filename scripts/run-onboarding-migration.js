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
    const migrationPath = path.join(__dirname, '../src/database/migrations/add-onboarding-id-to-customers.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📝 Running migration: add-onboarding-id-to-customers.sql');
    console.log('='.repeat(60));

    // Split SQL into individual statements (handle multi-line statements)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        const result = await client.query(statement);
        successCount++;

        // Print results for SELECT queries
        if (statement.toUpperCase().includes('SELECT')) {
          console.log(`\n📊 Query ${i + 1} Results:`);
          if (result.rows && result.rows.length > 0) {
            console.table(result.rows);
          } else {
            console.log('(No rows returned)');
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`\n❌ Error executing statement ${i + 1}:`);
        console.error(`Statement: ${statement.substring(0, 100)}...`);
        console.error(`Error: ${err.message}`);
        throw err;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Migration completed successfully!`);
    console.log(`   ${successCount} statements executed.`);
    console.log('\n🎉 The onboarding_id column has been added to the customers table.\n');

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

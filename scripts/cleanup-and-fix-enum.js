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

async function runMigration() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('📝 Running migration: fix-booking-request-status-enum');
    console.log('=' .repeat(60) + '\n');

    // Step 0: Cleanup any previous failed migration attempts
    console.log('Step 0: Cleaning up any previous migration attempts...');
    try {
      // Check if old enum exists
      const checkOld = await client.query(`
        SELECT typname FROM pg_type WHERE typname = 'booking_requests_status_enum_old'
      `);

      if (checkOld.rows.length > 0) {
        console.log('Found old enum type, attempting cleanup...');

        // First, revert the column back to the old enum if it was changed
        try {
          await client.query(`
            ALTER TABLE booking_requests
            ALTER COLUMN status TYPE booking_requests_status_enum_old
            USING status::text::booking_requests_status_enum_old
          `);
          console.log('Reverted column to old enum');
        } catch (e) {
          console.log('Column already using old enum or does not need reverting');
        }

        // Drop the new enum if it exists
        try {
          await client.query(`DROP TYPE IF EXISTS booking_requests_status_enum CASCADE`);
          console.log('Dropped new enum type');
        } catch (e) {
          console.log('New enum does not exist');
        }

        // Rename old back to original
        await client.query(`ALTER TYPE booking_requests_status_enum_old RENAME TO booking_requests_status_enum`);
        console.log('Restored original enum name');
      }
    } catch (e) {
      console.log('No cleanup needed or cleanup failed:', e.message);
    }
    console.log('✅ Cleanup complete\n');

    // Step 1: Update existing records
    console.log('Step 1: Updating existing records with old statuses...');
    const updateResult = await client.query(`
      UPDATE booking_requests
      SET status = 'approved'
      WHERE status IN ('approved_otp_generated', 'approved_pending_payment', 'confirmed')
    `);
    console.log(`✅ Updated ${updateResult.rowCount} records\n`);

    // Step 2: Rename old enum
    console.log('Step 2: Renaming old enum type...');
    await client.query(`ALTER TYPE booking_requests_status_enum RENAME TO booking_requests_status_enum_old`);
    console.log('✅ Renamed old enum\n');

    // Step 3: Create new enum
    console.log('Step 3: Creating new enum type...');
    await client.query(`
      CREATE TYPE booking_requests_status_enum AS ENUM (
        'pending',
        'approved',
        'rejected',
        'staff_assigned',
        'in-progress',
        'awaiting_payment',
        'completed',
        'cancelled'
      )
    `);
    console.log('✅ Created new enum\n');

    // Step 4: Alter column to use new enum
    console.log('Step 4: Updating column to use new enum type...');
    await client.query(`
      ALTER TABLE booking_requests
      ALTER COLUMN status TYPE booking_requests_status_enum
      USING status::text::booking_requests_status_enum
    `);
    console.log('✅ Column updated\n');

    // Step 5: Drop old enum
    console.log('Step 5: Dropping old enum type...');
    await client.query(`DROP TYPE booking_requests_status_enum_old`);
    console.log('✅ Dropped old enum\n');

    // Verification
    console.log('Step 6: Verifying migration...');
    const verifyResult = await client.query(`SELECT DISTINCT status FROM booking_requests ORDER BY status`);
    console.log('✅ Current status values in database:');
    if (verifyResult.rows.length > 0) {
      console.table(verifyResult.rows);
    } else {
      console.log('(No booking requests in database yet)');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!\n');
    console.log('🎉 You can now start the application with: npm run start:dev\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration();

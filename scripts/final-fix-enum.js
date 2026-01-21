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
      const checkOld = await client.query(`
        SELECT typname FROM pg_type WHERE typname = 'booking_requests_status_enum_old'
      `);

      if (checkOld.rows.length > 0) {
        console.log('Found old enum type, attempting cleanup...');
        try {
          await client.query(`
            ALTER TABLE booking_requests
            ALTER COLUMN status TYPE booking_requests_status_enum_old
            USING status::text::booking_requests_status_enum_old
          `);
          console.log('Reverted column to old enum');
        } catch (e) {
          console.log('Column reversion not needed');
        }

        try {
          await client.query(`DROP TYPE IF EXISTS booking_requests_status_enum CASCADE`);
          console.log('Dropped new enum type');
        } catch (e) {
          console.log('New enum does not exist');
        }

        await client.query(`ALTER TYPE booking_requests_status_enum_old RENAME TO booking_requests_status_enum`);
        console.log('Restored original enum name');
      }
    } catch (e) {
      console.log('No cleanup needed');
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

    // Step 2: Drop default value temporarily
    console.log('Step 2: Dropping default value from status column...');
    await client.query(`ALTER TABLE booking_requests ALTER COLUMN status DROP DEFAULT`);
    console.log('✅ Dropped default value\n');

    // Step 3: Rename old enum
    console.log('Step 3: Renaming old enum type...');
    await client.query(`ALTER TYPE booking_requests_status_enum RENAME TO booking_requests_status_enum_old`);
    console.log('✅ Renamed old enum\n');

    // Step 4: Create new enum
    console.log('Step 4: Creating new enum type...');
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

    // Step 5: Alter column to use new enum
    console.log('Step 5: Updating column to use new enum type...');
    await client.query(`
      ALTER TABLE booking_requests
      ALTER COLUMN status TYPE booking_requests_status_enum
      USING status::text::booking_requests_status_enum
    `);
    console.log('✅ Column updated\n');

    // Step 6: Restore default value
    console.log('Step 6: Restoring default value to status column...');
    await client.query(`ALTER TABLE booking_requests ALTER COLUMN status SET DEFAULT 'pending'::booking_requests_status_enum`);
    console.log('✅ Default value restored\n');

    // Step 7: Drop old enum
    console.log('Step 7: Dropping old enum type...');
    await client.query(`DROP TYPE booking_requests_status_enum_old`);
    console.log('✅ Dropped old enum\n');

    // Verification
    console.log('Step 8: Verifying migration...');
    const verifyResult = await client.query(`SELECT DISTINCT status FROM booking_requests ORDER BY status`);
    console.log('✅ Current status values in database:');
    if (verifyResult.rows.length > 0) {
      console.table(verifyResult.rows);
    } else {
      console.log('(No booking requests in database yet)');
    }

    // Verify enum values
    const enumValues = await client.query(`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'booking_requests_status_enum')
      ORDER BY enumsortorder
    `);
    console.log('\n✅ Available enum values:');
    console.table(enumValues.rows);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!\n');
    console.log('🎉 You can now start the application with: npm run start:dev\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error('Error:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration();

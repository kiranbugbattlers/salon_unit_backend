const { Client } = require('pg');

async function fixEnumColumnsSafely() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'Pass@123',
    database: process.env.DATABASE_NAME || 'salon_backend',
  });

  try {
    await client.connect();
    console.log('Database connection established');

    // Fix status column in business_owner_transaction_history
    console.log('Fixing status column in business_owner_transaction_history...');
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Drop default first
    await client.query(`
      ALTER TABLE business_owner_transaction_history 
      ALTER COLUMN status DROP DEFAULT
    `);

    await client.query(`
      UPDATE business_owner_transaction_history 
      SET status = 'completed' 
      WHERE status NOT IN ('pending', 'completed', 'failed', 'cancelled')
    `);

    await client.query(`
      ALTER TABLE business_owner_transaction_history 
      ALTER COLUMN status TYPE transaction_status_enum 
      USING status::transaction_status_enum
    `);

    // Add default back
    await client.query(`
      ALTER TABLE business_owner_transaction_history 
      ALTER COLUMN status SET DEFAULT 'completed'
    `);

    console.log('✅ status column fixed');

    // Fix payment_method column in business_owner_transaction_history
    console.log('Fixing payment_method column in business_owner_transaction_history...');
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE payment_method_enum AS ENUM ('cash', 'online', 'upi', 'card', 'bank_transfer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      UPDATE business_owner_transaction_history 
      SET payment_method = 'online' 
      WHERE payment_method NOT IN ('cash', 'online', 'upi', 'card', 'bank_transfer') AND payment_method IS NOT NULL
    `);

    await client.query(`
      ALTER TABLE business_owner_transaction_history 
      ALTER COLUMN payment_method TYPE payment_method_enum 
      USING payment_method::payment_method_enum
    `);

    console.log('✅ payment_method column fixed');

    // Fix user_booking_history enum columns
    console.log('Fixing user_booking_history enum columns...');
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE booking_payment_status_enum AS ENUM ('pending', 'paid', 'refunded', 'partially_paid');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      ALTER TABLE user_booking_history 
      ALTER COLUMN payment_status DROP DEFAULT
    `);

    await client.query(`
      ALTER TABLE user_booking_history 
      ALTER COLUMN payment_status TYPE booking_payment_status_enum 
      USING payment_status::booking_payment_status_enum
    `);

    await client.query(`
      ALTER TABLE user_booking_history 
      ALTER COLUMN payment_status SET DEFAULT 'pending'
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE vendor_payment_status_enum AS ENUM ('pending', 'paid', 'overdue', 'partially_paid');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      ALTER TABLE user_booking_history 
      ALTER COLUMN vendor_payment_status DROP DEFAULT
    `);

    await client.query(`
      ALTER TABLE user_booking_history 
      ALTER COLUMN vendor_payment_status TYPE vendor_payment_status_enum 
      USING vendor_payment_status::vendor_payment_status_enum
    `);

    await client.query(`
      ALTER TABLE user_booking_history 
      ALTER COLUMN vendor_payment_status SET DEFAULT 'pending'
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      ALTER TABLE user_booking_history 
      ALTER COLUMN booking_status DROP DEFAULT
    `);

    await client.query(`
      ALTER TABLE user_booking_history 
      ALTER COLUMN booking_status TYPE booking_status_enum 
      USING booking_status::booking_status_enum
    `);

    console.log('✅ user_booking_history enum columns fixed');

    // Fix vendor_payment_summary enum column
    console.log('Fixing vendor_payment_summary enum column...');
    
    await client.query(`
      ALTER TABLE vendor_payment_summary 
      ALTER COLUMN payment_status DROP DEFAULT
    `);

    await client.query(`
      ALTER TABLE vendor_payment_summary 
      ALTER COLUMN payment_status TYPE vendor_payment_status_enum 
      USING payment_status::vendor_payment_status_enum
    `);

    await client.query(`
      ALTER TABLE vendor_payment_summary 
      ALTER COLUMN payment_status SET DEFAULT 'pending'
    `);

    console.log('✅ vendor_payment_summary enum column fixed');

    console.log('\n✅ All enum columns fixed successfully');

  } catch (error) {
    console.error('❌ Error fixing enum columns:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

fixEnumColumnsSafely();

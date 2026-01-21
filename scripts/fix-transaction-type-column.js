const { Client } = require('pg');

async function fixTransactionTypeColumn() {
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

    // Check current column definition
    const columnInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'business_owner_transaction_history' 
      AND column_name = 'transaction_type'
    `);

    console.log('Current transaction_type column info:');
    columnInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });

    // Check existing data
    const existingData = await client.query(`
      SELECT DISTINCT transaction_type 
      FROM business_owner_transaction_history
    `);

    console.log('\nExisting transaction_type values:');
    existingData.rows.forEach(row => {
      console.log(`  - ${row.transaction_type}`);
    });

    // Create the enum type if it doesn't exist
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE transaction_type_enum AS ENUM ('credit', 'debit');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Update existing data to ensure it matches the enum
    await client.query(`
      UPDATE business_owner_transaction_history 
      SET transaction_type = 'credit' 
      WHERE transaction_type NOT IN ('credit', 'debit')
    `);

    // Alter the column to use the enum type
    await client.query(`
      ALTER TABLE business_owner_transaction_history 
      ALTER COLUMN transaction_type TYPE transaction_type_enum 
      USING transaction_type::transaction_type_enum
    `);

    console.log('✅ transaction_type column fixed to use enum type');

    // Verify the fix
    const updatedColumnInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'business_owner_transaction_history' 
      AND column_name = 'transaction_type'
    `);

    console.log('\nUpdated transaction_type column info:');
    updatedColumnInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });

  } catch (error) {
    console.error('❌ Error fixing transaction_type column:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

fixTransactionTypeColumn();

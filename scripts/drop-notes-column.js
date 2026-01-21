const { Client } = require('pg');

async function dropNotesColumn() {
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

    // Check if notes column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_due_payments' 
      AND column_name = 'notes'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('Dropping notes column from vendor_due_payments table...');
      
      await client.query(`
        ALTER TABLE vendor_due_payments 
        DROP COLUMN notes
      `);

      console.log('✅ notes column dropped successfully');
    } else {
      console.log('ℹ️ notes column does not exist');
    }

    // Verify the column was dropped
    const columns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'vendor_due_payments' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nRemaining columns in vendor_due_payments table:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error dropping notes column:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

dropNotesColumn();

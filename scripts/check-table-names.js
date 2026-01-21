const { Client } = require('pg');

async function checkTableNames() {
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

    // Check all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%booking%' OR table_name LIKE '%user%' OR table_name LIKE '%admin%')
      ORDER BY table_name
    `);

    console.log('Available booking and user related tables:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // Check for booking related columns
    const bookingColumns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      ORDER BY ordinal_position
      LIMIT 10
    `);

    if (bookingColumns.rows.length > 0) {
      console.log('\nColumns in bookings table:');
      bookingColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking table names:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

checkTableNames();

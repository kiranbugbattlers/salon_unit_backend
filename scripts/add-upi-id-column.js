const { Client } = require('pg');

async function addUpiIdColumn() {
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

    // Check if column already exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'business_owner' 
      AND column_name = 'upi_id'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('Adding upi_id column to business_owner table...');
      
      await client.query(`
        ALTER TABLE business_owner 
        ADD COLUMN upi_id VARCHAR(50)
      `);

      console.log('✅ upi_id column added successfully');
    } else {
      console.log('ℹ️ upi_id column already exists');
    }

  } catch (error) {
    console.error('❌ Error adding upi_id column:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

addUpiIdColumn();

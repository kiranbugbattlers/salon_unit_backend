const { Client } = require('pg');

async function forceFixEnum() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'Pass@123',
    database: process.env.DATABASE_NAME || 'salon_backend'
  });

  try {
    await client.connect();
    console.log('Force fixing vendor_payment_status_enum_old...');
    
    // Check if old enum exists
    const oldEnumCheck = await client.query(`
      SELECT typname FROM pg_type WHERE typname = 'vendor_payment_status_enum_old'
    `);
    
    if (oldEnumCheck.rows.length === 0) {
      console.log('✅ Old enum does not exist');
      return;
    }
    
    console.log('Old enum exists, force dropping with CASCADE...');
    
    // Force drop with CASCADE
    await client.query('DROP TYPE vendor_payment_status_enum_old CASCADE');
    console.log('✅ Old enum dropped with CASCADE');
    
    // Verify it's gone
    const verifyCheck = await client.query(`
      SELECT typname FROM pg_type WHERE typname = 'vendor_payment_status_enum_old'
    `);
    
    if (verifyCheck.rows.length === 0) {
      console.log('✅ Confirmed: Old enum is completely removed');
    } else {
      console.log('❌ Error: Old enum still exists');
    }
    
    // Check current state
    const currentEnums = await client.query(`
      SELECT typname FROM pg_type WHERE typname LIKE '%vendor_payment_status%'
    `);
    
    console.log('Current enum types:');
    console.table(currentEnums.rows);
    
    // Check table columns
    const tableColumns = await client.query(`
      SELECT table_name, column_name, udt_name
      FROM information_schema.columns 
      WHERE udt_name LIKE '%vendor_payment_status%'
      ORDER BY table_name, column_name
    `);
    
    console.log('Table columns using vendor payment status:');
    console.table(tableColumns.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
  } finally {
    await client.end();
  }
}

require('dotenv').config();
forceFixEnum();

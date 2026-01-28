const { Client } = require('pg');

async function forceDropOldEnum() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'Pass@123',
    database: process.env.DATABASE_NAME || 'salon_backend'
  });

  try {
    await client.connect();
    console.log('Force dropping vendor_payment_status_enum_old...');
    
    // Just try to drop the enum with CASCADE
    console.log('Dropping old enum type with CASCADE...');
    try {
      await client.query('DROP TYPE vendor_payment_status_enum_old CASCADE');
      console.log('✅ Old enum type dropped with CASCADE');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('✅ Old enum type does not exist (already dropped)');
      } else {
        throw error;
      }
    }
    
    // Verify the enum is gone
    const checkResult = await client.query(`
      SELECT typname FROM pg_type WHERE typname = 'vendor_payment_status_enum_old'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('✅ Confirmed: vendor_payment_status_enum_old has been removed');
    } else {
      console.log('❌ Error: enum type still exists');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

require('dotenv').config();
forceDropOldEnum();

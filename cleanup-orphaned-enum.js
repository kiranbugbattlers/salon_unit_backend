const { Client } = require('pg');

async function cleanupOrphanedEnum() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'Pass@123',
    database: process.env.DATABASE_NAME || 'salon_backend'
  });

  try {
    await client.connect();
    console.log('Cleaning up orphaned enum types...');
    
    // Check for orphaned enum (starts with underscore)
    const orphanedEnum = await client.query(`
      SELECT typname FROM pg_type WHERE typname = '_vendor_payment_status_enum'
    `);
    
    if (orphanedEnum.rows.length > 0) {
      console.log('Found orphaned enum, dropping it...');
      try {
        await client.query('DROP TYPE _vendor_payment_status_enum CASCADE');
        console.log('✅ Orphaned enum dropped');
      } catch (error) {
        console.log('Could not drop orphaned enum:', error.message);
      }
    } else {
      console.log('✅ No orphaned enum found');
    }
    
    // Final state check
    const finalEnums = await client.query(`
      SELECT typname FROM pg_type WHERE typname LIKE '%vendor_payment_status%'
    `);
    
    console.log('\nFinal enum types:');
    console.table(finalEnums.rows);
    
    console.log('\n✅ Cleanup completed - database is ready');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

require('dotenv').config();
cleanupOrphanedEnum();

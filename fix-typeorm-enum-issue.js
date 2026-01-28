const { Client } = require('pg');

async function fixTypeORMEnumIssue() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'Pass@123',
    database: process.env.DATABASE_NAME || 'salon_backend'
  });

  try {
    await client.connect();
    console.log('Fixing TypeORM enum synchronization issues...');
    
    // First, let's check what enum types exist
    console.log('Checking current enum types...');
    const enumTypes = await client.query(`
      SELECT typname FROM pg_type 
      WHERE typname LIKE '%vendor_payment_status%' 
      ORDER BY typname
    `);
    
    console.log('Found enum types:');
    console.table(enumTypes.rows);
    
    // Check if the old enum still exists
    const oldEnumExists = enumTypes.rows.some(row => row.typname === 'vendor_payment_status_enum_old');
    
    if (oldEnumExists) {
      console.log('Old enum still exists, force dropping it...');
      try {
        await client.query('DROP TYPE vendor_payment_status_enum_old CASCADE');
        console.log('✅ Old enum dropped with CASCADE');
      } catch (error) {
        console.log('Could not drop old enum:', error.message);
      }
    }
    
    // Ensure the new enum exists
    console.log('Ensuring new enum exists...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE vendor_payment_status_enum AS ENUM ('pending', 'paid', 'overdue', 'partially_paid');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // Check all tables that use vendor payment status
    console.log('Checking tables with vendor payment status columns...');
    const tablesWithEnum = await client.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns 
      WHERE udt_name LIKE '%vendor_payment_status%'
      ORDER BY table_name, column_name
    `);
    
    console.log('Tables with vendor payment status columns:');
    console.table(tablesWithEnum.rows);
    
    // Fix each table if needed
    for (const table of tablesWithEnum.rows) {
      if (table.udt_name === 'vendor_payment_status_enum_old') {
        console.log(`Fixing ${table.column_name} in ${table.table_name}...`);
        
        try {
          // Drop default
          await client.query(`
            ALTER TABLE ${table.table_name} 
            ALTER COLUMN ${table.column_name} DROP DEFAULT
          `);
          
          // Change type
          await client.query(`
            ALTER TABLE ${table.table_name} 
            ALTER COLUMN ${table.column_name} TYPE vendor_payment_status_enum 
            USING ${table.column_name}::text::vendor_payment_status_enum
          `);
          
          // Add default back
          await client.query(`
            ALTER TABLE ${table.table_name} 
            ALTER COLUMN ${table.column_name} SET DEFAULT 'pending'
          `);
          
          console.log(`✅ Fixed ${table.column_name} in ${table.table_name}`);
        } catch (error) {
          console.log(`Error fixing ${table.table_name}.${table.column_name}:`, error.message);
        }
      }
    }
    
    // Final check - try to drop old enum one more time
    try {
      await client.query('DROP TYPE vendor_payment_status_enum_old');
      console.log('✅ Old enum successfully dropped');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('✅ Old enum does not exist');
      } else {
        console.log('Could not drop old enum:', error.message);
      }
    }
    
    console.log('\n✅ TypeORM enum issue fix completed');
    console.log('Now you can restart your application with synchronize: true');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

require('dotenv').config();
fixTypeORMEnumIssue();

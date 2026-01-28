const { Client } = require('pg');

async function checkDependencies() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'Pass@123',
    database: process.env.DATABASE_NAME || 'salon_backend'
  });

  try {
    await client.connect();
    console.log('Checking dependencies on vendor_payment_status_enum_old...');
    
    const result = await client.query(`
      SELECT 
        n.nspname as schema_name,
        c.relname as table_name,
        a.attname as column_name,
        t.typname as type_name
      FROM pg_depend d
      JOIN pg_type t ON d.refobjid = t.oid
      JOIN pg_class c ON d.objid = c.oid
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.objsubid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE t.typname = 'vendor_payment_status_enum_old'
      ORDER BY n.nspname, c.relname, a.attname;
    `);
    
    console.log('Dependencies found:');
    console.table(result.rows);
    
    if (result.rows.length === 0) {
      console.log('No dependencies found. The enum type should be safe to drop.');
    } else {
      console.log('\nFixing remaining dependencies...');
      
      for (const row of result.rows) {
        console.log(`Fixing column ${row.column_name} in table ${row.table_name}...`);
        
        // Drop default first
        await client.query(`
          ALTER TABLE ${row.table_name} 
          ALTER COLUMN ${row.column_name} DROP DEFAULT
        `);
        
        // Update column type to use new enum
        await client.query(`
          ALTER TABLE ${row.table_name} 
          ALTER COLUMN ${row.column_name} TYPE vendor_payment_status_enum 
          USING ${row.column_name}::vendor_payment_status_enum
        `);
        
        // Add default back
        await client.query(`
          ALTER TABLE ${row.table_name} 
          ALTER COLUMN ${row.column_name} SET DEFAULT 'pending'
        `);
        
        console.log(`✅ Fixed ${row.column_name} in ${row.table_name}`);
      }
      
      // Now try to drop the old enum
      console.log('\nDropping old enum type...');
      await client.query('DROP TYPE vendor_payment_status_enum_old');
      console.log('✅ Old enum type dropped successfully');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

require('dotenv').config();
checkDependencies();

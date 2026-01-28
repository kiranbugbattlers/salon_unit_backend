const { Client } = require('pg');

async function completeEnumFix() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'Pass@123',
    database: process.env.DATABASE_NAME || 'salon_backend'
  });

  try {
    await client.connect();
    console.log('Complete enum fix - starting...');
    
    // Step 1: Check all enum types
    console.log('\n=== Step 1: Checking all enum types ===');
    const allEnums = await client.query(`
      SELECT typname FROM pg_type 
      WHERE typname LIKE '%vendor_payment_status%'
      ORDER BY typname
    `);
    
    console.log('All vendor payment status enum types:');
    console.table(allEnums.rows);
    
    // Step 2: Check all column dependencies
    console.log('\n=== Step 2: Checking column dependencies ===');
    const columns = await client.query(`
      SELECT 
        table_name,
        column_name,
        udt_name,
        data_type
      FROM information_schema.columns 
      WHERE udt_name LIKE '%vendor_payment_status%'
      ORDER BY table_name, column_name
    `);
    
    console.log('Columns using vendor payment status:');
    console.table(columns.rows);
    
    // Step 3: Check for any remaining dependencies on old enum
    console.log('\n=== Step 3: Checking for old enum dependencies ===');
    const oldEnumDeps = await client.query(`
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
      ORDER BY n.nspname, c.relname, a.attname
    `);
    
    if (oldEnumDeps.rows.length > 0) {
      console.log('Found dependencies on old enum:');
      console.table(oldEnumDeps.rows);
      
      // Fix each dependency
      for (const dep of oldEnumDeps.rows) {
        console.log(`\nFixing ${dep.column_name} in ${dep.table_name}...`);
        
        try {
          // Drop default
          await client.query(`
            ALTER TABLE ${dep.table_name} 
            ALTER COLUMN ${dep.column_name} DROP DEFAULT
          `);
          
          // Convert to text first, then to new enum
          await client.query(`
            ALTER TABLE ${dep.table_name} 
            ALTER COLUMN ${dep.column_name} TYPE text USING ${dep.column_name}::text
          `);
          
          // Then convert to new enum
          await client.query(`
            ALTER TABLE ${dep.table_name} 
            ALTER COLUMN ${dep.column_name} TYPE vendor_payment_status_enum 
            USING ${dep.column_name}::vendor_payment_status_enum
          `);
          
          // Add default back
          await client.query(`
            ALTER TABLE ${dep.table_name} 
            ALTER COLUMN ${dep.column_name} SET DEFAULT 'pending'
          `);
          
          console.log(`✅ Fixed ${dep.column_name} in ${dep.table_name}`);
        } catch (error) {
          console.log(`❌ Error fixing ${dep.table_name}.${dep.column_name}:`, error.message);
        }
      }
    } else {
      console.log('✅ No dependencies found on old enum');
    }
    
    // Step 4: Force drop old enum if it exists
    console.log('\n=== Step 4: Force dropping old enum ===');
    const oldEnumCheck = await client.query(`
      SELECT typname FROM pg_type WHERE typname = 'vendor_payment_status_enum_old'
    `);
    
    if (oldEnumCheck.rows.length > 0) {
      console.log('Old enum still exists, dropping with CASCADE...');
      try {
        await client.query('DROP TYPE vendor_payment_status_enum_old CASCADE');
        console.log('✅ Old enum dropped with CASCADE');
      } catch (error) {
        console.log('❌ Could not drop old enum:', error.message);
      }
    } else {
      console.log('✅ Old enum does not exist');
    }
    
    // Step 5: Final verification
    console.log('\n=== Step 5: Final verification ===');
    const finalCheck = await client.query(`
      SELECT typname FROM pg_type WHERE typname = 'vendor_payment_status_enum_old'
    `);
    
    if (finalCheck.rows.length === 0) {
      console.log('✅ SUCCESS: Old enum is completely removed');
    } else {
      console.log('❌ FAILED: Old enum still exists');
    }
    
    // Show final state
    const finalEnums = await client.query(`
      SELECT typname FROM pg_type WHERE typname LIKE '%vendor_payment_status%'
    `);
    
    console.log('\nFinal enum types:');
    console.table(finalEnums.rows);
    
    console.log('\n✅ Complete enum fix finished');
    
  } catch (error) {
    console.error('❌ Error during complete enum fix:', error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
  } finally {
    await client.end();
  }
}

require('dotenv').config();
completeEnumFix();

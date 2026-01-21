const { Client } = require('pg');

async function addBusinessInfoToVendorDuePayments() {
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

    const columnsToAdd = [
      { name: 'alternate_number', type: 'VARCHAR(20)' },
      { name: 'salon_name', type: 'VARCHAR(200)' },
      { name: 'owner_name', type: 'VARCHAR(200)' },
      { name: 'mobile_number', type: 'VARCHAR(15)' },
      { name: 'is_business_enabled', type: 'BOOLEAN DEFAULT true' },
      { name: 'admin_remarks', type: 'TEXT' }
    ];

    for (const column of columnsToAdd) {
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'vendor_due_payments' 
        AND column_name = '${column.name}'
      `);

      if (columnCheck.rows.length === 0) {
        console.log(`Adding ${column.name} column to vendor_due_payments table...`);
        
        await client.query(`
          ALTER TABLE vendor_due_payments 
          ADD COLUMN ${column.name} ${column.type}
        `);

        console.log(`✅ ${column.name} column added successfully`);
      } else {
        console.log(`ℹ️ ${column.name} column already exists`);
      }
    }

    console.log('✅ Business information fields added to vendor due payments successfully');
  } catch (error) {
    console.error('❌ Error adding business information fields:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

addBusinessInfoToVendorDuePayments();

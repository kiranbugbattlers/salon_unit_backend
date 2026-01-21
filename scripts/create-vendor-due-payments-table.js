const { Client } = require('pg');

async function createVendorDuePaymentsTable() {
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

    // Check if vendor_due_payments table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vendor_due_payments'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Creating vendor_due_payments table...');
      
      await client.query(`
        CREATE TABLE vendor_due_payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          business_owner_id UUID NOT NULL,
          due_amount DECIMAL(12,2) NOT NULL,
          paid_amount DECIMAL(12,2) DEFAULT 0 NOT NULL,
          remaining_amount DECIMAL(12,2) NOT NULL,
          alternate_number VARCHAR(20),
          salon_name VARCHAR(200),
          owner_name VARCHAR(200),
          mobile_number VARCHAR(15),
          is_business_enabled BOOLEAN DEFAULT true,
          due_date DATE NOT NULL,
          status VARCHAR(20) DEFAULT 'pending' NOT NULL,
          description TEXT,
          created_by_admin_id UUID,
          updated_by_admin_id UUID,
          admin_remarks TEXT,
          marked_overdue_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          
          CONSTRAINT fk_vendor_due_payments_business_owner 
              FOREIGN KEY (business_owner_id) 
              REFERENCES business_owner(id) 
              ON DELETE CASCADE
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX idx_vendor_due_payments_business_owner ON vendor_due_payments(business_owner_id)
      `);
      
      await client.query(`
        CREATE INDEX idx_vendor_due_payments_status ON vendor_due_payments(status)
      `);
      
      await client.query(`
        CREATE INDEX idx_vendor_due_payments_due_date ON vendor_due_payments(due_date)
      `);

      console.log('✅ vendor_due_payments table created successfully');
    } else {
      console.log('ℹ️ vendor_due_payments table already exists');
    }

    // Check and add vendor_status column to business_owner table
    const columnCheck = await client.query(`
      SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'business_owner' 
        AND column_name = 'vendor_status'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('Adding vendor_status column to business_owner table...');
      
      await client.query(`
        ALTER TABLE business_owner 
        ADD COLUMN vendor_status VARCHAR(20) DEFAULT 'active'
      `);

      console.log('✅ vendor_status column added successfully');
    } else {
      console.log('ℹ️ vendor_status column already exists');
    }

    console.log('✅ Vendor due payments system migration completed successfully');
  } catch (error) {
    console.error('❌ Error creating vendor due payments system:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

createVendorDuePaymentsTable();

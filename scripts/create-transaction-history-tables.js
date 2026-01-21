const { Client } = require('pg');

async function createTransactionHistoryTables() {
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

    // Create business owner transaction history table
    console.log('Creating business_owner_transaction_history table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_owner_transaction_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_owner_id UUID NOT NULL,
        transaction_date TIMESTAMP NOT NULL,
        transaction_amount DECIMAL(12,2) NOT NULL,
        transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
        previous_balance DECIMAL(12,2) NOT NULL,
        remaining_balance DECIMAL(12,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'completed',
        payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'online', 'upi', 'card', 'bank_transfer')),
        remarks TEXT,
        related_booking_id UUID,
        created_by_admin_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        
        CONSTRAINT fk_business_owner_transaction_history_business_owner 
            FOREIGN KEY (business_owner_id) 
            REFERENCES business_owner(id) 
            ON DELETE CASCADE,
            
        CONSTRAINT fk_business_owner_transaction_history_booking 
            FOREIGN KEY (related_booking_id) 
            REFERENCES bookings(id) 
            ON DELETE SET NULL,
            
        CONSTRAINT fk_business_owner_transaction_history_admin 
            FOREIGN KEY (created_by_admin_id) 
            REFERENCES admins(id) 
            ON DELETE SET NULL
      )
    `);

    // Create indexes for transaction history
    await client.query(`
      CREATE INDEX idx_business_owner_transaction_history_business_owner 
      ON business_owner_transaction_history(business_owner_id)
    `);
    
    await client.query(`
      CREATE INDEX idx_business_owner_transaction_history_date 
      ON business_owner_transaction_history(transaction_date)
    `);
    
    await client.query(`
      CREATE INDEX idx_business_owner_transaction_history_type 
      ON business_owner_transaction_history(transaction_type)
    `);

    console.log('✅ business_owner_transaction_history table created successfully');

    // Create user booking history table
    console.log('Creating user_booking_history table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_booking_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        booking_id UUID NOT NULL,
        business_owner_id UUID NOT NULL,
        customer_name VARCHAR(200) NOT NULL,
        customer_mobile VARCHAR(15) NOT NULL,
        booking_date TIMESTAMP NOT NULL,
        booking_amount DECIMAL(12,2) NOT NULL,
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'online', 'upi', 'card', 'bank_transfer')),
        vendor_payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        vendor_paid_amount DECIMAL(12,2) DEFAULT 0,
        vendor_payment_date TIMESTAMP,
        commission_amount DECIMAL(12,2) DEFAULT 0,
        vendor_earning DECIMAL(12,2) NOT NULL,
        booking_status VARCHAR(20) NOT NULL,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        
        CONSTRAINT fk_user_booking_history_user 
            FOREIGN KEY (user_id) 
            REFERENCES users(id) 
            ON DELETE CASCADE,
            
        CONSTRAINT fk_user_booking_history_booking 
            FOREIGN KEY (booking_id) 
            REFERENCES bookings(id) 
            ON DELETE CASCADE,
            
        CONSTRAINT fk_user_booking_history_business_owner 
            FOREIGN KEY (business_owner_id) 
            REFERENCES business_owner(id) 
            ON DELETE CASCADE
      )
    `);

    // Create indexes for user booking history
    await client.query(`
      CREATE INDEX idx_user_booking_history_user 
      ON user_booking_history(user_id)
    `);
    
    await client.query(`
      CREATE INDEX idx_user_booking_history_business_owner 
      ON user_booking_history(business_owner_id)
    `);
    
    await client.query(`
      CREATE INDEX idx_user_booking_history_date 
      ON user_booking_history(booking_date)
    `);
    
    await client.query(`
      CREATE INDEX idx_user_booking_history_payment_status 
      ON user_booking_history(payment_status)
    `);

    console.log('✅ user_booking_history table created successfully');

    // Create vendor payment summary table for quick overview
    console.log('Creating vendor_payment_summary table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS vendor_payment_summary (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_owner_id UUID NOT NULL,
        summary_date DATE NOT NULL,
        total_bookings INTEGER DEFAULT 0,
        total_revenue DECIMAL(12,2) DEFAULT 0,
        total_commission DECIMAL(12,2) DEFAULT 0,
        vendor_earning DECIMAL(12,2) DEFAULT 0,
        amount_paid DECIMAL(12,2) DEFAULT 0,
        amount_due DECIMAL(12,2) DEFAULT 0,
        payment_status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        
        CONSTRAINT fk_vendor_payment_summary_business_owner 
            FOREIGN KEY (business_owner_id) 
            REFERENCES business_owner(id) 
            ON DELETE CASCADE,
            
        UNIQUE(business_owner_id, summary_date)
      )
    `);

    // Create indexes for payment summary
    await client.query(`
      CREATE INDEX idx_vendor_payment_summary_business_owner 
      ON vendor_payment_summary(business_owner_id)
    `);
    
    await client.query(`
      CREATE INDEX idx_vendor_payment_summary_date 
      ON vendor_payment_summary(summary_date)
    `);

    console.log('✅ vendor_payment_summary table created successfully');

    console.log('\n✅ All transaction history tables created successfully');

  } catch (error) {
    console.error('❌ Error creating transaction history tables:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

createTransactionHistoryTables();

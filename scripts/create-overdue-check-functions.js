const { Client } = require('pg');

async function createOverdueCheckFunction() {
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

    // Create function to check if vendor has overdue payments
    console.log('Creating function to check vendor overdue status...');
    
    await client.query(`
      CREATE OR REPLACE FUNCTION check_vendor_overdue(vendor_business_owner_id UUID)
      RETURNS BOOLEAN AS $$
      DECLARE
        overdue_count INTEGER;
        total_due DECIMAL;
        total_paid DECIMAL;
      BEGIN
        -- Count overdue payments
        SELECT COUNT(*) INTO overdue_count
        FROM vendor_due_payments 
        WHERE business_owner_id = vendor_business_owner_id 
        AND status = 'overdue';
        
        -- Get total due and paid amounts
        SELECT COALESCE(SUM(due_amount), 0), COALESCE(SUM(paid_amount), 0)
        INTO total_due, total_paid
        FROM vendor_due_payments 
        WHERE business_owner_id = vendor_business_owner_id;
        
        -- Return true if has overdue payments OR if paid exceeds due amount by more than credit limit
        RETURN overdue_count > 0 
               OR (total_due > 0 AND total_paid >= total_due)
               OR EXISTS (
                 SELECT 1 FROM vendor_due_payments 
                 WHERE business_owner_id = vendor_business_owner_id 
                 AND status = 'overdue'
                 AND due_date < CURRENT_DATE
               );
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ check_vendor_overdue function created successfully');

    // Create function to update vendor status based on overdue payments
    console.log('Creating function to update vendor status...');
    
    await client.query(`
      CREATE OR REPLACE FUNCTION update_vendor_status_on_overdue()
      RETURNS VOID AS $$
      DECLARE
        vendor_record RECORD;
      overdue_count INTEGER;
      total_due DECIMAL;
      total_paid DECIMAL;
        credit_limit DECIMAL;
      BEGIN
        -- Loop through all business owners
        FOR vendor_record IN 
          SELECT id, credit_limit, vendor_status
          FROM business_owner 
          WHERE is_approved = true
        LOOP
          -- Check overdue status
          SELECT COUNT(*) INTO overdue_count
          FROM vendor_due_payments 
          WHERE business_owner_id = vendor_record.id 
          AND status = 'overdue';
          
          -- Get total due and paid amounts
          SELECT COALESCE(SUM(due_amount), 0), COALESCE(SUM(paid_amount), 0)
          INTO total_due, total_paid
          FROM vendor_due_payments 
          WHERE business_owner_id = vendor_record.id;
          
          -- Get credit limit
          SELECT COALESCE(credit_limit, 0) INTO credit_limit
          FROM business_owner 
          WHERE id = vendor_record.id;
          
          -- Update vendor status based on overdue status
          IF overdue_count > 0 OR (total_due > 0 AND total_paid >= (credit_limit + total_due)) THEN
            UPDATE business_owner 
            SET vendor_status = 'services_hidden',
                updated_at = NOW()
            WHERE id = vendor_record.id;
          ELSIF vendor_record.vendor_status = 'services_hidden' AND overdue_count = 0 THEN
            UPDATE business_owner 
            SET vendor_status = 'active',
                updated_at = NOW()
            WHERE id = vendor_record.id;
          END IF;
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ update_vendor_status_on_overdue function created successfully');

    // Create trigger to automatically update vendor status
    console.log('Creating trigger for automatic vendor status updates...');
    
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_vendor_status_on_overdue;
      
      CREATE TRIGGER trigger_update_vendor_status_on_overdue
        AFTER INSERT OR UPDATE ON vendor_due_payments
        FOR EACH ROW
        EXECUTE PROCEDURE update_vendor_status_on_overdue();
    `);

    console.log('✅ trigger for automatic vendor status updates created successfully');

    // Test the function with existing data
    const testResult = await client.query(`
      SELECT 
        bo.id,
        bo.business_name,
        bo.vendor_status,
        check_vendor_overdue(bo.id) as is_overdue
      FROM business_owner bo
      WHERE bo.is_approved = true
      ORDER BY bo.business_name
      LIMIT 5
    `);

    console.log('\nVendor overdue status test results:');
    testResult.rows.forEach(vendor => {
      console.log(`  ${vendor.business_name}: ${vendor.vendor_status} (Overdue: ${vendor.is_overdue})`);
    });

    console.log('\n✅ Vendor overdue check system implemented successfully');

  } catch (error) {
    console.error('❌ Error creating overdue check system:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

createOverdueCheckFunction();

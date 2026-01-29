import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function cleanupCarryForwardColumns() {
  console.log('Cleaning up carry-forward columns from database...');
  
  // Get database configuration from environment
  const dbMode = process.env.DB_MODE || 'local';
  
  let config: any;
  if (dbMode === 'supabase') {
    config = {
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
      user: process.env.SUPABASE_DB_USERNAME,
      password: process.env.SUPABASE_DB_PASSWORD,
      database: process.env.SUPABASE_DB_NAME,
      ssl: { rejectUnauthorized: false },
    };
  } else {
    config = {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      user: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'salon_backend',
    };
  }
  
  const pool = new Pool(config);
  
  try {
    const client = await pool.connect();
    console.log('Connected to database');
    
    try {
      // Start transaction
      await client.query('BEGIN');
      
      // Drop foreign key constraint if it exists
      try {
        console.log('Dropping foreign key constraint...');
        await client.query('ALTER TABLE vendor_due_payments DROP CONSTRAINT IF EXISTS fk_vendor_due_payments_carried_forward_from');
      } catch (error) {
        console.log('Foreign key constraint does not exist or already dropped');
      }
      
      // Drop indexes if they exist
      const indexQueries = [
        'DROP INDEX IF EXISTS idx_vendor_due_payments_carried_forward_from_id',
        'DROP INDEX IF EXISTS idx_vendor_due_payments_carry_forward_count',
        'DROP INDEX IF EXISTS idx_vendor_due_payments_last_carried_forward_at'
      ];
      
      for (const indexQuery of indexQueries) {
        try {
          console.log('Dropping index...');
          await client.query(indexQuery);
        } catch (error) {
          console.log('Index does not exist or already dropped');
        }
      }
      
      // Drop carry-forward columns if they exist
      const columnQueries = [
        'ALTER TABLE vendor_due_payments DROP COLUMN IF EXISTS original_due_date',
        'ALTER TABLE vendor_due_payments DROP COLUMN IF EXISTS carry_forward_amount',
        'ALTER TABLE vendor_due_payments DROP COLUMN IF EXISTS carry_forward_count',
        'ALTER TABLE vendor_due_payments DROP COLUMN IF EXISTS last_carried_forward_at',
        'ALTER TABLE vendor_due_payments DROP COLUMN IF EXISTS carried_forward_from_id'
      ];
      
      for (const columnQuery of columnQueries) {
        try {
          console.log('Dropping column...');
          await client.query(columnQuery);
        } catch (error) {
          console.log('Column does not exist or already dropped');
        }
      }
      
      // Commit transaction
      await client.query('COMMIT');
      console.log('✅ Carry-forward columns cleanup completed successfully!');
      
      // Verify the final structure
      const tableStructureQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'vendor_due_payments' 
        ORDER BY ordinal_position
      `;
      
      const finalColumns = await client.query(tableStructureQuery);
      console.log('Final columns in vendor_due_payments:');
      finalColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
      
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

cleanupCarryForwardColumns()
  .then(() => {
    console.log('Cleanup process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup process failed:', error);
    process.exit(1);
  });

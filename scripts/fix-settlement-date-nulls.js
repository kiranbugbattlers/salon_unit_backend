const { Client } = require('pg');

async function fixSettlementDateNulls() {
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

    // Check for null settlement_date values
    const nullCountResult = await client.query(
      `SELECT COUNT(*) as count FROM daily_settlements WHERE settlement_date IS NULL`
    );
    const nullCount = parseInt(nullCountResult.rows[0].count);
    
    console.log(`Found ${nullCount} records with null settlement_date`);

    if (nullCount > 0) {
      // First, let's see the records we need to update
      const recordsToUpdate = await client.query(`
        SELECT id, business_owner_id, created_at 
        FROM daily_settlements 
        WHERE settlement_date IS NULL
        ORDER BY created_at
      `);

      console.log(`Updating ${recordsToUpdate.rows.length} records with unique dates...`);

      // Update each record with a unique date based on created_at + row number
      for (let i = 0; i < recordsToUpdate.rows.length; i++) {
        const record = recordsToUpdate.rows[i];
        const baseDate = new Date(record.created_at);
        // Add i days to ensure uniqueness for the same business owner
        const uniqueDate = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000));
        
        await client.query(`
          UPDATE daily_settlements 
          SET settlement_date = $1
          WHERE id = $2
        `, [uniqueDate.toISOString().split('T')[0], record.id]);

        console.log(`Updated record ${record.id} with date ${uniqueDate.toISOString().split('T')[0]}`);
      }

      // Verify the update
      const remainingNulls = await client.query(
        `SELECT COUNT(*) as count FROM daily_settlements WHERE settlement_date IS NULL`
      );
      console.log(`Remaining null settlement_date values: ${remainingNulls.rows[0].count}`);
    }

    console.log('✅ Settlement date null values fixed successfully');
  } catch (error) {
    console.error('❌ Error fixing settlement date nulls:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

fixSettlementDateNulls();

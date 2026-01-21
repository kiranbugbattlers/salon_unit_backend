const { Client } = require('pg');

async function fixAllNullValues() {
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

    // Check for null values in all problematic columns
    const columnsToCheck = [
      'owner_name',
      'salon_name', 
      'mobile_number',
      'address'
    ];

    for (const column of columnsToCheck) {
      const nullCountResult = await client.query(
        `SELECT COUNT(*) as count FROM daily_settlements WHERE ${column} IS NULL`
      );
      const nullCount = parseInt(nullCountResult.rows[0].count);
      
      console.log(`Found ${nullCount} records with null ${column}`);

      if (nullCount > 0) {
        if (column === 'owner_name' || column === 'salon_name') {
          // For name columns, use a default value
          await client.query(`
            UPDATE daily_settlements 
            SET ${column} = 'Unknown'
            WHERE ${column} IS NULL
          `);
          console.log(`Updated ${nullCount} records with default ${column}`);
        } else if (column === 'mobile_number') {
          // For mobile number, use a placeholder
          await client.query(`
            UPDATE daily_settlements 
            SET ${column} = '0000000000'
            WHERE ${column} IS NULL
          `);
          console.log(`Updated ${nullCount} records with default ${column}`);
        } else if (column === 'address') {
          // For address, use a placeholder
          await client.query(`
            UPDATE daily_settlements 
            SET ${column} = 'Address not provided'
            WHERE ${column} IS NULL
          `);
          console.log(`Updated ${nullCount} records with default ${column}`);
        }

        // Verify the update
        const remainingNulls = await client.query(
          `SELECT COUNT(*) as count FROM daily_settlements WHERE ${column} IS NULL`
        );
        console.log(`Remaining null ${column} values: ${remainingNulls.rows[0].count}`);
      }
    }

    console.log('✅ All null values fixed successfully');
  } catch (error) {
    console.error('❌ Error fixing null values:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

fixAllNullValues();

const { Client } = require('pg');

async function checkExistingData() {
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

    // Check business owners
    const businessOwners = await client.query(`
      SELECT id, business_name, first_name, last_name, is_approved
      FROM business_owner 
      ORDER BY business_name
    `);

    console.log('Business Owners:');
    businessOwners.rows.forEach(owner => {
      console.log(`  - ${owner.business_name} (${owner.first_name} ${owner.last_name}) - Approved: ${owner.is_approved}`);
    });

    // Check bookings
    const bookings = await client.query(`
      SELECT b.id, b.business_owner_id, bo.business_name, b.customer_id, 
             b.appointment_date, b.start_time, b.total_amount
      FROM bookings b
      JOIN business_owner bo ON b.business_owner_id = bo.id
      ORDER BY b.appointment_date DESC
      LIMIT 10
    `);

    console.log('\nRecent Bookings:');
    bookings.rows.forEach(booking => {
      console.log(`  - ID: ${booking.id}, Business: ${booking.business_name}, Date: ${booking.appointment_date}, Amount: ${booking.total_amount}`);
    });

  } catch (error) {
    console.error('❌ Error checking existing data:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();

checkExistingData();

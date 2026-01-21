const { Client } = require('pg');

// Database connection - update with your actual database credentials
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'salon_db', // Update this with your actual database name
  user: 'postgres',     // Update this with your actual username
  password: 'password', // Update this with your actual password
});

async function addTestAddress() {
  try {
    await client.connect();
    console.log('Connected to database');

    // User ID from the JWT token
    const userId = '74bdee77-5f24-4720-a5ca-d968576cada9';

    // Insert a test personal address
    const query = `
      INSERT INTO user_addresses (
        user_id, address_type, street_address, address_line_1,
        address_line_2, landmark, city, state, postal_code,
        country, is_primary, is_active, created_at, updated_at
      ) VALUES (
        $1, 'home', '456 Oak Street', 'Apartment 201',
        'Near Central Park', 'Next to Coffee Shop', 'Mumbai', 'Maharashtra',
        '400001', 'India', true, true, NOW(), NOW()
      ) RETURNING *;
    `;

    const result = await client.query(query, [userId]);
    console.log('Address created successfully:');
    console.log(result.rows[0]);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

console.log('Adding test address for business owner...');
addTestAddress();
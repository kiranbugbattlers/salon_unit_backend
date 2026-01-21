const { Client } = require('pg');

async function checkExisting() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Rushi@26',
    database: 'salon_backend1',
  });

  try {
    await client.connect();
    
    // Check existing business owners
    const businessOwners = await client.query(`
      SELECT bo.id, bo.user_id, bo.business_name, bo.shop_id, u.phone
      FROM business_owner bo
      JOIN users u ON bo.user_id = u.id
      LIMIT 5
    `);
    
    console.log('Existing business owners:');
    businessOwners.rows.forEach(row => {
      console.log(`- ID: ${row.id}, User ID: ${row.user_id}, Name: ${row.business_name}, Shop: ${row.shop_id}, Phone: ${row.phone}`);
    });
    
    // Check existing staff
    const staff = await client.query(`
      SELECT s.id, s.business_owner_id, s.first_name, s.last_name
      FROM staff s
      LIMIT 5
    `);
    
    console.log('\nExisting staff:');
    staff.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Business Owner: ${row.business_owner_id}, Name: ${row.first_name} ${row.last_name}`);
    });
    
    // Check existing services
    const services = await client.query(`
      SELECT s.id, s.business_owner_id, s.name, s.price
      FROM services s
      LIMIT 5
    `);
    
    console.log('\nExisting services:');
    services.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Business Owner: ${row.business_owner_id}, Name: ${row.name}, Price: ${row.price}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkExisting();

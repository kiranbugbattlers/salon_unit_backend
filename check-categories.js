const { Client } = require('pg');

async function checkCategories() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Rushi@26',
    database: 'salon_backend1',
  });

  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT id, name FROM service_categories LIMIT 5
    `);
    
    console.log('Available service categories:');
    result.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Name: ${row.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkCategories();

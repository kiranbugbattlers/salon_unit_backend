const { Client } = require('pg');

async function checkBusinessServices() {
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
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'business_services' 
      ORDER BY ordinal_position
    `);
    
    console.log('business_services columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkBusinessServices();

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Rushi@26',
  database: 'salon_backend1'
});

async function checkImportStatus() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const query = `
      SELECT 
        schemaname,
        relname as tablename,
        n_tup_ins as inserted_rows
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public' 
      ORDER BY relname;
    `;

    const result = await client.query(query);
    
    console.log('\n📊 Import Status Summary:');
    console.log('='.repeat(50));
    
    let totalRows = 0;
    let tablesWithData = 0;
    
    result.rows.forEach(row => {
      const rows = parseInt(row.inserted_rows) || 0;
      if (rows > 0) {
        console.log(`✅ ${row.tablename}: ${rows} rows`);
        totalRows += rows;
        tablesWithData++;
      } else {
        console.log(`⚪ ${row.tablename}: 0 rows`);
      }
    });
    
    console.log('='.repeat(50));
    console.log(`📈 Total tables with data: ${tablesWithData}`);
    console.log(`📈 Total rows imported: ${totalRows}`);
    
  } catch (error) {
    console.error('❌ Error checking import status:', error);
  } finally {
    await client.end();
  }
}

checkImportStatus();

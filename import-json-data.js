const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Database connection
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Rushi@26',
  database: 'salon_backend1'
});

async function importJSONData() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const dataDir = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataDir);
    
    // Filter only public table files
    const publicTableFiles = files.filter(file => 
      file.startsWith('public_') && file.endsWith('.json')
    );

    console.log(`Found ${publicTableFiles.length} data files to import`);

    for (const file of publicTableFiles) {
      const filePath = path.join(dataDir, file);
      const tableName = file.replace('public_', '').replace('_2026-01-02_123658.json', '');
      
      console.log(`\n📁 Processing: ${file} -> Table: ${tableName}`);
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        if (!Array.isArray(data) || data.length === 0) {
          console.log(`⚠️  No data to import for ${tableName}`);
          continue;
        }

        // Get column names from first record
        const columns = Object.keys(data[0]);
        const columnNames = columns.join(', ');
        
        // Prepare values for insertion
        const values = data.map(record => {
          const valueList = columns.map(col => {
            const value = record[col];
            if (value === null || value === undefined) {
              return 'NULL';
            } else if (typeof value === 'string') {
              // Escape single quotes in strings
              return `'${value.replace(/'/g, "''")}'`;
            } else if (typeof value === 'boolean') {
              return value ? 'TRUE' : 'FALSE';
            } else if (typeof value === 'object') {
              // Handle JSON objects
              return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
            } else {
              return value;
            }
          }).join(', ');
          return `(${valueList})`;
        }).join(', ');

        const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES ${values}`;
        
        console.log(`📊 Importing ${data.length} records into ${tableName}`);
        
        await client.query(insertQuery);
        console.log(`✅ Successfully imported ${data.length} records into ${tableName}`);
        
      } catch (error) {
        console.error(`❌ Failed to import ${file}:`, error.message);
      }
    }
    
    console.log('\n✅ All data import completed!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

importJSONData();

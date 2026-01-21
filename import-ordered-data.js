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

// Define import order based on foreign key dependencies
const importOrder = [
  'users',
  'user_roles',
  'service_categories',
  'subscription_plans',
  'admins',
  'agents',
  'customers',
  'customer_onboardings',
  'customer_favorites',
  'customer_media',
  'customer_reward_points',
  'user_addresses',
  'business_owners',
  'business_owner_onboardings',
  'business_addresses',
  'business_media',
  'business_operating_hours',
  'business_settings',
  'business_approvals',
  'services',
  'service_packages',
  'service_package_items',
  'business_services',
  'staff',
  'staff_working_hours',
  'staff_breaks',
  'staff_schedule_overrides',
  'staff_services',
  'wallets',
  'banking_info',
  'refresh_tokens',
  'otp_tokens',
  'device_tokens',
  'booking_requests',
  'booking_request_services',
  'bookings',
  'booking_services',
  'payments',
  'cod_transactions',
  'business_subscriptions',
  'subscription_transactions',
  'commission_configs',
  'commission_transactions',
  'commission_payments',
  'monthly_settlements',
  'settlement_transactions',
  'support_members',
  'customer_support_mappings',
  'notification_logs',
  'scheduled_notifications',
  'idempotency_keys',
  'admin_action_audits',
  'advertisements'
];

async function importJSONData() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const dataDir = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataDir);
    
    // Create a map of table name to file path
    const fileMap = {};
    files.forEach(file => {
      if (file.startsWith('public_') && file.endsWith('.json')) {
        const tableName = file.replace('public_', '').replace('_2026-01-02_123658.json', '');
        fileMap[tableName] = path.join(dataDir, file);
      }
    });

    console.log(`Found ${Object.keys(fileMap).length} data files to import`);

    // Import in dependency order
    for (const tableName of importOrder) {
      if (!fileMap[tableName]) {
        console.log(`⚠️  No data file found for ${tableName}`);
        continue;
      }

      const filePath = fileMap[tableName];
      console.log(`\n📁 Processing: ${path.basename(filePath)} -> Table: ${tableName}`);
      
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
        console.error(`❌ Failed to import ${tableName}:`, error.message);
        
        // Try to continue with other tables
        console.log(`⚠️  Continuing with next table...`);
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

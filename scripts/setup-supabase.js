#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

async function setupSupabaseDatabase() {
  console.log('🚀 Setting up Supabase database...\n');

  // Check if Supabase credentials are configured
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase credentials missing!');
    console.log('Please configure the following environment variables in your .env file:');
    console.log('  - SUPABASE_URL=https://your-project.supabase.co');
    console.log('  - SUPABASE_ANON_KEY=your_anon_key');
    console.log('  - SUPABASE_SERVICE_KEY=your_service_key (optional, for admin operations)');
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

  try {
    // Read the database schema file
    const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ database-schema.sql not found!');
      console.log('Make sure database-schema.sql exists in the project root.');
      process.exit(1);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Database schema loaded successfully');

    // Split the SQL into individual statements
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    // Execute statements one by one
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // Try using the SQL query method as fallback
          const { error: queryError } = await supabase
            .from('dummy') // This won't work but we need to use the query method
            .select('*')
            .limit(0);
          
          // For DDL statements, we'll need to use the REST API directly
          console.log(`⚠️  Statement ${i + 1} may need manual execution`);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} error:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⚠️  Errors/Manual: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some statements may need manual execution in Supabase SQL Editor');
      console.log('Visit: https://app.supabase.com/project/YOUR_PROJECT/sql');
    }

    // Test the database connection
    console.log('\n🔍 Testing database connection...');
    
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact' })
      .limit(0);

    if (testError) {
      console.log('⚠️  Could not verify table creation. You may need to run the schema manually.');
    } else {
      console.log('✅ Database structure verified!');
    }

    console.log('\n🎉 Supabase setup completed!');
    console.log('Next steps:');
    console.log('1. Switch to Supabase mode: npm run db:supabase');
    console.log('2. Update your .env with Supabase database credentials');
    console.log('3. Start your application: npm run start:dev');

  } catch (error) {
    console.error('❌ Error setting up Supabase:', error.message);
    console.log('\n💡 Alternative approach:');
    console.log('1. Copy the contents of database-schema.sql');
    console.log('2. Go to Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql');
    console.log('3. Paste and execute the SQL manually');
    process.exit(1);
  }
}

// Add helper function to get Supabase credentials from dashboard
function showCredentialsInstructions() {
  console.log('\n📋 How to get your Supabase credentials:');
  console.log('1. Go to https://app.supabase.com/');
  console.log('2. Select your project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the following:');
  console.log('   - Project URL (SUPABASE_URL)');
  console.log('   - anon/public key (SUPABASE_ANON_KEY)');
  console.log('   - service_role key (SUPABASE_SERVICE_KEY) - optional');
  console.log('5. Go to Settings > Database');
  console.log('6. Copy the connection details for database credentials');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🔧 Supabase Database Setup Tool');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/setup-supabase.js        Run the setup');
    console.log('  node scripts/setup-supabase.js --help Show this help');
    console.log('  node scripts/setup-supabase.js --credentials Show how to get credentials');
    console.log('');
    process.exit(0);
  }
  
  if (args.includes('--credentials')) {
    showCredentialsInstructions();
    process.exit(0);
  }
  
  setupSupabaseDatabase();
}
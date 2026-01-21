#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateSupabaseMigration() {
  console.log('🚀 Generating Supabase Migration Guide...\n');

  const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ database-schema.sql not found!');
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  
  // Create a clean migration file for Supabase
  const migrationContent = `-- Salon Backend Database Migration for Supabase
-- Generated on: ${new Date().toISOString()}
-- 
-- Instructions:
-- 1. Copy this entire content
-- 2. Go to your Supabase project dashboard
-- 3. Navigate to SQL Editor (https://app.supabase.com/project/YOUR_PROJECT/sql)
-- 4. Paste this content and click RUN
-- 
-- Note: Some statements may fail if tables already exist. This is normal.

${schemaSql}

-- Verify the migration
SELECT 'Migration completed successfully!' as status;

-- Show all created tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;`;

  // Write the migration file
  const migrationPath = path.join(__dirname, '..', 'supabase-migration.sql');
  fs.writeFileSync(migrationPath, migrationContent);

  console.log('✅ Migration file created: supabase-migration.sql');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('');
  console.log('1. 🌐 Go to your Supabase dashboard:');
  console.log('   https://app.supabase.com/');
  console.log('');
  console.log('2. 🗄️  Navigate to SQL Editor:');
  console.log('   Click on "SQL Editor" in the left sidebar');
  console.log('');
  console.log('3. 📄 Copy the migration file:');
  console.log(`   Copy all content from: ${migrationPath}`);
  console.log('   Or run: cat supabase-migration.sql | pbcopy (Mac) or cat supabase-migration.sql (Linux)');
  console.log('');
  console.log('4. ▶️  Execute the migration:');
  console.log('   - Paste the content in the SQL Editor');
  console.log('   - Click "RUN" button');
  console.log('   - Wait for completion');
  console.log('');
  console.log('5. ✅ Verify the setup:');
  console.log('   - Check that all tables are created');
  console.log('   - Verify the sample data is inserted');
  console.log('');
  console.log('6. 🔧 Configure your environment:');
  console.log('   - Get your Supabase credentials');
  console.log('   - Update your .env file');
  console.log('   - Switch to Supabase mode: npm run db:supabase');
  console.log('');
  
  // Show credentials instructions
  showCredentialsGuide();
}

function showCredentialsGuide() {
  console.log('🔐 Getting Supabase Credentials:');
  console.log('');
  console.log('1. In your Supabase dashboard, go to Settings > API:');
  console.log('   - Copy Project URL → SUPABASE_URL');
  console.log('   - Copy anon public key → SUPABASE_ANON_KEY');
  console.log('');
  console.log('2. Go to Settings > Database:');
  console.log('   - Copy Host → SUPABASE_DB_HOST');
  console.log('   - Copy Database name → SUPABASE_DB_NAME (usually "postgres")');
  console.log('   - Copy Username → SUPABASE_DB_USERNAME (usually "postgres")');
  console.log('   - Copy Password → SUPABASE_DB_PASSWORD');
  console.log('   - Port is always 5432 → SUPABASE_DB_PORT');
  console.log('');
  console.log('3. Update your .env file with these values');
  console.log('');
  
  // Show sample .env configuration
  console.log('📝 Sample .env configuration:');
  console.log('');
  console.log('# Database Configuration');
  console.log('DB_MODE=supabase');
  console.log('');
  console.log('# Supabase Configuration');
  console.log('SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  console.log('SUPABASE_DB_HOST=db.your-project-id.supabase.co');
  console.log('SUPABASE_DB_PORT=5432');
  console.log('SUPABASE_DB_USERNAME=postgres');
  console.log('SUPABASE_DB_PASSWORD=your-database-password');
  console.log('SUPABASE_DB_NAME=postgres');
  console.log('');
}

function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Configuration...');
  
  require('dotenv').config();
  
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'SUPABASE_DB_HOST',
    'SUPABASE_DB_USERNAME',
    'SUPABASE_DB_PASSWORD',
    'SUPABASE_DB_NAME'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:');
    missing.forEach(varName => console.log(`   - ${varName}`));
    console.log('\nPlease configure these in your .env file');
    return false;
  }
  
  console.log('✅ All Supabase environment variables are configured');
  
  // Show current configuration (masked)
  console.log('\n📊 Current Configuration:');
  console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL}`);
  console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log(`   SUPABASE_DB_HOST: ${process.env.SUPABASE_DB_HOST}`);
  console.log(`   SUPABASE_DB_USERNAME: ${process.env.SUPABASE_DB_USERNAME}`);
  console.log(`   SUPABASE_DB_PASSWORD: ${'*'.repeat(process.env.SUPABASE_DB_PASSWORD.length)}`);
  console.log(`   SUPABASE_DB_NAME: ${process.env.SUPABASE_DB_NAME}`);
  
  return true;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🔧 Supabase Migration Tool');
    console.log('');
    console.log('Commands:');
    console.log('  migrate     Generate migration file and show setup instructions');
    console.log('  credentials Show how to get Supabase credentials');
    console.log('  test        Test current Supabase configuration');
    console.log('  --help      Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/migrate-to-supabase.js migrate');
    console.log('  node scripts/migrate-to-supabase.js credentials');
    console.log('  node scripts/migrate-to-supabase.js test');
    process.exit(0);
  }
  
  const command = args[0] || 'migrate';
  
  switch (command) {
    case 'migrate':
      generateSupabaseMigration();
      break;
    case 'credentials':
      showCredentialsGuide();
      break;
    case 'test':
      testSupabaseConnection();
      break;
    default:
      console.log('Unknown command. Use --help for available commands.');
      process.exit(1);
  }
}
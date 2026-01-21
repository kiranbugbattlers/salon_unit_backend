#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

function switchDatabase(mode) {
  if (!['local', 'supabase'].includes(mode)) {
    console.error('❌ Invalid mode. Use "local" or "supabase"');
    process.exit(1);
  }

  try {
    // Read current .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace DB_MODE line
    const updatedContent = envContent.replace(
      /^DB_MODE=.*$/m,
      `DB_MODE=${mode}`
    );
    
    // Write back to .env file
    fs.writeFileSync(envPath, updatedContent);
    
    console.log(`✅ Database mode switched to: ${mode.toUpperCase()}`);
    
    if (mode === 'supabase') {
      console.log('📝 Don\'t forget to configure your Supabase environment variables:');
      console.log('   - SUPABASE_URL');
      console.log('   - SUPABASE_ANON_KEY');
      console.log('   - SUPABASE_DB_HOST');
      console.log('   - SUPABASE_DB_USERNAME');
      console.log('   - SUPABASE_DB_PASSWORD');
      console.log('   - SUPABASE_DB_NAME');
    } else {
      console.log('🏠 Using local PostgreSQL database');
      console.log('   Make sure your local database is running and accessible');
    }
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    process.exit(1);
  }
}

// Get command line argument
const mode = process.argv[2];

if (!mode) {
  console.log('🔄 Database Mode Switcher');
  console.log('Usage: node scripts/switch-db.js <mode>');
  console.log('Modes: local | supabase');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/switch-db.js local');
  console.log('  node scripts/switch-db.js supabase');
  process.exit(0);
}

switchDatabase(mode);
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple script to update all vendors to ACTIVE status
// Run this script to ensure all existing vendors have ACTIVE status

console.log('🔄 Updating all vendor statuses to ACTIVE...');

try {
  // Read the SQL file
  const sqlFile = path.join(__dirname, 'update-all-vendors-to-active.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  console.log('SQL script loaded:');
  console.log(sql);
  console.log('\n⚠️  Please run this SQL script manually against your database:');
  console.log('1. Connect to your database');
  console.log('2. Copy and execute the SQL commands from update-all-vendors-to-active.sql');
  console.log('3. This will update all vendors to ACTIVE status');
  
  console.log('\n✅ Vendor status update script prepared successfully');
  console.log('📝 After running the SQL, all vendors will have ACTIVE status regardless of payment status');
  
} catch (error) {
  console.error('❌ Error preparing vendor update:', error.message);
}

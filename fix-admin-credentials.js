#!/usr/bin/env node

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  user: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'Pass@123',
  database: process.env.DATABASE_NAME || 'salon_backend',
});

async function fixAdminCredentials() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Check if admin exists
    const admin = await client.query('SELECT * FROM admins WHERE username = $1', ['admin@salon.com']);
    
    if (admin.rows.length === 0) {
      console.log('❌ Admin user not found in database');
      
      // Create admin user with hashed password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const insertSql = `
        INSERT INTO admins (username, password, first_name, last_name, email, is_active, created_at, updated_at)
        VALUES ($1, $2, 'Admin', 'User', 'admin@salon.com', true, NOW(), NOW())
      `;
      
      await client.query(insertSql, [admin@salon.com, hashedPassword]);
      console.log('✅ Admin user created with hashed password');
      
    } else {
      const existingAdmin = admin.rows[0];
      console.log('📝 Found existing admin:', {
        username: existingAdmin.username,
        email: existingAdmin.email,
        isActive: existingAdmin.is_active
      });
      
      // Update password to match expected one
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const updateSql = `
        UPDATE admins 
        SET password = $1, updated_at = NOW()
        WHERE username = $2
      `;
      
      await client.query(updateSql, [hashedPassword, admin@salon.com]);
      console.log('✅ Admin password updated to hashed version');
    }

    console.log('\n🎉 Admin credentials fixed!');
    console.log('🚀 You can now test the business owner update API');

  } catch (error) {
    console.error('\n❌ Error fixing admin credentials:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

fixAdminCredentials();

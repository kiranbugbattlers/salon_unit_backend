#!/usr/bin/env node

const axios = require('axios');

async function testVendorStatusAPI() {
  try {
    console.log('🔄 Testing vendor status API endpoints...');
    
    const baseURL = 'http://localhost:3000/api/v1/admin/vendor-status';
    
    // Test 1: Get vendor status stats
    console.log('\n📊 Getting vendor status statistics...');
    try {
      const statsResponse = await axios.get(`${baseURL}/stats`);
      console.log('✅ Stats API Response:', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Stats API Error:', error.response?.data || error.message);
    }

    // Test 2: Get business owners by vendor status
    console.log('\n📋 Getting business owners by status...');
    try {
      const ownersResponse = await axios.get(`${baseURL}?status=hold_account&limit=5`);
      console.log('✅ Business Owners API Response:', JSON.stringify(ownersResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Business Owners API Error:', error.response?.data || error.message);
    }

    console.log('\n✅ Vendor status API test completed');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testVendorStatusAPI();

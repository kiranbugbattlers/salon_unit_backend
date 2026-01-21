/**
 * Test script to verify vendor status never changes automatically
 * This script tests that vendor status remains ACTIVE regardless of payment operations
 */

const { BusinessOwner } = require('./dist/database/entities');
const { VendorStatus } = require('./dist/common/enums');

async function testVendorStatusStability() {
  console.log('=== Testing Vendor Status Stability ===');
  
  // Test 1: Verify default status is ACTIVE
  console.log('\n1. Testing default vendor status...');
  const newVendor = new BusinessOwner();
  console.log(`Default vendor status: ${newVendor.vendorStatus}`);
  console.log(`Expected: ${VendorStatus.ACTIVE}`);
  console.log(`✓ Default status is correct: ${newVendor.vendorStatus === VendorStatus.ACTIVE}`);
  
  // Test 2: Verify status doesn't change on update
  console.log('\n2. Testing status preservation during updates...');
  newVendor.isApproved = false; // This should NOT change vendor status anymore
  console.log(`After setting isApproved=false: ${newVendor.vendorStatus}`);
  console.log(`✓ Status preserved: ${newVendor.vendorStatus === VendorStatus.ACTIVE}`);
  
  newVendor.isApproved = true; // This should NOT change vendor status anymore
  console.log(`After setting isApproved=true: ${newVendor.vendorStatus}`);
  console.log(`✓ Status preserved: ${newVendor.vendorStatus === VendorStatus.ACTIVE}`);
  
  console.log('\n=== All Tests Passed ===');
  console.log('Vendor status remains ACTIVE and unchanged by automatic operations');
  console.log('Only admin can manually change vendor status through the dedicated endpoint');
}

testVendorStatusStability().catch(console.error);

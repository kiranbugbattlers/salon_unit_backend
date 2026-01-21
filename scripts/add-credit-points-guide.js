console.log('💰 Add Credit Points to Vendor - Admin API Guide');
console.log('');

console.log('📋 ENDPOINT:');
console.log('POST /admin/vendors/{businessOwnerId}/credit');
console.log('');

console.log('📝 REQUEST BODY:');
console.log(JSON.stringify({
    "creditPoints": 1500.00,
    "reason": "Monthly credit allocation for December 2024"
}, null, 2));
console.log('');

console.log('🔧 HEADERS REQUIRED:');
console.log('Authorization: Bearer {your_admin_jwt_token}');
console.log('Content-Type: application/json');
console.log('');

console.log('💡 EXAMPLE API CALL:');
console.log('');
console.log('Using curl:');
console.log('curl -X POST \\');
console.log('  https://your-domain.com/api/v1/admin/vendors/18718212-c634-4ada-a8c7-a15f21dd7c73/credit \\');
console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"creditPoints": 1500.00, "reason": "Monthly credit allocation"}\'');
console.log('');

console.log('Using JavaScript/Fetch:');
console.log('const response = await fetch("/api/v1/admin/vendors/18718212-c634-4ada-a8c7-a15f21dd7c73/credit", {');
console.log('  method: "POST",');
console.log('  headers: {');
console.log('    "Authorization": "Bearer YOUR_JWT_TOKEN",');
console.log('    "Content-Type": "application/json"');
console.log('  },');
console.log('  body: JSON.stringify({');
console.log('    creditPoints: 1500.00,');
console.log('    reason: "Monthly credit allocation for December 2024"');
console.log('  })');
console.log('});');
console.log('');

console.log('📊 EXPECTED RESPONSE:');
console.log(JSON.stringify({
    "code": 200,
    "success": true,
    "message": "Successfully added 1500.00 credit points and activated vendor account",
    "data": {
        "id": "18718212-c634-4ada-a8c7-a15f21dd7c73",
        "shopId": "SH-C5LXSK",
        "businessName": "Royal Elite Salon",
        "ownerName": "Ashwin Suryawanshi",
        "phone": "9699200750",
        "previousCreditLimit": 0,
        "creditPointsAdded": 1500.00,
        "newCreditLimit": 1500.00,
        "accountStatus": "active",
        "reason": "Monthly credit allocation for December 2024",
        "activatedAt": "2026-01-21T12:00:00.000Z"
    }
}, null, 2));
console.log('');

console.log('⚠️ IMPORTANT NOTES:');
console.log('✅ Vendor must be approved before adding credit points');
console.log('✅ Credit points are added to vendor\'s existing credit limit');
console.log('✅ Vendor status remains unchanged (no automatic status changes)');
console.log('✅ Admin must be authenticated with valid JWT token');
console.log('✅ Use businessOwnerId, not due_payment_id');
console.log('');

console.log('🔍 VALIDATION RULES:');
console.log('- creditPoints: Must be positive number');
console.log('- reason: Optional string explaining the credit addition');
console.log('- businessOwnerId: Must be valid UUID of approved vendor');

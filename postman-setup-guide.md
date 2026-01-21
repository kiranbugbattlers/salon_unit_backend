# Postman Setup Guide for Due Payment API Testing

## 🚀 Quick Start

### 1. Import the Collection
1. Open Postman
2. Click **Import** in the top left
3. Select the `due-payment-postman-collection.json` file
4. Choose **Import as collection**

### 2. Set Environment Variables
Before running any requests, you need to configure the variables:

1. Open the imported collection
2. Go to the **📋 Setup & Variables** folder
3. Click on **"Set Environment Variables"** request
4. Go to the **Variables** tab in Postman
5. Update these variables:

```
base_url: http://localhost:3000/api/v1
jwt_token: YOUR_ACTUAL_ADMIN_JWT_TOKEN
business_owner_id: YOUR_ACTUAL_BUSINESS_OWNER_ID
```

### 3. Get Your JWT Token
You need an admin JWT token to authenticate. Here's how to get it:

#### Option A: From Your Login System
If you have an existing login system:
1. Login as an admin user
2. Copy the JWT token from the response
3. Set it in the `jwt_token` variable

#### Option B: Manual Token Generation
If you need to generate a test token:
```bash
# Using your auth endpoint
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-admin-password"
  }'
```

#### Option C: Test Token (Development Only)
For testing, you can use a test token (only works in development):
```
jwt_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### 4. Get Business Owner ID
Find a business owner ID from your database or use one of these test IDs:
```
456e7890-e12b-34c5-d678-901234567890
789e0123-e45f-67g8-h901-234567890123
012f3456-g78h-90i1-j234-567890123456
```

## 📋 Available Test Scenarios

### 📊 Due Payments Management
1. **Get All Due Payments** - Basic pagination test
2. **Get Pending Payments Only** - Filter by status
3. **Get Overdue Payments** - Filter and sort by amount
4. **Get Payments by Date Range** - Date filtering
5. **Get Due Payments Summary** - Statistics endpoint
6. **Get Specific Due Payment Details** - Individual payment lookup
7. **Create New Due Payment** - Create test payment
8. **Update Payment as Partially Paid** - Partial payment workflow
9. **Update Payment as Fully Paid** - Complete payment workflow
10. **Check Overdue Payments** - Automated overdue checking

### 🧪 Test Scenarios
1. **Complete Payment Workflow Test** - End-to-end testing
2. **Error Handling Tests** - Validation and error cases

## 🎯 Recommended Testing Order

### First Time Setup
1. Run **"Set Environment Variables"** to verify connection
2. Run **"Get Due Payments Summary"** to check API access

### Basic Functionality Testing
1. **"Get All Due Payments"** - Verify basic listing works
2. **"Create New Due Payment"** - Create a test payment
3. **"Get Specific Due Payment Details"** - Verify the created payment
4. **"Update Payment as Partially Paid"** - Test partial payment
5. **"Update Payment as Fully Paid"** - Complete the payment

### Advanced Testing
1. **"Complete Payment Workflow Test"** - Run the full workflow
2. **"Check Overdue Payments"** - Test overdue functionality
3. **Error Handling Tests** - Verify error responses

## 🔧 Common Issues & Solutions

### Issue: "401 Unauthorized"
**Solution**: Check your JWT token
- Verify the token is valid and not expired
- Ensure the token belongs to an admin user
- Make sure the token is correctly set in the `jwt_token` variable

### Issue: "404 Not Found" for Business Owner
**Solution**: Verify business owner ID
- Check if the business owner exists in your database
- Use a valid UUID format
- Ensure the business owner is approved

### Issue: "400 Bad Request"
**Solution**: Check request body
- Verify all required fields are present
- Check date format (YYYY-MM-DD)
- Ensure amounts are valid decimal numbers

### Issue: Connection Refused
**Solution**: Check server status
- Ensure your NestJS server is running on port 3000
- Verify the base URL is correct
- Check if there are any firewall issues

## 📝 Test Data Examples

### Create Payment Request Body
```json
{
    "businessOwnerId": "456e7890-e12b-34c5-d678-901234567890",
    "dueAmount": 1500.00,
    "dueDate": "2024-02-15",
    "description": "Monthly commission payment",
    "adminRemarks": "Test payment"
}
```

### Partial Payment Update
```json
{
    "paidAmount": 750.00,
    "status": "partially_paid",
    "adminRemarks": "Partial payment received"
}
```

### Full Payment Update
```json
{
    "paidAmount": 1500.00,
    "status": "paid",
    "adminRemarks": "Full payment completed"
}
```

## 🚀 Running Tests

### Individual Tests
1. Select any request from the collection
2. Ensure variables are set
3. Click **Send**

### Batch Testing
1. Select a folder (e.g., "📊 Due Payments Management")
2. Right-click and choose **Run collection**
3. Configure iteration settings if needed
4. Click **Run**

### Automated Testing
The collection includes built-in test scripts that:
- Verify HTTP status codes
- Check response structure
- Validate data integrity
- Store IDs for subsequent requests

## 📊 Expected Responses

### Success Response Structure
```json
{
    "code": 200,
    "success": true,
    "message": "Operation completed successfully",
    "data": {
        // Response data here
    }
}
```

### Error Response Structure
```json
{
    "code": 400,
    "success": false,
    "message": "Error description",
    "error": "Detailed error information"
}
```

## 🔍 Debugging Tips

### View Test Results
1. Click on the **Tests** tab in the response section
2. View individual test results
3. Check console logs for debugging info

### Variable Management
1. Use the **Variables** tab to see current values
2. Variables are automatically updated during tests
3. Manual updates persist across the session

### Request/Response Inspection
1. Use the **Body** tab to view request/response details
2. Check **Headers** for authentication
3. Use **Console** for debugging output

## 📞 Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify database connections
3. Ensure all required services are running
4. Review the API documentation in `due-payment-api-examples.md`

---

**Happy Testing! 🎉**

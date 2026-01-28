# Due Payment API Examples for Testing

This document provides comprehensive API examples for testing due payment functionality.

## Base URL
```
http://localhost:3000/api/v1/admin/due-payments
```

## Authentication
All endpoints require JWT token with Admin role.
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Get All Due Payments

### Endpoint
```
GET /api/v1/admin/due-payments
```

### Query Parameters
- `status` (optional): Filter by payment status (`pending`, `overdue`, `paid`, `partially_paid`)
- `businessOwnerId` (optional): Filter by specific business owner ID
- `fromDate` (optional): Filter from date (YYYY-MM-DD)
- `toDate` (optional): Filter to date (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sortBy` (optional): Sort field (`dueDate`, `dueAmount`, `createdAt`)
- `sortOrder` (optional): Sort order (`ASC`, `DESC`)

### Example Requests

#### Get all due payments
```bash
curl -X GET "http://localhost:3000/api/v1/admin/due-payments" \
  -H "Authorization: Bearer your-jwt-token"
```

#### Get only pending payments
```bash
curl -X GET "http://localhost:3000/api/v1/admin/due-payments?status=pending" \
  -H "Authorization: Bearer your-jwt-token"
```

#### Get overdue payments sorted by amount
```bash
curl -X GET "http://localhost:3000/api/v1/admin/due-payments?status=overdue&sortBy=dueAmount&sortOrder=DESC" \
  -H "Authorization: Bearer your-jwt-token"
```

#### Get payments for specific date range
```bash
curl -X GET "http://localhost:3000/api/v1/admin/due-payments?fromDate=2024-01-01&toDate=2024-01-31" \
  -H "Authorization: Bearer your-jwt-token"
```

#### Get payments for specific business owner
```bash
curl -X GET "http://localhost:3000/api/v1/admin/due-payments?businessOwnerId=456e7890-e12b-34c5-d678-901234567890" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "code": 200,
  "success": true,
  "message": "Due payments retrieved successfully",
  "data": {
    "duePayments": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "businessOwnerId": "456e7890-e12b-34c5-d678-901234567890",
        "businessName": "Style Salon",
        "ownerName": "John Doe",
        "mobileNumber": "+1234567890",
        "dueAmount": 1500.00,
        "paidAmount": 500.00,
        "remainingAmount": 1000.00,
        "dueDate": "2024-01-15",
        "status": "partially_paid",
        "description": "Monthly commission payment",
        "isBusinessEnabled": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-10T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "summary": {
      "totalDueAmount": 67500.00,
      "totalPaidAmount": 12500.00,
      "totalRemainingAmount": 55000.00,
      "pendingCount": 15,
      "overdueCount": 8,
      "paidCount": 12,
      "partiallyPaidCount": 10
    }
  }
}
```

---

## 2. Get Due Payments Summary

### Endpoint
```
GET /api/v1/admin/due-payments/summary
```

### Example Request
```bash
curl -X GET "http://localhost:3000/api/v1/admin/due-payments/summary" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "code": 200,
  "success": true,
  "message": "Due payments summary retrieved successfully",
  "data": {
    "totalRecords": 45,
    "totalDueAmount": 67500.00,
    "totalPaidAmount": 12500.00,
    "totalRemainingAmount": 55000.00,
    "statusBreakdown": {
      "pending": { "count": 15, "amount": 22500.00 },
      "overdue": { "count": 8, "amount": 12000.00 },
      "paid": { "count": 12, "amount": 18000.00 },
      "partiallyPaid": { "count": 10, "amount": 15000.00 }
    },
    "businessStatusBreakdown": {
      "enabled": { "count": 38, "amount": 57000.00 },
      "disabled": { "count": 7, "amount": 10500.00 }
    },
    "overdueSummary": {
      "totalOverdueAmount": 12000.00,
      "averageOverdueDays": 15,
      "oldestOverdueDate": "2023-10-15"
    }
  }
}
```

---

## 3. Get Specific Due Payment Details

### Endpoint
```
GET /api/v1/admin/due-payments/{id}
```

### Example Request
```bash
curl -X GET "http://localhost:3000/api/v1/admin/due-payments/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "code": 200,
  "success": true,
  "message": "Due payment details retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "businessOwnerId": "456e7890-e12b-34c5-d678-901234567890",
    "businessName": "Style Salon",
    "ownerName": "John Doe",
    "mobileNumber": "+1234567890",
    "email": "john@example.com",
    "dueAmount": 1500.00,
    "paidAmount": 500.00,
    "remainingAmount": 1000.00,
    "dueDate": "2024-01-15",
    "status": "partially_paid",
    "description": "Monthly commission payment",
    "remarks": "Partial payment received via bank transfer",
    "isBusinessEnabled": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-10T00:00:00.000Z"
  }
}
```

---

## 4. Create New Due Payment

### Endpoint
```
POST /api/v1/admin/due-payments
```

### Example Request
```bash
curl -X POST "http://localhost:3000/api/v1/admin/due-payments" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "businessOwnerId": "456e7890-e12b-34c5-d678-901234567890",
    "dueAmount": 1500.00,
    "dueDate": "2024-01-15",
    "description": "Monthly commission payment for December 2023",
    "remarks": "Auto-generated from daily settlement"
  }'
```

### Example Response
```json
{
  "code": 201,
  "success": true,
  "message": "Due payment created successfully",
  "data": {
    "id": "789e0123-e45f-67g8-h901-234567890123",
    "businessOwnerId": "456e7890-e12b-34c5-d678-901234567890",
    "dueAmount": 1500.00,
    "paidAmount": 0,
    "remainingAmount": 1500.00,
    "dueDate": "2024-01-15",
    "status": "pending",
    "description": "Monthly commission payment for December 2023",
    "remarks": "Auto-generated from daily settlement",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 5. Update Due Payment

### Endpoint
```
PUT /api/v1/admin/due-payments/{id}
```

### Example Request - Mark as Partially Paid
```bash
curl -X PUT "http://localhost:3000/api/v1/admin/due-payments/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "paidAmount": 750.00,
    "status": "partially_paid",
    "remarks": "Partial payment received via bank transfer"
  }'
```

### Example Request - Mark as Fully Paid
```bash
curl -X PUT "http://localhost:3000/api/v1/admin/due-payments/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "paidAmount": 1500.00,
    "status": "paid",
    "remarks": "Full payment received"
  }'
```

### Example Response
```json
{
  "code": 200,
  "success": true,
  "message": "Due payment updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "businessOwnerId": "456e7890-e12b-34c5-d678-901234567890",
    "dueAmount": 1500.00,
    "paidAmount": 750.00,
    "remainingAmount": 750.00,
    "dueDate": "2024-01-15",
    "status": "partially_paid",
    "remarks": "Partial payment received via bank transfer",
    "updatedAt": "2024-01-10T00:00:00.000Z"
  }
}
```

---

## 6. Check Overdue Payments

### Endpoint
```
POST /api/v1/admin/due-payments/check-overdue
```

### Example Request
```bash
curl -X POST "http://localhost:3000/api/v1/admin/due-payments/check-overdue" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "code": 200,
  "success": true,
  "message": "Overdue check completed. 5 payments marked as overdue.",
  "data": {
    "newlyMarkedOverdue": 5,
    "totalOverduePayments": 23,
    "processedPayments": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "businessName": "Style Salon",
        "dueAmount": 1500.00,
        "dueDate": "2024-01-10",
        "markedOverdueAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Testing Scenarios

### 1. Test Complete Workflow
```bash
# 1. Create a due payment
curl -X POST "http://localhost:3000/api/v1/admin/due-payments" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "businessOwnerId": "456e7890-e12b-34c5-d678-901234567890",
    "dueAmount": 1000.00,
    "dueDate": "2024-01-20",
    "description": "Test payment"
  }'

# 2. Get all pending payments
curl -X GET "http://localhost:3000/api/v1/admin/due-payments?status=pending" \
  -H "Authorization: Bearer your-jwt-token"

# 3. Update as partially paid
curl -X PUT "http://localhost:3000/api/v1/admin/due-payments/{payment-id}" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "paidAmount": 500.00,
    "status": "partially_paid"
  }'

# 4. Update as fully paid
curl -X PUT "http://localhost:3000/api/v1/admin/due-payments/{payment-id}" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "paidAmount": 1000.00,
    "status": "paid"
  }'
```

### 2. Test Filtering and Pagination
```bash
# Test pagination
curl -X GET "http://localhost:3000/api/v1/admin/due-payments?page=1&limit=5" \
  -H "Authorization: Bearer your-jwt-token"

# Test sorting
curl -X GET "http://localhost:3000/api/v1/admin/due-payments?sortBy=dueAmount&sortOrder=DESC" \
  -H "Authorization: Bearer your-jwt-token"

# Test date filtering
curl -X GET "http://localhost:3000/api/v1/admin/due-payments?fromDate=2024-01-01&toDate=2024-01-31" \
  -H "Authorization: Bearer your-jwt-token"
```

### 3. Test Error Cases
```bash
# Test invalid payment ID
curl -X GET "http://localhost:3000/api/v1/admin/due-payments/invalid-id" \
  -H "Authorization: Bearer your-jwt-token"

# Test invalid business owner
curl -X POST "http://localhost:3000/api/v1/admin/due-payments" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "businessOwnerId": "invalid-id",
    "dueAmount": 1000.00,
    "dueDate": "2024-01-20"
  }'

# Test unauthorized access
curl -X GET "http://localhost:3000/api/v1/admin/due-payments"
```

---

## Database Schema Reference

### VendorDuePayment Entity Fields
- `id`: UUID (Primary Key)
- `businessOwnerId`: UUID (Foreign Key to BusinessOwner)
- `dueAmount`: Decimal (12,2)
- `paidAmount`: Decimal (12,2)
- `remainingAmount`: Decimal (12,2)
- `dueDate`: Date
- `status`: Enum (pending, overdue, paid, partially_paid)
- `description`: Text (optional)
- `remarks`: Text (optional)
- `isBusinessEnabled`: Boolean
- `markedOverdueAt`: Timestamp (optional)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Status Values
- `pending`: Payment is due but not overdue
- `overdue`: Payment is past due date
- `paid`: Payment is fully paid
- `partially_paid`: Partial payment received

---

## Notes for Testing

1. **Authentication**: All endpoints require valid admin JWT token
2. **Date Format**: Use YYYY-MM-DD format for date parameters
3. **Amount Format**: Use decimal numbers (e.g., 1500.00)
4. **UUID Format**: Use valid UUID strings for ID parameters
5. **Pagination**: Default page size is 20, maximum recommended is 100
6. **Sorting**: Default sort is by dueDate ASC
7. **Error Handling**: All endpoints return proper error codes and messages

---

## Sample Test Data

### Business Owner IDs (for testing)
```
456e7890-e12b-34c5-d678-901234567890
789e0123-e45f-67g8-h901-234567890123
012f3456-g78h-90i1-j234-567890123456
```

### Sample Due Payment Creation
```json
{
  "businessOwnerId": "456e7890-e12b-34c5-d678-901234567890",
  "dueAmount": 2500.00,
  "dueDate": "2024-02-15",
  "description": "Monthly commission for January 2024",
  "remarks": "Auto-generated from settlement system"
}
```

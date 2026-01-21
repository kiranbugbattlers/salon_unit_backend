# Review System Documentation

## Overview
The review system allows customers to rate and review services they've received from business owners. The system includes comprehensive CRUD operations with role-based permissions.

## Features

### 1. Customer Review Management
- **Create Reviews**: Customers can create reviews for completed bookings
- **View Own Reviews**: Customers can view all their reviews
- **Edit Reviews**: Customers can edit their own reviews (rating and comment)
- **Delete Reviews**: Customers can delete their own reviews

### 2. Business Owner Review Management
- **View Business Reviews**: Business owners can view all reviews for their business
- **Approve/Disapprove**: Business owners can approve or disapprove reviews
- **Delete Reviews**: Business owners can delete reviews for their business

### 3. Admin Review Management
- **Full CRUD Access**: Admins can perform all CRUD operations on any review
- **Advanced Filtering**: Filter by business owner, customer, rating, approval status
- **System-wide Oversight**: Complete visibility into all reviews

## API Endpoints

### Customer Endpoints

#### Create Review
```
POST /customer/reviews
Authorization: Bearer JWT (Customer role)
```

**Request Body:**
```json
{
  "bookingId": "uuid",
  "rating": 5,
  "comment": "Excellent service!"
}
```

#### Get My Reviews
```
GET /customer/reviews/my-reviews?rating=5&page=1&limit=10
Authorization: Bearer JWT (Customer role)
```

#### Get Review by ID
```
GET /customer/reviews/:reviewId
Authorization: Bearer JWT (Customer role)
```

#### Update Review
```
PUT /customer/reviews/:reviewId
Authorization: Bearer JWT (Customer role)
```

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review text"
}
```

#### Delete Review
```
DELETE /customer/reviews/:reviewId
Authorization: Bearer JWT (Customer role)
```

### Business Owner Endpoints

#### Get My Business Reviews
```
GET /business-owner/reviews/my-reviews?rating=5&isApproved=true&page=1&limit=10
Authorization: Bearer JWT (Business Owner role)
```

#### Get Review by ID
```
GET /business-owner/reviews/:reviewId
Authorization: Bearer JWT (Business Owner role)
```

#### Approve/Disapprove Review
```
PUT /business-owner/reviews/:reviewId/approve
Authorization: Bearer JWT (Business Owner role)
```

**Request Body:**
```json
{
  "isApproved": true
}
```

#### Delete Review
```
DELETE /business-owner/reviews/:reviewId
Authorization: Bearer JWT (Business Owner role)
```

### Admin Endpoints

#### Get All Reviews
```
GET /admin/reviews?businessOwnerId=uuid&customerId=uuid&rating=5&isApproved=true&page=1&limit=10
Authorization: Bearer JWT (Admin role)
```

#### Get Review by ID
```
GET /admin/reviews/:reviewId
Authorization: Bearer JWT (Admin role)
```

#### Update Any Review
```
PUT /admin/reviews/:reviewId
Authorization: Bearer JWT (Admin role)
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Admin updated review",
  "isApproved": true
}
```

#### Delete Any Review
```
DELETE /admin/reviews/:reviewId
Authorization: Bearer JWT (Admin role)
```

#### Get Reviews by Business Owner
```
GET /admin/reviews/business/:businessOwnerId
Authorization: Bearer JWT (Admin role)
```

#### Get Reviews by Customer
```
GET /admin/reviews/customer/:customerId
Authorization: Bearer JWT (Admin role)
```

## Database Schema

### Review Entity
```typescript
@Entity('reviews')
export class Review {
  id: string;                    // UUID primary key
  bookingId: string;             // Foreign key to booking
  customerId: string;            // Foreign key to customer
  businessOwnerId: string;       // Foreign key to business owner
  rating: number;                // 1-5 rating
  comment?: string;              // Optional review text
  isApproved: boolean;           // Approval status
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Update timestamp
  
  // Relations
  booking: Booking;
  customer: Customer;
  businessOwner: BusinessOwner;
}
```

## Business Rules

### Review Creation
- Only one review per booking is allowed
- Reviews can only be created for bookings belonging to the customer
- Booking must exist and be valid

### Permission System
- **Customers**: Can only manage their own reviews
- **Business Owners**: Can manage reviews for their own business
- **Admins**: Full access to all reviews

### Approval System
- Reviews default to `isApproved: false`
- Business owners can approve/disapprove reviews for their business
- Admins can approve/disapprove any review
- Only approved reviews should be shown publicly

### Rating System
- Ratings must be between 1 and 5
- Ratings are required (cannot be null)

## Error Handling

### Common Error Responses
- **400 Bad Request**: Invalid data, duplicate review
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Review, booking, or entity not found

### Example Error Response
```json
{
  "statusCode": 400,
  "message": "Review already exists for this booking",
  "error": "Bad Request"
}
```

## Response Formats

### Review Response
```json
{
  "id": "uuid",
  "bookingId": "uuid",
  "customerId": "uuid",
  "businessOwnerId": "uuid",
  "rating": 5,
  "comment": "Great service!",
  "isApproved": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "customer": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "businessOwner": {
    "id": "uuid",
    "businessName": "Salon ABC",
    "shopId": "SH-123456"
  }
}
```

### Paginated Response
```json
{
  "reviews": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

## Integration Notes

### Dependencies
- TypeORM entities: Review, Booking, Customer, BusinessOwner
- JWT authentication with role-based access control
- NestJS framework with Swagger documentation

### Database Relationships
- Review → Booking (Many-to-One)
- Review → Customer (Many-to-One)
- Review → BusinessOwner (Many-to-One)
- Customer → Review (One-to-Many)
- BusinessOwner → Review (One-to-Many)

### Security Considerations
- All endpoints require JWT authentication
- Role-based permissions enforced at service level
- Input validation with class-validator decorators
- SQL injection prevention through TypeORM

## Testing Recommendations

### Unit Tests
- Review service methods
- Permission validation logic
- DTO validation

### Integration Tests
- API endpoints with different user roles
- Database operations
- Error scenarios

### Test Cases
- Create review for valid booking
- Attempt duplicate review creation
- Unauthorized access attempts
- Permission boundary testing
- Approval workflow testing

## Future Enhancements

### Potential Features
- Review photos/images
- Review responses from business owners
- Review analytics and reporting
- Review sentiment analysis
- Review flagging system
- Email notifications for new reviews

### Performance Considerations
- Database indexing on frequently queried fields
- Caching for popular business reviews
- Pagination optimization for large datasets
- Background processing for review analytics

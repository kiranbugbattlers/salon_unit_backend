-- Insert test data for review functionality
-- Customer ID from your user data: 056b1417-fd1a-43c1-acc1-4395307d656f

-- First, let's get the customer ID for the user
-- (Assuming customer profile exists, if not, we need to create it)

-- Create customer profile if it doesn't exist
INSERT INTO customers (id, user_id, first_name, created_at, updated_at)
VALUES (
    'customer-uuid-1',
    '056b1417-fd1a-43c1-acc1-4395307d656f',
    'jayuser',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Create a test business owner
INSERT INTO business_owners (id, user_id, business_name, shop_id, created_at, updated_at)
VALUES (
    'business-owner-uuid-1',
    'user-business-owner-1',
    'Test Salon',
    'shop-uuid-1',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create a test staff member
INSERT INTO staff (id, business_owner_id, first_name, last_name, created_at, updated_at)
VALUES (
    'staff-uuid-1',
    'business-owner-uuid-1',
    'John',
    'Smith',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create a test service
INSERT INTO services (id, business_owner_id, name, description, price, duration_minutes, created_at, updated_at)
VALUES (
    'service-uuid-1',
    'business-owner-uuid-1',
    'Haircut',
    'Professional haircut service',
    500.00,
    30,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create test bookings for the customer
INSERT INTO bookings (
    id,
    customer_id,
    business_owner_id,
    staff_id,
    service_id,
    appointment_date,
    start_time,
    end_time,
    service_location,
    total_amount,
    status,
    otp_code,
    payment_completed,
    created_at,
    updated_at
) VALUES 
(
    'booking-uuid-1',
    'customer-uuid-1',
    'business-owner-uuid-1',
    'staff-uuid-1',
    'service-uuid-1',
    CURRENT_DATE - INTERVAL '1 day',
    '10:00:00',
    '10:30:00',
    'in-salon',
    500.00,
    'completed',
    '123456',
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),
(
    'booking-uuid-2',
    'customer-uuid-1',
    'business-owner-uuid-1',
    'staff-uuid-1',
    'service-uuid-1',
    CURRENT_DATE - INTERVAL '2 days',
    '14:00:00',
    '14:30:00',
    'in-salon',
    500.00,
    'completed',
    '654321',
    true,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Create user for business owner if it doesn't exist
INSERT INTO users (id, phone, email, is_phone_verified, created_at, updated_at)
VALUES (
    'user-business-owner-1',
    '9876543210',
    'businessowner@test.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create user role for business owner
INSERT INTO user_roles (user_id, role, created_at, updated_at)
VALUES (
    'user-business-owner-1',
    'business_owner',
    NOW(),
    NOW()
) ON CONFLICT (user_id, role) DO NOTHING;

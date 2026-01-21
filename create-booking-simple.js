const { Client } = require('pg');

async function createBooking() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Rushi@26',
    database: 'salon_backend1',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Use existing business owner
    const businessOwnerId = '97155656-ca4b-4c6e-ad99-ba9763ea47ec';
    const customerId = 'ed1578bf-3483-451a-a39e-1c0420dec712';
    
    // Create staff for this business owner
    const staffResult = await client.query(`
      INSERT INTO staff (id, business_owner_id, first_name, last_name, phone, date_of_birth, gender, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
      RETURNING id
    `, [businessOwnerId, 'John', 'Smith', '7777777777', '1990-01-01', 'male']);

    const staffId = staffResult.rows[0].id;
    console.log('Staff created with ID:', staffId);

    // Create service (global service)
    const serviceResult = await client.query(`
      INSERT INTO services (id, category_id, name, description, base_price, default_duration, available_at_home, is_active, gender, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, true, $6, NOW(), NOW())
      RETURNING id
    `, ['6cf9ef1a-ba7d-40c7-a7db-05d38e806f66', 'Haircut', 'Professional haircut service', 500.00, 30, 'male']);

    const serviceId = serviceResult.rows[0].id;
    console.log('Service created with ID:', serviceId);

    // Link service to business owner
    await client.query(`
      INSERT INTO business_services (id, business_owner_id, service_id, custom_price, custom_duration_minutes, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW())
    `, [businessOwnerId, serviceId, 500.00, 30]);

    console.log('Service linked to business owner');

    // Create booking
    const bookingId = '550e8400-e29b-41d4-a716-446655440001';
    
    await client.query(`
      INSERT INTO bookings (
        id, customer_id, business_owner_id, staff_id, service_id,
        appointment_date, start_time, end_time, service_location,
        total_amount, status, otp_code, payment_completed,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        CURRENT_DATE - INTERVAL '1 day', '10:00:00', '10:30:00', 'in-salon',
        500.00, 'completed', '123456', true,
        NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
      )
    `, [bookingId, customerId, businessOwnerId, staffId, serviceId]);

    console.log('Test booking created with ID:', bookingId);
    console.log('');
    console.log('✅ SUCCESS! You can now test reviews with this booking ID:');
    console.log('📋 Booking ID:', bookingId);
    console.log('');
    console.log('📝 Use this JSON to create a review:');
    console.log(`{
  "bookingId": "${bookingId}",
  "rating": 5,
  "comment": "Excellent service! Very professional and friendly staff."
}`);
    console.log('');
    console.log('🔗 Endpoint: POST http://localhost:3000/api/v1/customer/reviews');
    console.log('🔑 Use your JWT token from login');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

createBooking();

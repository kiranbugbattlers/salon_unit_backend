const { Client } = require('pg');

async function insertTestData() {
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

    // First, check if customer exists
    const customerResult = await client.query(
      'SELECT id FROM customers WHERE user_id = $1',
      ['056b1417-fd1a-43c1-acc1-4395307d656f']
    );

    let customerId;
    if (customerResult.rows.length === 0) {
      // Create customer
      const insertCustomer = await client.query(`
        INSERT INTO customers (id, user_id, first_name, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
        RETURNING id
      `, ['056b1417-fd1a-43c1-acc1-4395307d656f', 'jayuser']);
      customerId = insertCustomer.rows[0].id;
      console.log('Customer created with ID:', customerId);
    } else {
      customerId = customerResult.rows[0].id;
      console.log('Customer found with ID:', customerId);
    }

    // Create a simple booking for testing
    const businessUserId = '550e8400-e29b-41d4-a716-446655440000';
    const bookingId = '550e8400-e29b-41d4-a716-446655440001';
    
    // First create minimal required related data
    const userExists = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [businessUserId]
    );
    
    if (userExists.rows.length === 0) {
      await client.query(`
        INSERT INTO users (id, phone, is_phone_verified, created_at, updated_at)
        VALUES ($1, $2, true, NOW(), NOW())
      `, [businessUserId, '9876543210']);
    }

    const roleExists = await client.query(
      'SELECT id FROM user_roles WHERE user_id = $1 AND role = $2',
      [businessUserId, 'business_owner']
    );
    
    if (roleExists.rows.length === 0) {
      await client.query(`
        INSERT INTO user_roles (user_id, role, created_at)
        VALUES ($1, 'business_owner', NOW())
      `, [businessUserId]);
    }

    const businessOwnerResult = await client.query(`
      INSERT INTO business_owner (id, user_id, business_name, shop_id, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, 'SHOP67890', NOW(), NOW())
      RETURNING id
    `, [businessUserId, 'Test Salon']);

    const businessOwnerId = businessOwnerResult.rows[0].id;

    // Create staff
    const staffResult = await client.query(`
      INSERT INTO staff (id, business_owner_id, first_name, last_name, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
      RETURNING id
    `, [businessOwnerId, 'TestStaff', 'Smith']);

    const staffId = staffResult.rows[0].id;

    // Create service
    const serviceResult = await client.query(`
      INSERT INTO services (id, business_owner_id, name, price, duration_minutes, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, 500.00, 30, NOW(), NOW())
      RETURNING id
    `, [businessOwnerId, 'Test Haircut']);

    const serviceId = serviceResult.rows[0].id;

    // Create booking
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
    console.log('You can now test reviews with this booking ID:');
    console.log('Booking ID:', bookingId);
    console.log('');
    console.log('Use this in your review request:');
    console.log(`{
  "bookingId": "${bookingId}",
  "rating": 5,
  "comment": "Excellent service!"
}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

insertTestData();

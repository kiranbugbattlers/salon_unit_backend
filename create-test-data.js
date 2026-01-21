const { DataSource } = require('typeorm');
const { User, Customer, BusinessOwner, Staff, Service, Booking } = require('./src/database/entities');

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Rushi@26',
  database: 'salon_backend1',
  synchronize: false,
  logging: true,
  entities: ['src/database/entities/*.ts'],
});

async function createTestData() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const userRepository = AppDataSource.getRepository(User);
    const customerRepository = AppDataSource.getRepository(Customer);
    const businessOwnerRepository = AppDataSource.getRepository(BusinessOwner);
    const staffRepository = AppDataSource.getRepository(Staff);
    const serviceRepository = AppDataSource.getRepository(Service);
    const bookingRepository = AppDataSource.getRepository(Booking);

    // Get or create customer
    let customer = await customerRepository.findOne({ 
      where: { userId: '056b1417-fd1a-43c1-acc1-4395307d656f' } 
    });
    
    if (!customer) {
      customer = customerRepository.create({
        id: 'customer-uuid-1',
        userId: '056b1417-fd1a-43c1-acc1-4395307d656f',
        firstName: 'jayuser',
      });
      await customerRepository.save(customer);
      console.log('Customer created');
    }

    // Create business owner user
    let businessOwnerUser = await userRepository.findOne({ 
      where: { phone: '9876543210' } 
    });
    
    if (!businessOwnerUser) {
      businessOwnerUser = userRepository.create({
        id: 'user-business-owner-1',
        phone: '9876543210',
        email: 'businessowner@test.com',
        isPhoneVerified: true,
      });
      await userRepository.save(businessOwnerUser);
      console.log('Business owner user created');
    }

    // Create business owner
    let businessOwner = await businessOwnerRepository.findOne({ 
      where: { userId: 'user-business-owner-1' } 
    });
    
    if (!businessOwner) {
      businessOwner = businessOwnerRepository.create({
        id: 'business-owner-uuid-1',
        userId: 'user-business-owner-1',
        businessName: 'Test Salon',
        shopId: 'shop-uuid-1',
      });
      await businessOwnerRepository.save(businessOwner);
      console.log('Business owner created');
    }

    // Create staff
    let staff = await staffRepository.findOne({ 
      where: { id: 'staff-uuid-1' } 
    });
    
    if (!staff) {
      staff = staffRepository.create({
        id: 'staff-uuid-1',
        businessOwnerId: businessOwner.id,
        firstName: 'John',
        lastName: 'Smith',
      });
      await staffRepository.save(staff);
      console.log('Staff created');
    }

    // Create service
    let service = await serviceRepository.findOne({ 
      where: { id: 'service-uuid-1' } 
    });
    
    if (!service) {
      service = serviceRepository.create({
        id: 'service-uuid-1',
        businessOwnerId: businessOwner.id,
        name: 'Haircut',
        description: 'Professional haircut service',
        price: 500.00,
        durationMinutes: 30,
      });
      await serviceRepository.save(service);
      console.log('Service created');
    }

    // Create bookings
    const booking1 = {
      id: 'booking-uuid-1',
      customerId: customer.id,
      businessOwnerId: businessOwner.id,
      staffId: staff.id,
      serviceId: service.id,
      appointmentDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      startTime: '10:00:00',
      endTime: '10:30:00',
      serviceLocation: 'in-salon',
      totalAmount: 500.00,
      status: 'completed',
      otpCode: '123456',
      paymentCompleted: true,
    };

    const booking2 = {
      id: 'booking-uuid-2',
      customerId: customer.id,
      businessOwnerId: businessOwner.id,
      staffId: staff.id,
      serviceId: service.id,
      appointmentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      startTime: '14:00:00',
      endTime: '14:30:00',
      serviceLocation: 'in-salon',
      totalAmount: 500.00,
      status: 'completed',
      otpCode: '654321',
      paymentCompleted: true,
    };

    // Check if bookings already exist
    const existingBooking1 = await bookingRepository.findOne({ 
      where: { id: 'booking-uuid-1' } 
    });
    const existingBooking2 = await bookingRepository.findOne({ 
      where: { id: 'booking-uuid-2' } 
    });

    if (!existingBooking1) {
      await bookingRepository.save(bookingRepository.create(booking1));
      console.log('Booking 1 created');
    }

    if (!existingBooking2) {
      await bookingRepository.save(bookingRepository.create(booking2));
      console.log('Booking 2 created');
    }

    console.log('Test data created successfully!');
    console.log('Booking IDs for testing reviews:');
    console.log('- booking-uuid-1');
    console.log('- booking-uuid-2');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

createTestData();

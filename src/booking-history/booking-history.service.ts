import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Booking } from '../database/entities/booking.entity';
import { Payment } from '../database/entities/payment.entity';
import { BookingHistoryDto, BookingHistoryListDto, BookingHistoryQueryDto } from './dto/booking-history.dto';
import { Customer } from '../database/entities/customer.entity';

@Injectable()
export class BookingHistoryService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findAll(
    customerId: string,
    query: BookingHistoryQueryDto
  ): Promise<BookingHistoryListDto> {
    console.log('Booking History Query:', JSON.stringify(query, null, 2));
    console.log('Customer ID:', customerId);
    
    const {
      date,
      appointmentDate,
      paymentMethod,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy = 'bookingDateTime',
      sortOrder = 'DESC'
    } = query;

    // Build query conditions
    const whereConditions: any = { customerId };

    // Temporarily comment out date filtering to test if bookings exist
    console.log('Date filtering temporarily disabled for testing');
    
    // Handle specific date filtering (takes priority over date range)
    // if (date || appointmentDate) {
    //   const targetDate = new Date(date || appointmentDate);
    //   const startOfDay = new Date(targetDate);
    //   startOfDay.setHours(0, 0, 0, 0); // Start of day: 00:00:00.000
      
    //   const endOfDay = new Date(targetDate);
    //   endOfDay.setHours(23, 59, 59, 999); // End of day: 23:59:59.999
      
    //   // Filter by appointment date (bookingDateTime field)
    //   whereConditions.appointmentDate = Between(startOfDay, endOfDay);
    // } else if (fromDate || toDate) {
    //   const dateFilter: any = {};
    //   if (fromDate) {
    //     dateFilter[0] = new Date(fromDate);
    //   }
    //   if (toDate) {
    //     dateFilter[1] = new Date(toDate);
    //   }
      
    //   if (fromDate && toDate) {
    //     whereConditions.appointmentDate = Between(dateFilter[0], dateFilter[1]);
    //   } else if (fromDate) {
    //     whereConditions.appointmentDate = MoreThanOrEqual(dateFilter[0]);
    //   } else if (toDate) {
    //     whereConditions.appointmentDate = LessThanOrEqual(dateFilter[1]);
    //   }
    // }

    // Validate sort field
    const validSortFields = ['appointmentDate', 'createdAt', 'totalAmount'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'appointmentDate';
    const sortDirection = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    // Get total count
    const total = await this.bookingRepository.count({
      where: whereConditions,
    });

    console.log('Booking History Query Conditions:', JSON.stringify(whereConditions, null, 2));
    console.log('Total bookings found:', total);

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get bookings with relations
    const bookings = await this.bookingRepository.find({
      where: whereConditions,
      relations: ['customer'],
      order: {
        [sortField]: sortDirection,
      },
      skip,
      take: limit,
    });

    console.log('Raw bookings found:', bookings.length);
    console.log('Sample booking:', bookings[0] ? JSON.stringify(bookings[0], null, 2) : 'No bookings');

    // Transform to DTO format
    const bookingDtos = [];
    for (const booking of bookings) {
      console.log('Transforming booking:', booking.id);
      const dto = await this.transformToDto(booking, paymentMethod);
      console.log('DTO result:', dto ? 'Success' : 'Failed/Null');
      if (dto) {
        bookingDtos.push(dto);
      }
    }

    console.log('Final DTOs count:', bookingDtos.length);

    return {
      bookings: bookingDtos,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
    };
  }

  async findOne(
    customerId: string,
    bookingId: string
  ): Promise<BookingHistoryDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['customer'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify ownership
    if (booking.customerId !== customerId) {
      throw new ForbiddenException('Access denied: You can only view your own bookings');
    }

    return this.transformToDto(booking);
  }

  private async transformToDto(
    booking: Booking,
    paymentMethodFilter?: string
  ): Promise<BookingHistoryDto> {
    // Get customer name and user ID
    let customerName = 'Unknown Customer';
    let userId = null;
    if (booking.customer) {
      customerName = `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim() || 'Unknown Customer';
      userId = booking.customer.userId;
    }

    // Get payment method for this booking
    let paymentMethod = 'Unknown';
    try {
      const payment = await this.paymentRepository.findOne({
        where: { bookingId: booking.id },
        order: { createdAt: 'DESC' },
      });
      
      if (payment) {
        paymentMethod = payment.paymentMethod || 'Unknown';
      }
    } catch (error) {
      // If payment lookup fails, use default
      paymentMethod = 'Unknown';
    }

    // Apply payment method filter if specified
    if (paymentMethodFilter && paymentMethod.toLowerCase() !== paymentMethodFilter.toLowerCase()) {
      console.log(`Payment method filter: ${paymentMethodFilter} != ${paymentMethod}, returning null`);
      return null;
    }

    // Create combined booking date-time
    let bookingDateTime = booking.createdAt;
    if (booking.appointmentDate) {
      const appointmentDate = booking.appointmentDate instanceof Date 
        ? booking.appointmentDate 
        : new Date(booking.appointmentDate);
      
      // If we have start time, combine with appointment date
      if (booking.startTime) {
        const [hours, minutes] = booking.startTime.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      bookingDateTime = appointmentDate;
    }

    return {
      bookingId: booking.id,
      customerName,
      userId,
      bookingAmount: booking.totalAmount,
      paymentMethod,
      bookingDateTime,
      createdAt: booking.createdAt,
    };
  }

  async findCustomerByUserId(userId: string): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: { userId },
    });
  }
}

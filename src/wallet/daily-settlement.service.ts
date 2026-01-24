import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  DailySettlement,
  SettlementPaidStatus,
  Booking,
  BusinessOwner,
  BusinessAddress,
  User,
  PaymentMethodType,
  CommissionConfig,
} from '../database/entities';
import { BookingStatus } from '../common/enums';

@Injectable()
export class DailySettlementService {
  private readonly logger = new Logger(DailySettlementService.name);
  
  // Commission rates
  // These should be fetched from CommissionConfig, but defaults are kept here as fallback
  private readonly DEFAULT_COMMISSION_PERCENT = 8.00;
  private readonly DEFAULT_GST_PERCENT = 18.00;

  constructor(
    @InjectRepository(DailySettlement)
    private readonly dailySettlementRepository: Repository<DailySettlement>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(BusinessAddress)
    private readonly businessAddressRepository: Repository<BusinessAddress>,
    @InjectRepository(CommissionConfig)
    private readonly commissionConfigRepository: Repository<CommissionConfig>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get active commission config
   */
  private async getCommissionConfig(date: Date = new Date()): Promise<{ commissionPercent: number; gstPercent: number }> {
    const config = await this.commissionConfigRepository.findOne({
      where: {
        isActive: true,
        effectiveFrom: LessThanOrEqual(date),
      },
      order: {
        effectiveFrom: 'DESC',
      },
    });

    return {
      commissionPercent: config ? Number(config.businessOwnerCommissionPercent) : this.DEFAULT_COMMISSION_PERCENT,
      gstPercent: this.DEFAULT_GST_PERCENT, // GST is currently not in config, keeping default
    };
  }

  /**
   * Get all approved businesses with their calculated settlement data
   * Supports single date OR date range (startDate/endDate)
   */
  async getAllSettlements(filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    businesses: any[];
    total: number;
    page: number;
    totalPages: number;
    dateFilter: { date?: string; startDate?: string; endDate?: string };
    summary: {
      totalTransactionsAmount: number;
      totalCashAmount: number;
      totalOnlineAmount: number;
      totalCommissionAmount: number;
      totalGstAmount: number;
      totalDeduction: number;
      totalSettlementAmount: number;
      totalBusinesses: number;
    };
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    // Build date filters
    let startOfRange: Date | null = null;
    let endOfRange: Date | null = null;

    const isValidDate = (d: any) => d && d !== 'null' && !isNaN(new Date(d).getTime());

    if (isValidDate(filters?.date)) {
      startOfRange = new Date(`${filters.date}T00:00:00`);
      endOfRange = new Date(`${filters.date}T23:59:59.999`);
    } else if (isValidDate(filters?.startDate) || isValidDate(filters?.endDate)) {
      const sDate = isValidDate(filters?.startDate) ? filters.startDate : '2000-01-01';
      const eDate = isValidDate(filters?.endDate) ? filters.endDate : new Date().toISOString().split('T')[0];
      
      startOfRange = new Date(`${sDate}T00:00:00`);
      endOfRange = new Date(`${eDate}T23:59:59.999`);
    }

    // Get all approved business owners for pagination
    const [allBusinesses, totalBusinesses] = await this.businessOwnerRepository
      .createQueryBuilder('bo')
      .leftJoinAndSelect('bo.user', 'user')
      .leftJoinAndSelect('bo.addresses', 'addresses')
      .where('bo.isApproved = :isApproved', { isApproved: true })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const businessesWithSettlement = [];
    const summaryTotals = {
      totalTransactionsAmount: 0,
      totalCashAmount: 0,
      totalOnlineAmount: 0,
      totalCommissionAmount: 0,
      totalGstAmount: 0,
      totalDeduction: 0,
      totalSettlementAmount: 0,
    };

    // Get active commission config for the period
    const configDate = endOfRange || new Date();
    const { commissionPercent, gstPercent } = await this.getCommissionConfig(configDate);

    for (const business of allBusinesses) {
      // Get booking stats for this business and date range
      let statsQuery = this.bookingRepository
        .createQueryBuilder('b')
        .where('b.businessOwnerId = :businessOwnerId', { businessOwnerId: business.id })
        .andWhere('b.status = :status', { status: BookingStatus.COMPLETED });

      if (startOfRange && endOfRange) {
        statsQuery.andWhere('b.serviceCompletedAt BETWEEN :startOfRange AND :endOfRange', { startOfRange, endOfRange });
      } else if (startOfRange) {
        statsQuery.andWhere('b.serviceCompletedAt >= :startOfRange', { startOfRange });
      } else if (endOfRange) {
        statsQuery.andWhere('b.serviceCompletedAt <= :endOfRange', { endOfRange });
      }

      let stats = await statsQuery
        .select('COUNT(*)', 'count')
        .addSelect('COALESCE(SUM(b.totalAmount), 0)', 'total')
        .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${PaymentMethodType.COD}' THEN b.totalAmount ELSE 0 END), 0)`, 'cash')
        .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${PaymentMethodType.ONLINE}' THEN b.totalAmount ELSE 0 END), 0)`, 'online')
        .getRawOne();

      // Fallback for individual business stats
      if (parseInt(stats.count) === 0 && startOfRange && endOfRange) {
        let fallbackQuery = this.bookingRepository
          .createQueryBuilder('b')
          .where('b.businessOwnerId = :businessOwnerId', { businessOwnerId: business.id })
          .andWhere('b.status = :status', { status: BookingStatus.COMPLETED })
          .andWhere('b.appointmentDate BETWEEN :startOfRange AND :endOfRange', { 
            startOfRange: startOfRange.toISOString().split('T')[0], 
            endOfRange: endOfRange.toISOString().split('T')[0] 
          });
          
        stats = await fallbackQuery
          .select('COUNT(*)', 'count')
          .addSelect('COALESCE(SUM(b.totalAmount), 0)', 'total')
          .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${PaymentMethodType.COD}' THEN b.totalAmount ELSE 0 END), 0)`, 'cash')
          .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${PaymentMethodType.ONLINE}' THEN b.totalAmount ELSE 0 END), 0)`, 'online')
          .getRawOne();
      }

      const totalTransactionsCount = parseInt(stats.count) || 0;
      const totalTransactionsAmount = parseFloat(stats.total) || 0;
      const totalCashAmount = parseFloat(stats.cash) || 0;
      const totalOnlineAmount = parseFloat(stats.online) || 0;

      // Calculate financials
      const commissionAmount = (totalTransactionsAmount * commissionPercent) / 100;
      const gstAmount = (commissionAmount * gstPercent) / 100;
      const totalDeduction = commissionAmount + gstAmount;
      // Settlement is what Admin owes Vendor. Admin holds Online money.
      const settlementAmount = totalOnlineAmount - totalDeduction;

      // Check for actual paid status in DailySettlement table
      let paidStatus = SettlementPaidStatus.PENDING;
      if (filters?.date) {
        const existingSettlement = await this.dailySettlementRepository.findOne({
          where: {
            businessOwnerId: business.id,
            settlementDate: new Date(filters.date),
          },
        });
        if (existingSettlement) {
          paidStatus = existingSettlement.paidStatus;
        }
      }

      const ownerName = [business.firstName, business.lastName].filter(Boolean).join(' ') || 'N/A';
      const salonName = business.businessName || 'N/A';
      const email = business.user?.email || '';
      const mobileNumber = business.user?.phone || '';
      
      const primaryAddress = business.addresses?.find(a => a.isPrimary) || business.addresses?.[0];
      const address = primaryAddress
        ? [primaryAddress.streetAddress, primaryAddress.city, primaryAddress.state, primaryAddress.postalCode]
            .filter(Boolean)
            .join(', ')
        : 'N/A';

      businessesWithSettlement.push({
        businessOwnerId: business.id,
        ownerName,
        salonName,
        email,
        mobileNumber,
        address,
        totalTransactionsCount,
        totalTransactionsAmount,
        totalCashAmount,
        totalOnlineAmount,
        commissionPercent: commissionPercent,
        commissionAmount: Math.round(commissionAmount * 100) / 100,
        gstPercent: gstPercent,
        gstAmount: Math.round(gstAmount * 100) / 100,
        totalDeduction: Math.round(totalDeduction * 100) / 100,
        settlementAmount: Math.round(settlementAmount * 100) / 100,
        paidStatus: paidStatus,
        date: filters?.date || null,
      });

      // Add to summary
      summaryTotals.totalTransactionsAmount += totalTransactionsAmount;
      summaryTotals.totalCashAmount += totalCashAmount;
      summaryTotals.totalOnlineAmount += totalOnlineAmount;
      summaryTotals.totalCommissionAmount += commissionAmount;
      summaryTotals.totalGstAmount += gstAmount;
      summaryTotals.totalDeduction += totalDeduction;
      summaryTotals.totalSettlementAmount += settlementAmount;
    }

    return {
      businesses: businessesWithSettlement,
      total: totalBusinesses,
      page,
      totalPages: Math.ceil(totalBusinesses / limit),
      dateFilter: {
        date: filters.date,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
      summary: {
        totalTransactionsAmount: Math.round(summaryTotals.totalTransactionsAmount * 100) / 100,
        totalCashAmount: Math.round(summaryTotals.totalCashAmount * 100) / 100,
        totalOnlineAmount: Math.round(summaryTotals.totalOnlineAmount * 100) / 100,
        totalCommissionAmount: Math.round(summaryTotals.totalCommissionAmount * 100) / 100,
        totalGstAmount: Math.round(summaryTotals.totalGstAmount * 100) / 100,
        totalDeduction: Math.round(summaryTotals.totalDeduction * 100) / 100,
        totalSettlementAmount: Math.round(summaryTotals.totalSettlementAmount * 100) / 100,
        totalBusinesses,
      },
    };
  }

  /**
   * Get all settlement history - all completed bookings across all dates
   * For UI to filter by weekly/monthly
   */
  async getAllHistory(filters: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    businessOwnerId?: string;
  }): Promise<any> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    // Build query for all completed bookings
    let bookingQuery = this.bookingRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.businessOwner', 'businessOwner')
      .leftJoinAndSelect('businessOwner.user', 'boUser')
      .leftJoinAndSelect('businessOwner.addresses', 'addresses')
      .leftJoinAndSelect('b.customer', 'customer')
      .where('b.status = :status', { status: BookingStatus.COMPLETED })
      .andWhere('b.serviceCompletedAt IS NOT NULL');

    // Apply optional filters
    if (filters?.startDate) {
      bookingQuery.andWhere('b.serviceCompletedAt >= :startDate', { 
        startDate: new Date(filters.startDate) 
      });
    }

    if (filters?.endDate) {
      bookingQuery.andWhere('b.serviceCompletedAt <= :endDate', { 
        endDate: new Date(filters.endDate + 'T23:59:59') 
      });
    }

    if (filters?.businessOwnerId) {
      bookingQuery.andWhere('b.businessOwnerId = :businessOwnerId', { 
        businessOwnerId: filters.businessOwnerId 
      });
    }

    // Get total count for pagination
    const totalCount = await bookingQuery.getCount();

    // Get paginated bookings
    const bookings = await bookingQuery
      .orderBy('b.serviceCompletedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    // Calculate summary from ALL matching bookings
    const summaryQuery = this.bookingRepository
      .createQueryBuilder('b')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(b.totalAmount), 0)', 'total')
      .where('b.status = :status', { status: BookingStatus.COMPLETED })
      .andWhere('b.serviceCompletedAt IS NOT NULL');

    if (filters?.startDate) {
      summaryQuery.andWhere('b.serviceCompletedAt >= :startDate', { 
        startDate: new Date(filters.startDate) 
      });
    }
    if (filters?.endDate) {
      summaryQuery.andWhere('b.serviceCompletedAt <= :endDate', { 
        endDate: new Date(filters.endDate + 'T23:59:59') 
      });
    }
    if (filters?.businessOwnerId) {
      summaryQuery.andWhere('b.businessOwnerId = :businessOwnerId', { 
        businessOwnerId: filters.businessOwnerId 
      });
    }

    // Get active commission config
    const configDate = filters?.endDate ? new Date(filters.endDate) : new Date();
    const { commissionPercent, gstPercent } = await this.getCommissionConfig(configDate);

    const summaryResult = await summaryQuery.getRawOne();
    const totalTransactionsAmount = parseFloat(summaryResult.total) || 0;
    const commissionAmount = (totalTransactionsAmount * commissionPercent) / 100;
    const gstAmount = (commissionAmount * gstPercent) / 100;
    const totalDeduction = commissionAmount + gstAmount;
    const settlementAmount = totalTransactionsAmount - totalDeduction;

    // Build history records
    const history = bookings.map(booking => {
      const amount = Number(booking.totalAmount) || 0;
      const commission = (amount * commissionPercent) / 100;
      const gst = (commission * gstPercent) / 100;
      const deduction = commission + gst;
      const settlement = amount - deduction;

      const bo = booking.businessOwner;
      const primaryAddress = bo?.addresses?.find(a => a.isPrimary) || bo?.addresses?.[0];

      return {
        bookingId: booking.id,
        date: booking.serviceCompletedAt?.toISOString().split('T')[0] || 'N/A',
        completedAt: booking.serviceCompletedAt,
        businessOwnerId: bo?.id || 'N/A',
        ownerName: bo ? [bo.firstName, bo.lastName].filter(Boolean).join(' ') || 'N/A' : 'N/A',
        salonName: bo?.businessName || 'N/A',
        email: bo?.user?.email || 'N/A',
        mobileNumber: bo?.user?.phone || 'N/A',
        address: primaryAddress
          ? [primaryAddress.streetAddress, primaryAddress.city, primaryAddress.state].filter(Boolean).join(', ')
          : 'N/A',
        customerName: booking.customer 
          ? [booking.customer.firstName, booking.customer.lastName].filter(Boolean).join(' ') || 'N/A'
          : 'N/A',
        amount: Math.round(amount * 100) / 100,
        paymentMethod: booking.paymentMethod || 'N/A',
        commissionAmount: Math.round(commission * 100) / 100,
        gstAmount: Math.round(gst * 100) / 100,
        totalDeduction: Math.round(deduction * 100) / 100,
        settlementAmount: Math.round(settlement * 100) / 100,
      };
    });

    return {
      history,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      summary: {
        totalTransactionsAmount: Math.round(totalTransactionsAmount * 100) / 100,
        totalCommissionAmount: Math.round(commissionAmount * 100) / 100,
        totalGstAmount: Math.round(gstAmount * 100) / 100,
        totalDeduction: Math.round(totalDeduction * 100) / 100,
        totalSettlementAmount: Math.round(settlementAmount * 100) / 100,
        totalBookings: parseInt(summaryResult.count) || 0,
      },
    };
  }

  /**
   * Get detailed settlement info for a business owner on a specific date or date range
   * Includes owner details, business info, transaction history, and calculation
   */
  async getSettlementDetails(params: {
    businessOwnerId: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const { businessOwnerId, date, startDate, endDate } = params;
    
    // Validate UUID format to prevent DB crash
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!businessOwnerId || !uuidRegex.test(businessOwnerId)) {
      throw new BadRequestException(`Invalid businessOwnerId format: ${businessOwnerId}`);
    }

    this.logger.log(`Fetching settlement details for ${businessOwnerId}, date: ${date}, range: ${startDate} - ${endDate}`);

    try {

    // Get business owner with all details
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['user', 'addresses'],
    });

    if (!businessOwner) {
      throw new NotFoundException(`Business owner not found with ID: ${businessOwnerId}`);
    }

    // Parse date filters
    let startRange: Date;
    let endRange: Date;

    const isValidDate = (d: any) => d && d !== 'null' && !isNaN(new Date(d).getTime());

    if (isValidDate(date)) {
      // Robust date boundaries for a single date
      startRange = new Date(`${date}T00:00:00`);
      endRange = new Date(`${date}T23:59:59.999`);
    } else {
      // Range boundaries
      const sDate = isValidDate(startDate) ? startDate : '2000-01-01';
      const eDate = isValidDate(endDate) ? endDate : new Date().toISOString().split('T')[0];
      
      startRange = new Date(`${sDate}T00:00:00`);
      endRange = new Date(`${eDate}T23:59:59.999`);
    }

    // Get completed bookings with customer details for this period
    let completedBookings = await this.bookingRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('b.bookingServices', 'bookingServices')
      .leftJoinAndSelect('bookingServices.service', 'service')
      .where('b.businessOwnerId = :businessOwnerId', { businessOwnerId })
      .andWhere('b.status = :status', { status: BookingStatus.COMPLETED })
      .andWhere('b.serviceCompletedAt BETWEEN :startRange AND :endRange', { startRange, endRange })
      .orderBy('b.serviceCompletedAt', 'DESC')
      .getMany();

    // Fallback: If no bookings found by serviceCompletedAt, try appointmentDate
    if (completedBookings.length === 0) {
      this.logger.log(`No bookings found via serviceCompletedAt, trying appointmentDate fallback...`);
      completedBookings = await this.bookingRepository
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.customer', 'customer')
        .leftJoinAndSelect('customer.user', 'customerUser')
        .leftJoinAndSelect('b.bookingServices', 'bookingServices')
        .leftJoinAndSelect('bookingServices.service', 'service')
        .where('b.businessOwnerId = :businessOwnerId', { businessOwnerId })
        .andWhere('b.status = :status', { status: BookingStatus.COMPLETED })
        .andWhere('b.appointmentDate BETWEEN :startDate AND :endDate', { 
            startDate: startRange.toISOString().split('T')[0], 
            endDate: endRange.toISOString().split('T')[0] 
        })
        .orderBy('b.appointmentDate', 'DESC')
        .getMany();
    }

    this.logger.log(`Found ${completedBookings.length} completed bookings for the period`);

    // Build transaction history
    const transactions = completedBookings.map(booking => ({
      bookingId: booking.id,
      customerName: booking.customer 
        ? [booking.customer.firstName, booking.customer.lastName].filter(Boolean).join(' ') || 'N/A'
        : 'N/A',
      customerPhone: booking.customer?.user?.phone || 'N/A',
      services: booking.bookingServices?.map(bs => ({
        name: bs.service?.name || 'N/A',
        price: Number(bs.price) || 0,
      })) || [],
      amount: Number(booking.totalAmount) || 0,
      paymentMethod: booking.paymentMethod || 'N/A',
      completedAt: booking.serviceCompletedAt,
    }));

    // Calculate totals
    const totalTransactionsCount = completedBookings.length;
    let totalTransactionsAmount = 0;
    let totalCashAmount = 0;
    let totalOnlineAmount = 0;
    
    completedBookings.forEach(booking => {
      const amount = Number(booking.totalAmount) || 0;
      totalTransactionsAmount += amount;
      if (booking.paymentMethod === PaymentMethodType.COD) {
        totalCashAmount += amount;
      } else if (booking.paymentMethod === PaymentMethodType.ONLINE) {
        totalOnlineAmount += amount;
      }
    });

    this.logger.log(`Calculated totals: Count=${totalTransactionsCount}, Amount=${totalTransactionsAmount}`);

    // Get active commission config
    const configDate = endRange || new Date();
    const { commissionPercent, gstPercent } = await this.getCommissionConfig(configDate);

    // Commission calculation: based on config
    const commissionAmount = (totalTransactionsAmount * commissionPercent) / 100;
    const gstAmount = (commissionAmount * gstPercent) / 100;
    const totalDeduction = commissionAmount + gstAmount;
    const settlementAmount = totalOnlineAmount - totalDeduction;

    // Get vendor details
    const ownerName = [businessOwner.firstName, businessOwner.lastName].filter(Boolean).join(' ') || 'N/A';
    const salonName = businessOwner.businessName || 'N/A';
    const email = businessOwner.user?.email || '';
    const mobileNumber = businessOwner.user?.phone || '';
    
    // Get primary address
    const primaryAddress = businessOwner.addresses?.find(a => a.isPrimary) || businessOwner.addresses?.[0];
    const address = primaryAddress
      ? [primaryAddress.streetAddress, primaryAddress.city, primaryAddress.state, primaryAddress.postalCode]
          .filter(Boolean)
          .join(', ')
      : 'N/A';

    const displayDate = date || (startDate && endDate ? `${startDate} to ${endDate}` : 'All Time');

    return {
      date: displayDate,
      ownerDetails: {
        businessOwnerId,
        ownerName,
        email,
        mobileNumber,
      },
      businessDetails: {
        salonName,
        address,
        shopId: businessOwner.shopId || 'N/A',
      },
      transactions,
      settlement: {
        totalTransactionsCount,
        totalTransactionsAmount: Math.round(totalTransactionsAmount * 100) / 100,
        totalCashAmount: Math.round(totalCashAmount * 100) / 100,
        totalOnlineAmount: Math.round(totalOnlineAmount * 100) / 100,
        commissionPercent: commissionPercent,
        commissionAmount: Math.round(commissionAmount * 100) / 100,
        gstPercent: gstPercent,
        gstAmount: Math.round(gstAmount * 100) / 100,
        totalDeduction: Math.round(totalDeduction * 100) / 100,
        settlementAmount: Math.round(settlementAmount * 100) / 100,
      },
    };
    } catch (error) {
      this.logger.error(`Error in getSettlementDetails: ${error.message}`, error.stack);
      throw error instanceof NotFoundException || error instanceof BadRequestException 
        ? error 
        : new BadRequestException('Failed to fetch settlement details. Please check the parameters.');
    }
  }

  /**
   * Update settlement paid status
   */
  async updateSettlementStatus(
    settlementId: string,
    status: SettlementPaidStatus,
    transactionReference?: string,
    adminNotes?: string,
  ): Promise<DailySettlement> {
    const settlement = await this.dailySettlementRepository.findOne({
      where: { id: settlementId },
    });

    if (!settlement) {
      throw new NotFoundException(`Settlement not found with ID: ${settlementId}`);
    }

    settlement.paidStatus = status;
    
    if (status === SettlementPaidStatus.PAID) {
      settlement.paidAt = new Date();
    }

    if (transactionReference) {
      settlement.transactionReference = transactionReference;
    }

    if (adminNotes) {
      settlement.adminNotes = adminNotes;
    }

    const updated = await this.dailySettlementRepository.save(settlement);

    this.logger.log(`Settlement ${settlementId} status updated to ${status}`);

    return updated;
  }

  /**
   * Update settlement status by business owner ID and date
   * Creates settlement record if it doesn't exist
   */
  async updateSettlementStatusByBusinessOwner(
    businessOwnerId: string,
    date: string,
    status: SettlementPaidStatus,
    transactionReference?: string,
    adminNotes?: string,
  ): Promise<{ message: string; settlement: any }> {
    // Check if business owner exists
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['user', 'addresses'],
    });

    if (!businessOwner) {
      throw new NotFoundException(`Business owner not found with ID: ${businessOwnerId}`);
    }

    const isValidDate = (d: any) => d && d !== 'null' && !isNaN(new Date(d).getTime());
    if (!isValidDate(date)) {
      throw new BadRequestException(`Invalid date format for settlement: ${date}`);
    }
    const settlementDate = new Date(date);

    // Check if settlement record exists
    let settlement = await this.dailySettlementRepository.findOne({
      where: {
        businessOwnerId,
        settlementDate,
      },
    });

    if (!settlement) {
      // Calculate current stats for this business and date to store in the record
      const startOfDay = new Date(settlementDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(settlementDate);
      endOfDay.setHours(23, 59, 59, 999);

      const stats = await this.bookingRepository
        .createQueryBuilder('b')
        .where('b.businessOwnerId = :businessOwnerId', { businessOwnerId })
        .andWhere('b.status = :status', { status: BookingStatus.COMPLETED })
        .andWhere('b.serviceCompletedAt BETWEEN :startOfRange AND :endOfRange', { 
          startOfRange: startOfDay, 
          endOfRange: endOfDay 
        })
        .select('COUNT(*)', 'count')
        .addSelect('COALESCE(SUM(b.totalAmount), 0)', 'total')
        .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${PaymentMethodType.COD}' THEN b.totalAmount ELSE 0 END), 0)`, 'cash')
        .addSelect(`COALESCE(SUM(CASE WHEN b.paymentMethod = '${PaymentMethodType.ONLINE}' THEN b.totalAmount ELSE 0 END), 0)`, 'online')
        .getRawOne();

      const totalCount = parseInt(stats.count) || 0;
      const totalAmount = parseFloat(stats.total) || 0;
      const totalCashAmount = parseFloat(stats.cash) || 0;
      const totalOnlineAmount = parseFloat(stats.online) || 0;
      
      // Get active commission config
      const { commissionPercent, gstPercent } = await this.getCommissionConfig(settlementDate);
      
      const commissionAmount = (totalAmount * commissionPercent) / 100;
      const gstAmount = (commissionAmount * gstPercent) / 100;
      const totalDeduction = commissionAmount + gstAmount;
      const settlementAmount = totalOnlineAmount - totalDeduction;

      // Create new settlement record with calculated data
      const ownerName = [businessOwner.firstName, businessOwner.lastName].filter(Boolean).join(' ') || 'N/A';
      const salonName = businessOwner.businessName || 'N/A';
      const email = businessOwner.user?.email || '';
      const mobileNumber = businessOwner.user?.phone || '';
      
      const primaryAddress = businessOwner.addresses?.find(a => a.isPrimary) || businessOwner.addresses?.[0];
      const address = primaryAddress
        ? [primaryAddress.streetAddress, primaryAddress.city, primaryAddress.state, primaryAddress.postalCode]
            .filter(Boolean)
            .join(', ')
        : 'N/A';

      settlement = this.dailySettlementRepository.create({
        businessOwnerId,
        settlementDate,
        ownerName,
        salonName,
        email,
        mobileNumber,
        address,
        totalTransactionsCount: totalCount,
        totalTransactionsAmount: totalAmount,
        totalCashAmount,
        totalOnlineAmount,
        commissionPercent: commissionPercent,
        commissionAmount,
        gstPercent: gstPercent,
        gstAmount,
        totalDeduction,
        settlementAmount,
        paidStatus: status,
      });
    } else {
      settlement.paidStatus = status;
    }

    if (status === SettlementPaidStatus.PAID) {
      settlement.paidAt = new Date();
    }

    if (transactionReference) {
      settlement.transactionReference = transactionReference;
    }

    if (adminNotes) {
      settlement.adminNotes = adminNotes;
    }

    await this.dailySettlementRepository.save(settlement);

    this.logger.log(`Settlement for ${businessOwnerId} on ${date} updated to ${status}`);

    return {
      message: `Settlement status updated to ${status}`,
      settlement: {
        businessOwnerId,
        date,
        paidStatus: status,
        transactionReference: settlement.transactionReference,
        adminNotes: settlement.adminNotes,
        paidAt: settlement.paidAt,
      },
    };
  }

  /**
   * Generate daily settlements for all approved business owners for a specific date
   * This calculates from completed bookings
   */
  async generateDailySettlements(date: string): Promise<{ generated: number; updated: number }> {
    const targetDate = new Date(date);
    
    // Get all approved business owners
    const approvedBusinessOwners = await this.businessOwnerRepository.find({
      where: { isApproved: true },
      relations: ['user', 'addresses'],
    });

    let generated = 0;
    let updated = 0;

    for (const businessOwner of approvedBusinessOwners) {
      try {
        const result = await this.generateSettlementForBusinessOwner(businessOwner, targetDate);
        if (result === 'created') generated++;
        else if (result === 'updated') updated++;
      } catch (error) {
        this.logger.error(
          `Failed to generate settlement for business owner ${businessOwner.id}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Daily settlements for ${date}: Generated ${generated}, Updated ${updated}`);

    return { generated, updated };
  }

  /**
   * Generate settlement for a single business owner for a date
   */
  private async generateSettlementForBusinessOwner(
    businessOwner: BusinessOwner & { user: User; addresses: BusinessAddress[] },
    date: Date,
  ): Promise<'created' | 'updated' | 'skipped'> {
    // Get completed bookings for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const completedBookings = await this.bookingRepository.find({
      where: {
        businessOwnerId: businessOwner.id,
        status: BookingStatus.COMPLETED,
        serviceCompletedAt: Between(startOfDay, endOfDay),
      },
    });

    // Skip if no bookings
    if (completedBookings.length === 0) {
      return 'skipped';
    }

    // Calculate totals
    const totalTransactionsCount = completedBookings.length;
    const totalTransactionsAmount = completedBookings.reduce(
      (sum, booking) => sum + Number(booking.totalAmount),
      0,
    );
    const totalCashAmount = completedBookings.reduce(
      (sum, booking) => sum + (booking.paymentMethod === PaymentMethodType.COD ? Number(booking.totalAmount) : 0),
      0,
    );
    const totalOnlineAmount = completedBookings.reduce(
      (sum, booking) => sum + (booking.paymentMethod === PaymentMethodType.ONLINE ? Number(booking.totalAmount) : 0),
      0,
    );

    // Get active commission config
    const { commissionPercent, gstPercent } = await this.getCommissionConfig(date);

    // Commission calculation: based on config
    const commissionAmount = (totalTransactionsAmount * commissionPercent) / 100;
    const gstAmount = (commissionAmount * gstPercent) / 100;
    const totalDeduction = commissionAmount + gstAmount;
    const settlementAmount = totalOnlineAmount - totalDeduction;

    // Get vendor details
    const ownerName = [businessOwner.firstName, businessOwner.lastName].filter(Boolean).join(' ') || 'N/A';
    const salonName = businessOwner.businessName || 'N/A';
    const email = businessOwner.user?.email || '';
    const mobileNumber = businessOwner.user?.phone || '';
    
    // Get primary address
    const primaryAddress = businessOwner.addresses?.find(a => a.isPrimary) || businessOwner.addresses?.[0];
    const address = primaryAddress
      ? [primaryAddress.streetAddress, primaryAddress.city, primaryAddress.state, primaryAddress.postalCode]
          .filter(Boolean)
          .join(', ')
      : 'N/A';

    // Check if settlement already exists
    const dateString = date.toISOString().split('T')[0];
    let existing = await this.dailySettlementRepository.findOne({
      where: {
        businessOwnerId: businessOwner.id,
        settlementDate: new Date(dateString),
      },
    });

    if (existing) {
      // Update existing
      existing.ownerName = ownerName;
      existing.salonName = salonName;
      existing.email = email;
      existing.mobileNumber = mobileNumber;
      existing.address = address;
      existing.totalTransactionsCount = totalTransactionsCount;
      existing.totalTransactionsAmount = totalTransactionsAmount;
      existing.totalCashAmount = totalCashAmount;
      existing.totalOnlineAmount = totalOnlineAmount;
      existing.commissionPercent = commissionPercent;
      existing.commissionAmount = commissionAmount;
      existing.gstPercent = gstPercent;
      existing.gstAmount = gstAmount;
      existing.totalDeduction = totalDeduction;
      existing.settlementAmount = settlementAmount;

      await this.dailySettlementRepository.save(existing);
      return 'updated';
    } else {
      // Create new
      const newSettlement = this.dailySettlementRepository.create({
        businessOwnerId: businessOwner.id,
        settlementDate: new Date(dateString),
        ownerName,
        salonName,
        email,
        mobileNumber,
        address,
        totalTransactionsCount,
        totalTransactionsAmount,
        commissionPercent: commissionPercent,
        commissionAmount,
        gstPercent: gstPercent,
        gstAmount,
        totalDeduction,
        settlementAmount,
        paidStatus: SettlementPaidStatus.PENDING,
      });

      await this.dailySettlementRepository.save(newSettlement);
      return 'created';
    }
  }

  /**
   * Get settlement by ID
   */
  async getSettlementById(id: string): Promise<DailySettlement> {
    const settlement = await this.dailySettlementRepository.findOne({
      where: { id },
      relations: ['businessOwner'],
    });

    if (!settlement) {
      throw new NotFoundException(`Settlement not found with ID: ${id}`);
    }

    return settlement;
  }
}

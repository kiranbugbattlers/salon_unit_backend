import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import {
  Staff,
  BusinessOwner,
  StaffService as StaffServiceEntity,
  BookingRequest,
  Booking,
} from '../database/entities';
import { S3Service, UploadResult } from '../common/services/s3.service';
import { StaffScheduleManagementService } from './services/staff-schedule-management.service';
import { BreakType } from '../common/enums';
import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffQueryDto,
  StaffResponseDto,
  StaffListResponseDto,
  StaffData,
  StaffListData,
  ProfilePictureResponseDto,
  ProfilePictureData,
  MessageResponseDto,
  MessageData,
} from './dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(StaffServiceEntity)
    private staffServiceRepository: Repository<StaffServiceEntity>,
    @InjectRepository(BookingRequest)
    private bookingRequestRepository: Repository<BookingRequest>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private readonly s3Service: S3Service,
    private readonly staffScheduleService: StaffScheduleManagementService,
  ) {}

  async create(userId: string, createStaffDto: CreateStaffDto, file?: any): Promise<StaffResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const existingStaff = await this.staffRepository.findOne({
      where: { phone: createStaffDto.phone },
    });

    if (existingStaff) {
      throw new ConflictException('Staff member with this phone number already exists');
    }

    if (createStaffDto.email) {
      const existingEmail = await this.staffRepository.findOne({
        where: { email: createStaffDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Staff member with this email already exists');
      }
    }

    const staff = this.staffRepository.create({
      ...createStaffDto,
      businessOwnerId: businessOwner.id,
      dateOfBirth: new Date(createStaffDto.dateOfBirth),
    });

    const savedStaff = await this.staffRepository.save(staff);

    // Create lunch breaks
    await this.createLunchBreaks(userId, savedStaff.id, createStaffDto.lunchStartTime, createStaffDto.lunchEndTime);

    // Upload profile picture if provided
    if (file) {
      try {
        const result: UploadResult = await this.s3Service.uploadFile(file, {
          folder: 'staff-profiles',
        });

        // Update staff with profile picture URLs
        await this.staffRepository.update(savedStaff.id, {
          profilePic: result.url,
          profilePicCdnUrl: result.cdnUrl,
          profilePicS3Key: result.key,
        });

        // Fetch updated staff to return with profile picture URLs
        const updatedStaff = await this.staffRepository.findOne({
          where: { id: savedStaff.id },
        });

        const staffData = await this.mapToStaffData(updatedStaff, userId);
        return new StaffResponseDto(201, true, 'Staff member created successfully', staffData);
      } catch (error) {
        // If profile picture upload fails, still return the created staff without profile picture
        console.error('Failed to upload staff profile picture during creation:', error);
      }
    }

    const staffData = await this.mapToStaffData(savedStaff, userId);
    return new StaffResponseDto(201, true, 'Staff member created successfully', staffData);
  }

  async findAll(userId: string, query: StaffQueryDto): Promise<StaffListResponseDto> {
    const { page = 1, limit = 10, search, isActive, gender } = query;
    const skip = (page - 1) * limit;

    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const whereConditions: FindOptionsWhere<Staff> = {
      businessOwnerId: businessOwner.id,
    };

    if (isActive !== undefined) {
      whereConditions.isActive = isActive;
    }

    if (gender) {
      whereConditions.gender = gender;
    }

    let queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .where(whereConditions);

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(staff.firstName ILIKE :search OR staff.lastName ILIKE :search OR staff.phone ILIKE :search OR staff.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [staff, total] = await queryBuilder
      .orderBy('staff.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const staffDataList = await Promise.all(staff.map(s => this.mapToStaffData(s, userId)));
    const listData: StaffListData = {
      data: staffDataList,
      total,
      page,
      limit,
    };

    return new StaffListResponseDto(200, true, 'Staff members retrieved successfully', listData);
  }

  async findOne(userId: string, id: string): Promise<StaffResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    const staffData = await this.mapToStaffData(staff, userId);
    return new StaffResponseDto(200, true, 'Staff member retrieved successfully', staffData);
  }

  async update(userId: string, id: string, updateStaffDto: UpdateStaffDto): Promise<StaffResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    if (updateStaffDto.phone && updateStaffDto.phone !== staff.phone) {
      const existingPhone = await this.staffRepository.findOne({
        where: { phone: updateStaffDto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('Staff member with this phone number already exists');
      }
    }

    if (updateStaffDto.email && updateStaffDto.email !== staff.email) {
      const existingEmail = await this.staffRepository.findOne({
        where: { email: updateStaffDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Staff member with this email already exists');
      }
    }

    // Extract lunch break fields before updating staff entity
    const { lunchStartTime, lunchEndTime, ...staffUpdateData } = updateStaffDto;

    // Prepare staff data for update (excluding lunch break fields)
    const updatedData: any = { ...staffUpdateData };
    if (updateStaffDto.dateOfBirth) {
      updatedData.dateOfBirth = new Date(updateStaffDto.dateOfBirth);
    }

    // Update staff entity (without lunch break fields)
    await this.staffRepository.update(id, updatedData);

    // Update lunch breaks if provided
    if (lunchStartTime && lunchEndTime) {
      await this.updateLunchBreaks(userId, id, lunchStartTime, lunchEndTime);
    }

    const updatedStaff = await this.staffRepository.findOne({
      where: { id, businessOwnerId: businessOwner.id },
    });

    const staffData = await this.mapToStaffData(updatedStaff, userId);
    return new StaffResponseDto(200, true, 'Staff member updated successfully', staffData);
  }

  async remove(userId: string, id: string): Promise<void> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Delete profile picture from S3 if exists
    if (staff.profilePicS3Key) {
      try {
        await this.s3Service.deleteFile(staff.profilePicS3Key);
      } catch (error) {
        console.error('Failed to delete staff profile picture during permanent deletion:', error);
      }
    }

    // Check for active bookings that would prevent deletion
    const activeBookings = await this.bookingRepository.count({
      where: { staffId: id }
    });

    if (activeBookings > 0) {
      throw new BadRequestException(
        `Cannot delete staff member. They have ${activeBookings} existing booking(s). Please cancel or complete all bookings first, or use the deactivate option instead.`
      );
    }

    // Check for active booking requests
    const activeBookingRequests = await this.bookingRequestRepository.count({
      where: [
        { requestedStaffId: id },
        { assignedStaffId: id }
      ]
    });

    // Delete all related records first to avoid foreign key constraint violations
    try {
      await this.staffScheduleService.deleteAllStaffBreaks(userId, id);
      await this.staffScheduleService.deleteAllScheduleOverrides(userId, id);
      await this.staffServiceRepository.delete({ staffId: id });

      // Nullify staff references in booking requests (only if there are any)
      if (activeBookingRequests > 0) {
        await this.bookingRequestRepository.update(
          { requestedStaffId: id },
          { requestedStaffId: null }
        );
        await this.bookingRequestRepository.update(
          { assignedStaffId: id },
          { assignedStaffId: null }
        );
      }
    } catch (error) {
      console.error('Failed to delete related staff records during staff deletion:', error);
      throw new BadRequestException('Cannot delete staff member due to existing references. Please try again.');
    }

    // Permanently delete the staff record
    await this.staffRepository.delete(id);
  }

  async deactivate(userId: string, id: string): Promise<MessageResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    if (!staff.isActive) {
      throw new BadRequestException('Staff member is already deactivated');
    }

    await this.staffRepository.update(id, { isActive: false });

    const messageData: MessageData = {
      message: 'Staff member deactivated successfully',
    };

    return new MessageResponseDto(200, true, 'Staff member deactivated successfully', messageData);
  }

  async activate(userId: string, id: string): Promise<MessageResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    if (staff.isActive) {
      throw new BadRequestException('Staff member is already active');
    }

    await this.staffRepository.update(id, { isActive: true });

    const messageData: MessageData = {
      message: 'Staff member activated successfully',
    };

    return new MessageResponseDto(200, true, 'Staff member activated successfully', messageData);
  }



  private async mapToStaffData(staff: Staff, userId?: string): Promise<StaffData> {
    let lunchStartTime: string | null = null;
    let lunchEndTime: string | null = null;

    // Get lunch break information if userId is provided
    if (userId) {
      try {
        const lunchBreaks = await this.staffScheduleService.getStaffBreaks(userId, staff.id);
        const lunchBreak = lunchBreaks.data.find(
          (breakItem) => breakItem.breakType === BreakType.LUNCH && breakItem.isActive
        );
        if (lunchBreak) {
          lunchStartTime = lunchBreak.startTime;
          lunchEndTime = lunchBreak.endTime;
        }
      } catch (error) {
        console.error('Failed to fetch lunch breaks for staff response:', error);
      }
    }

    return {
      id: staff.id,
      businessOwnerId: staff.businessOwnerId,
      firstName: staff.firstName,
      lastName: staff.lastName,
      phone: staff.phone,
      email: staff.email,
      dateOfBirth: staff.dateOfBirth,
      gender: staff.gender,
      profilePic: staff.profilePic,
      profilePicCdnUrl: staff.profilePicCdnUrl,
      isActive: staff.isActive,
      lunchStartTime,
      lunchEndTime,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };
  }

  /**
   * Upload profile picture for staff member
   */
  async uploadProfilePicture(userId: string, staffId: string, file: any): Promise<ProfilePictureResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Delete old profile picture if it exists
    if (staff.profilePicS3Key) {
      try {
        await this.s3Service.deleteFile(staff.profilePicS3Key);
      } catch (error) {
        console.error('Failed to delete old staff profile picture:', error);
      }
    }

    // Upload new profile picture
    const result: UploadResult = await this.s3Service.uploadFile(file, {
      folder: 'staff-profiles',
    });

    // Update staff with new profile picture URLs
    await this.staffRepository.update(staffId, {
      profilePic: result.url,
      profilePicCdnUrl: result.cdnUrl,
      profilePicS3Key: result.key,
    });

    const profilePictureData: ProfilePictureData = {
      profilePic: result.url,
      profilePicCdnUrl: result.cdnUrl,
      profilePicS3Key: result.key,
    };

    return new ProfilePictureResponseDto(201, true, 'Profile picture uploaded successfully', profilePictureData);
  }

  /**
   * Delete profile picture for staff member
   */
  async deleteProfilePicture(userId: string, staffId: string): Promise<MessageResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const staff = await this.staffRepository.findOne({
      where: { id: staffId, businessOwnerId: businessOwner.id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    if (!staff.profilePicS3Key) {
      throw new BadRequestException('No profile picture to delete');
    }

    // Delete file from S3
    await this.s3Service.deleteFile(staff.profilePicS3Key);

    // Remove profile picture URLs from staff record
    await this.staffRepository.update(staffId, {
      profilePic: null,
      profilePicCdnUrl: null,
      profilePicS3Key: null,
    });

    const messageData: MessageData = {
      message: 'Profile picture deleted successfully',
    };

    return new MessageResponseDto(200, true, 'Profile picture deleted successfully', messageData);
  }

  /**
   * Create lunch breaks for staff member (Monday to Friday)
   */
  private async createLunchBreaks(userId: string, staffId: string, startTime: string, endTime: string): Promise<void> {
    try {
      // Create lunch breaks for Monday (1) to Friday (5)
      const weekDays = [1, 2, 3, 4, 5];

      for (const dayOfWeek of weekDays) {
        await this.staffScheduleService.createStaffBreak(userId, staffId, {
          dayOfWeek,
          startTime,
          endTime,
          breakType: BreakType.LUNCH,
          isRecurring: true,
        });
      }
    } catch (error) {
      console.error('Failed to create lunch breaks during staff creation:', error);
      // Don't throw error to avoid failing staff creation if lunch break creation fails
    }
  }

  private async updateLunchBreaks(userId: string, staffId: string, startTime: string, endTime: string): Promise<void> {
    try {
      // Get all existing breaks for this staff member
      const staffBreaksResponse = await this.staffScheduleService.getStaffBreaks(userId, staffId);
      const existingBreaks = staffBreaksResponse.data;

      // Filter for lunch breaks on weekdays (Monday=1 to Friday=5)
      const existingLunchBreaks = existingBreaks.filter(
        (breakItem) =>
          breakItem.breakType === BreakType.LUNCH &&
          breakItem.dayOfWeek >= 1 &&
          breakItem.dayOfWeek <= 5 &&
          breakItem.isActive
      );

      // Update existing lunch breaks with new times
      for (const lunchBreak of existingLunchBreaks) {
        await this.staffScheduleService.updateStaffBreak(userId, staffId, lunchBreak.id, {
          startTime,
          endTime,
          isActive: true,
        });
      }

      // If no existing lunch breaks found, create new ones
      if (existingLunchBreaks.length === 0) {
        await this.createLunchBreaks(userId, staffId, startTime, endTime);
      }
    } catch (error) {
      console.error('Failed to update lunch breaks during staff update:', error);
      // Don't throw error to avoid failing staff update if lunch break update fails
    }
  }
}
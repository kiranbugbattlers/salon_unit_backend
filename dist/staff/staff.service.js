"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const s3_service_1 = require("../common/services/s3.service");
const staff_schedule_management_service_1 = require("./services/staff-schedule-management.service");
const enums_1 = require("../common/enums");
const dto_1 = require("./dto");
let StaffService = class StaffService {
    constructor(staffRepository, businessOwnerRepository, staffServiceRepository, bookingRequestRepository, bookingRepository, s3Service, staffScheduleService) {
        this.staffRepository = staffRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.staffServiceRepository = staffServiceRepository;
        this.bookingRequestRepository = bookingRequestRepository;
        this.bookingRepository = bookingRepository;
        this.s3Service = s3Service;
        this.staffScheduleService = staffScheduleService;
    }
    async create(userId, createStaffDto, file) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const existingStaff = await this.staffRepository.findOne({
            where: { phone: createStaffDto.phone },
        });
        if (existingStaff) {
            throw new common_1.ConflictException('Staff member with this phone number already exists');
        }
        if (createStaffDto.email) {
            const existingEmail = await this.staffRepository.findOne({
                where: { email: createStaffDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Staff member with this email already exists');
            }
        }
        const staff = this.staffRepository.create({
            ...createStaffDto,
            businessOwnerId: businessOwner.id,
            dateOfBirth: new Date(createStaffDto.dateOfBirth),
        });
        const savedStaff = await this.staffRepository.save(staff);
        await this.createLunchBreaks(userId, savedStaff.id, createStaffDto.lunchStartTime, createStaffDto.lunchEndTime);
        if (file) {
            try {
                const result = await this.s3Service.uploadFile(file, {
                    folder: 'staff-profiles',
                });
                await this.staffRepository.update(savedStaff.id, {
                    profilePic: result.url,
                    profilePicCdnUrl: result.cdnUrl,
                    profilePicS3Key: result.key,
                });
                const updatedStaff = await this.staffRepository.findOne({
                    where: { id: savedStaff.id },
                });
                const staffData = await this.mapToStaffData(updatedStaff, userId);
                return new dto_1.StaffResponseDto(201, true, 'Staff member created successfully', staffData);
            }
            catch (error) {
                console.error('Failed to upload staff profile picture during creation:', error);
            }
        }
        const staffData = await this.mapToStaffData(savedStaff, userId);
        return new dto_1.StaffResponseDto(201, true, 'Staff member created successfully', staffData);
    }
    async findAll(userId, query) {
        const { page = 1, limit = 10, search, isActive, gender } = query;
        const skip = (page - 1) * limit;
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const whereConditions = {
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
            queryBuilder = queryBuilder.andWhere('(staff.firstName ILIKE :search OR staff.lastName ILIKE :search OR staff.phone ILIKE :search OR staff.email ILIKE :search)', { search: `%${search}%` });
        }
        const [staff, total] = await queryBuilder
            .orderBy('staff.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        const staffDataList = await Promise.all(staff.map(s => this.mapToStaffData(s, userId)));
        const listData = {
            data: staffDataList,
            total,
            page,
            limit,
        };
        return new dto_1.StaffListResponseDto(200, true, 'Staff members retrieved successfully', listData);
    }
    async findOne(userId, id) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id, businessOwnerId: businessOwner.id },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
        }
        const staffData = await this.mapToStaffData(staff, userId);
        return new dto_1.StaffResponseDto(200, true, 'Staff member retrieved successfully', staffData);
    }
    async update(userId, id, updateStaffDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id, businessOwnerId: businessOwner.id },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
        }
        if (updateStaffDto.phone && updateStaffDto.phone !== staff.phone) {
            const existingPhone = await this.staffRepository.findOne({
                where: { phone: updateStaffDto.phone },
            });
            if (existingPhone) {
                throw new common_1.ConflictException('Staff member with this phone number already exists');
            }
        }
        if (updateStaffDto.email && updateStaffDto.email !== staff.email) {
            const existingEmail = await this.staffRepository.findOne({
                where: { email: updateStaffDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Staff member with this email already exists');
            }
        }
        const { lunchStartTime, lunchEndTime, ...staffUpdateData } = updateStaffDto;
        const updatedData = { ...staffUpdateData };
        if (updateStaffDto.dateOfBirth) {
            updatedData.dateOfBirth = new Date(updateStaffDto.dateOfBirth);
        }
        await this.staffRepository.update(id, updatedData);
        if (lunchStartTime && lunchEndTime) {
            await this.updateLunchBreaks(userId, id, lunchStartTime, lunchEndTime);
        }
        const updatedStaff = await this.staffRepository.findOne({
            where: { id, businessOwnerId: businessOwner.id },
        });
        const staffData = await this.mapToStaffData(updatedStaff, userId);
        return new dto_1.StaffResponseDto(200, true, 'Staff member updated successfully', staffData);
    }
    async remove(userId, id) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id, businessOwnerId: businessOwner.id },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
        }
        if (staff.profilePicS3Key) {
            try {
                await this.s3Service.deleteFile(staff.profilePicS3Key);
            }
            catch (error) {
                console.error('Failed to delete staff profile picture during permanent deletion:', error);
            }
        }
        const activeBookings = await this.bookingRepository.count({
            where: { staffId: id }
        });
        if (activeBookings > 0) {
            throw new common_1.BadRequestException(`Cannot delete staff member. They have ${activeBookings} existing booking(s). Please cancel or complete all bookings first, or use the deactivate option instead.`);
        }
        const activeBookingRequests = await this.bookingRequestRepository.count({
            where: [
                { requestedStaffId: id },
                { assignedStaffId: id }
            ]
        });
        try {
            await this.staffScheduleService.deleteAllStaffBreaks(userId, id);
            await this.staffScheduleService.deleteAllScheduleOverrides(userId, id);
            await this.staffServiceRepository.delete({ staffId: id });
            if (activeBookingRequests > 0) {
                await this.bookingRequestRepository.update({ requestedStaffId: id }, { requestedStaffId: null });
                await this.bookingRequestRepository.update({ assignedStaffId: id }, { assignedStaffId: null });
            }
        }
        catch (error) {
            console.error('Failed to delete related staff records during staff deletion:', error);
            throw new common_1.BadRequestException('Cannot delete staff member due to existing references. Please try again.');
        }
        await this.staffRepository.delete(id);
    }
    async deactivate(userId, id) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id, businessOwnerId: businessOwner.id },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
        }
        if (!staff.isActive) {
            throw new common_1.BadRequestException('Staff member is already deactivated');
        }
        await this.staffRepository.update(id, { isActive: false });
        const messageData = {
            message: 'Staff member deactivated successfully',
        };
        return new dto_1.MessageResponseDto(200, true, 'Staff member deactivated successfully', messageData);
    }
    async activate(userId, id) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id, businessOwnerId: businessOwner.id },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
        }
        if (staff.isActive) {
            throw new common_1.BadRequestException('Staff member is already active');
        }
        await this.staffRepository.update(id, { isActive: true });
        const messageData = {
            message: 'Staff member activated successfully',
        };
        return new dto_1.MessageResponseDto(200, true, 'Staff member activated successfully', messageData);
    }
    async mapToStaffData(staff, userId) {
        let lunchStartTime = null;
        let lunchEndTime = null;
        if (userId) {
            try {
                const lunchBreaks = await this.staffScheduleService.getStaffBreaks(userId, staff.id);
                const lunchBreak = lunchBreaks.data.find((breakItem) => breakItem.breakType === enums_1.BreakType.LUNCH && breakItem.isActive);
                if (lunchBreak) {
                    lunchStartTime = lunchBreak.startTime;
                    lunchEndTime = lunchBreak.endTime;
                }
            }
            catch (error) {
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
    async uploadProfilePicture(userId, staffId, file) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id: staffId, businessOwnerId: businessOwner.id },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
        }
        if (staff.profilePicS3Key) {
            try {
                await this.s3Service.deleteFile(staff.profilePicS3Key);
            }
            catch (error) {
                console.error('Failed to delete old staff profile picture:', error);
            }
        }
        const result = await this.s3Service.uploadFile(file, {
            folder: 'staff-profiles',
        });
        await this.staffRepository.update(staffId, {
            profilePic: result.url,
            profilePicCdnUrl: result.cdnUrl,
            profilePicS3Key: result.key,
        });
        const profilePictureData = {
            profilePic: result.url,
            profilePicCdnUrl: result.cdnUrl,
            profilePicS3Key: result.key,
        };
        return new dto_1.ProfilePictureResponseDto(201, true, 'Profile picture uploaded successfully', profilePictureData);
    }
    async deleteProfilePicture(userId, staffId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const staff = await this.staffRepository.findOne({
            where: { id: staffId, businessOwnerId: businessOwner.id },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found');
        }
        if (!staff.profilePicS3Key) {
            throw new common_1.BadRequestException('No profile picture to delete');
        }
        await this.s3Service.deleteFile(staff.profilePicS3Key);
        await this.staffRepository.update(staffId, {
            profilePic: null,
            profilePicCdnUrl: null,
            profilePicS3Key: null,
        });
        const messageData = {
            message: 'Profile picture deleted successfully',
        };
        return new dto_1.MessageResponseDto(200, true, 'Profile picture deleted successfully', messageData);
    }
    async createLunchBreaks(userId, staffId, startTime, endTime) {
        try {
            const weekDays = [1, 2, 3, 4, 5];
            for (const dayOfWeek of weekDays) {
                await this.staffScheduleService.createStaffBreak(userId, staffId, {
                    dayOfWeek,
                    startTime,
                    endTime,
                    breakType: enums_1.BreakType.LUNCH,
                    isRecurring: true,
                });
            }
        }
        catch (error) {
            console.error('Failed to create lunch breaks during staff creation:', error);
        }
    }
    async updateLunchBreaks(userId, staffId, startTime, endTime) {
        try {
            const staffBreaksResponse = await this.staffScheduleService.getStaffBreaks(userId, staffId);
            const existingBreaks = staffBreaksResponse.data;
            const existingLunchBreaks = existingBreaks.filter((breakItem) => breakItem.breakType === enums_1.BreakType.LUNCH &&
                breakItem.dayOfWeek >= 1 &&
                breakItem.dayOfWeek <= 5 &&
                breakItem.isActive);
            for (const lunchBreak of existingLunchBreaks) {
                await this.staffScheduleService.updateStaffBreak(userId, staffId, lunchBreak.id, {
                    startTime,
                    endTime,
                    isActive: true,
                });
            }
            if (existingLunchBreaks.length === 0) {
                await this.createLunchBreaks(userId, staffId, startTime, endTime);
            }
        }
        catch (error) {
            console.error('Failed to update lunch breaks during staff update:', error);
        }
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Staff)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.StaffService)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.BookingRequest)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        s3_service_1.S3Service,
        staff_schedule_management_service_1.StaffScheduleManagementService])
], StaffService);
//# sourceMappingURL=staff.service.js.map
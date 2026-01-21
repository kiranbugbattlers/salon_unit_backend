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
exports.BusinessOwnerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const dto_1 = require("./dto");
const enums_1 = require("../common/enums");
const business_document_enum_1 = require("../common/enums/business-document.enum");
const entities_2 = require("../database/entities");
const shop_id_util_1 = require("../common/utils/shop-id.util");
const approval_service_1 = require("../approval/approval.service");
const s3_service_1 = require("../common/services/s3.service");
let BusinessOwnerService = class BusinessOwnerService {
    constructor(businessOwnerRepository, onboardingRepository, addressRepository, mediaRepository, businessOperatingHoursRepository, businessServiceRepository, servicePackageRepository, servicePackageItemRepository, serviceRepository, serviceCategoryRepository, userRepository, customerRepository, bankingInfoRepository, businessSettingsRepository, reviewRepository, businessDocumentRepository, approvalService, s3Service) {
        this.businessOwnerRepository = businessOwnerRepository;
        this.onboardingRepository = onboardingRepository;
        this.addressRepository = addressRepository;
        this.mediaRepository = mediaRepository;
        this.businessOperatingHoursRepository = businessOperatingHoursRepository;
        this.businessServiceRepository = businessServiceRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.servicePackageItemRepository = servicePackageItemRepository;
        this.serviceRepository = serviceRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.bankingInfoRepository = bankingInfoRepository;
        this.businessSettingsRepository = businessSettingsRepository;
        this.reviewRepository = reviewRepository;
        this.businessDocumentRepository = businessDocumentRepository;
        this.approvalService = approvalService;
        this.s3Service = s3Service;
    }
    async generateUniqueShopId() {
        let attempts = 0;
        const maxAttempts = 5;
        while (attempts < maxAttempts) {
            const shopId = (0, shop_id_util_1.generateShopId)();
            const existingBusiness = await this.businessOwnerRepository.findOne({
                where: { shopId }
            });
            if (!existingBusiness) {
                return shopId;
            }
            attempts++;
        }
        throw new Error('Failed to generate unique shopId after maximum attempts');
    }
    async populateShopIds() {
        const businessOwnersWithoutShopId = await this.businessOwnerRepository.find({
            where: { shopId: null }
        });
        for (const businessOwner of businessOwnersWithoutShopId) {
            businessOwner.shopId = await this.generateUniqueShopId();
            await this.businessOwnerRepository.save(businessOwner);
        }
    }
    async getBusinessOwnerProfile(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        let businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
            relations: ['addresses', 'onboarding', 'user', 'user.addresses'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner profile not found');
        }
        if (!businessOwner.shopId) {
            businessOwner.shopId = await this.generateUniqueShopId();
            businessOwner = await this.businessOwnerRepository.save(businessOwner);
        }
        const profileData = {
            id: businessOwner.id,
            userId: businessOwner.userId,
            shopId: businessOwner.shopId,
            firstName: businessOwner.firstName,
            lastName: businessOwner.lastName,
            gender: businessOwner.gender,
            dateOfBirth: businessOwner.dateOfBirth,
            businessName: businessOwner.businessName,
            businessDescription: businessOwner.businessDescription,
            operatingYears: businessOwner.operatingYears,
            phone: user.phone,
            email: user.email,
            profilePic: user.profilePic,
            profilePicCdnUrl: user.profilePicCdnUrl,
            profilePicS3Key: user.profilePicS3Key,
            isPhoneVerified: user.isPhoneVerified,
            isEmailVerified: user.isEmailVerified,
            address: (() => {
                const homeAddress = businessOwner.user.addresses?.find(addr => addr.addressType === enums_1.AddressType.HOME && addr.isActive);
                return homeAddress ? {
                    id: homeAddress.id,
                    addressType: homeAddress.addressType,
                    latitude: homeAddress.latitude || 0,
                    longitude: homeAddress.longitude || 0,
                    streetAddress: homeAddress.streetAddress,
                    addressLine1: homeAddress.addressLine1,
                    addressLine2: homeAddress.addressLine2,
                    landmark: homeAddress.landmark,
                    city: homeAddress.city,
                    state: homeAddress.state,
                    postalCode: homeAddress.postalCode,
                    country: homeAddress.country,
                    isPrimary: homeAddress.isPrimary,
                    isActive: homeAddress.isActive,
                } : null;
            })(),
            onboarding: {
                isCompleted: businessOwner.onboarding?.isCompleted || false,
                currentStep: businessOwner.onboarding?.currentStep || 1,
                completedSteps: businessOwner.onboarding?.completedSteps || [],
                progressPercentage: businessOwner.onboarding?.getProgressPercentage() || 0,
                stepData: {
                    step1: businessOwner.onboarding?.step1Data || {},
                    step2: businessOwner.onboarding?.step2Data || {},
                    step3: businessOwner.onboarding?.step3Data || {},
                    step4: businessOwner.onboarding?.step4Data || {},
                },
            },
            ...await this.calculateBusinessRating(businessOwner.id),
            createdAt: businessOwner.createdAt,
            updatedAt: businessOwner.updatedAt,
        };
        return new dto_1.BusinessOwnerProfileResponseDto(200, true, 'Business owner profile retrieved successfully', profileData);
    }
    async updateBusinessOwnerProfile(userId, updateData) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
            relations: ['addresses', 'onboarding', 'user'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner profile not found');
        }
        const businessOwnerUpdate = updateData;
        if (businessOwnerUpdate.businessName && businessOwnerUpdate.businessName !== businessOwner.businessName) {
            const existingBusiness = await this.businessOwnerRepository.findOne({
                where: { businessName: businessOwnerUpdate.businessName },
            });
            if (existingBusiness && existingBusiness.id !== businessOwner.id) {
                throw new common_1.ConflictException('Business name already exists');
            }
        }
        Object.keys(businessOwnerUpdate).forEach((key) => {
            if (businessOwnerUpdate[key] !== undefined) {
                if (key === 'dateOfBirth' && businessOwnerUpdate[key]) {
                    businessOwner[key] = new Date(businessOwnerUpdate[key]);
                }
                else {
                    businessOwner[key] = businessOwnerUpdate[key];
                }
            }
        });
        await this.businessOwnerRepository.save(businessOwner);
        return this.getBusinessOwnerProfile(userId);
    }
    async completeOnboardingStep1(userId, step1Data) {
        const businessOwner = await this.getBusinessOwnerWithOnboarding(userId);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const hasCompleteInfo = user.phone && user.email &&
            businessOwner.firstName && businessOwner.lastName;
        if (hasCompleteInfo) {
            if (!businessOwner.onboarding.completedSteps.includes(1)) {
                businessOwner.onboarding.completedSteps.push(1);
            }
            businessOwner.onboarding.currentStep = Math.max(businessOwner.onboarding.currentStep, 2);
            businessOwner.onboarding.step1Data = {
                skipped: true,
                reason: 'User already has complete profile information'
            };
            await this.onboardingRepository.save(businessOwner.onboarding);
            return new dto_1.BusinessOwnerOnboardingStepResponseDto(200, true, 'Step 1 skipped - user already has complete profile information', { nextStep: businessOwner.onboarding.currentStep, skipStep1: true });
        }
        const signedUpWithPhone = user.phone && user.isPhoneVerified;
        const signedUpWithEmail = user.email && user.isEmailVerified;
        if (signedUpWithPhone && !signedUpWithEmail) {
            if (step1Data.phone && step1Data.phone !== user.phone) {
                throw new common_1.BadRequestException('Cannot change phone number after signup');
            }
        }
        else if (signedUpWithEmail && !signedUpWithPhone) {
            if (!step1Data.phone) {
                throw new common_1.BadRequestException('Phone number is required for email signup users');
            }
            if (step1Data.email && step1Data.email !== user.email) {
                throw new common_1.BadRequestException('Cannot change email address after signup');
            }
        }
        if (!businessOwner.onboarding.completedSteps.includes(1)) {
            businessOwner.onboarding.completedSteps.push(1);
        }
        businessOwner.onboarding.step1Data = step1Data;
        businessOwner.onboarding.currentStep = Math.max(businessOwner.onboarding.currentStep, 2);
        businessOwner.firstName = step1Data.firstName;
        businessOwner.lastName = step1Data.lastName;
        businessOwner.gender = step1Data.gender;
        if (step1Data.dateOfBirth) {
            businessOwner.dateOfBirth = new Date(step1Data.dateOfBirth);
        }
        if (!user.phone && step1Data.phone) {
            const existingPhoneUser = await this.userRepository.findOne({
                where: { phone: step1Data.phone }
            });
            if (existingPhoneUser && existingPhoneUser.id !== userId) {
                throw new common_1.ConflictException('Phone number already exists');
            }
            await this.userRepository.update(userId, { phone: step1Data.phone });
        }
        if (!user.email && step1Data.email) {
            const existingEmailUser = await this.userRepository.findOne({
                where: { email: step1Data.email }
            });
            if (existingEmailUser && existingEmailUser.id !== userId) {
                throw new common_1.ConflictException('Email already exists');
            }
            await this.userRepository.update(userId, { email: step1Data.email });
        }
        await this.businessOwnerRepository.save(businessOwner);
        await this.onboardingRepository.save(businessOwner.onboarding);
        return new dto_1.BusinessOwnerOnboardingStepResponseDto(200, true, 'Step 1 completed successfully', { nextStep: businessOwner.onboarding.currentStep });
    }
    async completeOnboardingStep2(userId, step2Data, files) {
        const businessOwner = await this.getBusinessOwnerWithOnboarding(userId);
        const existingBusiness = await this.businessOwnerRepository.findOne({
            where: { businessName: step2Data.businessName },
        });
        if (existingBusiness && existingBusiness.id !== businessOwner.id) {
            throw new common_1.ConflictException('Business name already exists');
        }
        if (!businessOwner.onboarding.completedSteps.includes(2)) {
            businessOwner.onboarding.completedSteps.push(2);
        }
        businessOwner.onboarding.step2Data = step2Data;
        businessOwner.onboarding.currentStep = Math.max(businessOwner.onboarding.currentStep, 3);
        businessOwner.businessName = step2Data.businessName;
        businessOwner.businessDescription = step2Data.businessDescription;
        const address = this.addressRepository.create({
            businessOwnerId: businessOwner.id,
            addressType: enums_1.AddressType.BUSINESS,
            latitude: step2Data.latitude,
            longitude: step2Data.longitude,
            streetAddress: step2Data.streetAddress,
            addressLine1: step2Data.addressLine1,
            addressLine2: step2Data.addressLine2,
            landmark: step2Data.landmark,
            city: step2Data.city,
            state: step2Data.state,
            postalCode: step2Data.postalCode,
            country: step2Data.country || 'India',
            isPrimary: true,
        });
        await this.addressRepository.save(address);
        if (files && files.length > 0) {
            const uploadOptions = {
                folder: 'portfolios',
                prefix: `business_owner_${businessOwner.id}`,
                publicRead: true,
            };
            const uploadResults = await this.s3Service.uploadFiles(files, uploadOptions);
            await Promise.all(uploadResults.map(async (result, index) => {
                const media = this.mediaRepository.create({
                    businessOwnerId: businessOwner.id,
                    mediaType: this.s3Service.isVideo(result.mimeType) ? enums_1.MediaType.VIDEO : enums_1.MediaType.IMAGE,
                    mediaUrl: result.url,
                    cdnUrl: result.cdnUrl,
                    s3Key: result.key,
                    fileName: result.originalName,
                    fileSize: result.size,
                    mimeType: result.mimeType,
                    displayOrder: index,
                    isActive: true,
                });
                return await this.mediaRepository.save(media);
            }));
        }
        await this.businessOwnerRepository.save(businessOwner);
        await this.onboardingRepository.save(businessOwner.onboarding);
        return new dto_1.BusinessOwnerOnboardingStepResponseDto(200, true, 'Step 2 completed successfully', { nextStep: businessOwner.onboarding.currentStep });
    }
    async completeOnboardingStep3(userId, step3Data) {
        const businessOwner = await this.getBusinessOwnerWithOnboarding(userId);
        if (step3Data.servicesOffered && step3Data.servicesOffered.length > 0) {
            const serviceIds = step3Data.servicesOffered.map(service => service.serviceId);
            const existingServices = await this.serviceRepository.findBy({
                id: (0, typeorm_2.In)(serviceIds),
                isActive: true,
            });
            if (existingServices.length !== serviceIds.length) {
                const foundServiceIds = existingServices.map(service => service.id);
                const invalidServiceIds = serviceIds.filter(id => !foundServiceIds.includes(id));
                throw new common_1.BadRequestException(`Invalid or inactive service IDs: ${invalidServiceIds.join(', ')}`);
            }
            await this.cleanupBusinessServicesWithDependencies(businessOwner.id);
            const businessServices = step3Data.servicesOffered.map(serviceOffering => ({
                businessOwnerId: businessOwner.id,
                serviceId: serviceOffering.serviceId,
                customPrice: serviceOffering.customPrice,
                customDurationMinutes: serviceOffering.customDurationMinutes,
                isActive: true,
            }));
            await this.businessServiceRepository.save(businessServices);
        }
        if (step3Data.businessHours && step3Data.businessHours.length > 0) {
            await this.businessOperatingHoursRepository.delete({ businessOwnerId: businessOwner.id });
            const businessHours = step3Data.businessHours.map(hours => ({
                businessOwnerId: businessOwner.id,
                dayOfWeek: hours.dayOfWeek,
                openTime: hours.openTime,
                closeTime: hours.closeTime,
                isClosed: hours.isClosed || false,
            }));
            await this.businessOperatingHoursRepository.save(businessHours);
        }
        if (!businessOwner.onboarding.completedSteps.includes(3)) {
            businessOwner.onboarding.completedSteps.push(3);
        }
        businessOwner.onboarding.step3Data = step3Data;
        businessOwner.onboarding.currentStep = Math.max(businessOwner.onboarding.currentStep, 4);
        await this.onboardingRepository.save(businessOwner.onboarding);
        return new dto_1.BusinessOwnerOnboardingStepResponseDto(200, true, 'Step 3 completed successfully', { nextStep: businessOwner.onboarding.currentStep });
    }
    async completeOnboardingStep4(userId, step4Data) {
        const businessOwner = await this.getBusinessOwnerWithOnboarding(userId);
        if (!businessOwner.onboarding.completedSteps.includes(4)) {
            businessOwner.onboarding.completedSteps.push(4);
        }
        businessOwner.onboarding.step4Data = step4Data;
        businessOwner.onboarding.isCompleted = true;
        businessOwner.operatingYears = step4Data.operatingYears;
        await this.businessOwnerRepository.save(businessOwner);
        await this.onboardingRepository.save(businessOwner.onboarding);
        try {
            let bankingInfo = await this.bankingInfoRepository.findOne({
                where: { businessOwnerId: businessOwner.id },
            });
            if (bankingInfo) {
                bankingInfo.accountNumber = step4Data.accountNumber;
                bankingInfo.accountHolderName = step4Data.accountHolderName;
                bankingInfo.ifscCode = step4Data.ifscCode;
                bankingInfo.bankName = step4Data.bankName;
                bankingInfo.branch = step4Data.branch;
                bankingInfo.isVerified = false;
                bankingInfo.verifiedAt = null;
            }
            else {
                bankingInfo = this.bankingInfoRepository.create({
                    businessOwnerId: businessOwner.id,
                    accountNumber: step4Data.accountNumber,
                    accountHolderName: step4Data.accountHolderName,
                    ifscCode: step4Data.ifscCode,
                    bankName: step4Data.bankName,
                    branch: step4Data.branch,
                    isVerified: false,
                });
            }
            await this.bankingInfoRepository.save(bankingInfo);
        }
        catch (error) {
            console.error('Failed to save banking information:', error.message);
        }
        try {
            await this.approvalService.createApprovalRequest(businessOwner.id);
        }
        catch (error) {
            console.error('Failed to create approval request:', error.message);
        }
        return new dto_1.BusinessOwnerOnboardingCompletionResponseDto(200, true, 'Business owner onboarding completed successfully! Your business registration is now being reviewed by our team. You will be notified once approved.', { completed: true });
    }
    async getOnboardingStatus(userId) {
        const businessOwner = await this.getBusinessOwnerWithOnboarding(userId);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        let step1Data = businessOwner.onboarding.step1Data || {};
        if (Object.keys(step1Data).length === 0 && (user.phone || user.email || businessOwner.firstName || businessOwner.lastName)) {
            step1Data = {
                firstName: businessOwner.firstName || '',
                lastName: businessOwner.lastName || '',
                phone: user.phone || '',
                email: user.email || '',
                dateOfBirth: businessOwner.dateOfBirth ?
                    (businessOwner.dateOfBirth instanceof Date ?
                        businessOwner.dateOfBirth.toISOString().split('T')[0] :
                        String(businessOwner.dateOfBirth)) : '',
            };
        }
        const businessMedia = await this.getBusinessMediaRaw(userId);
        const statusData = {
            isCompleted: businessOwner.onboarding.isCompleted,
            currentStep: businessOwner.onboarding.currentStep,
            completedSteps: businessOwner.onboarding.completedSteps,
            progressPercentage: businessOwner.onboarding.getProgressPercentage(),
            stepData: {
                step1: step1Data,
                step2: {
                    ...businessOwner.onboarding.step2Data || {},
                    media: businessMedia,
                },
                step3: businessOwner.onboarding.step3Data || {},
                step4: businessOwner.onboarding.step4Data || {},
            },
        };
        return new dto_1.BusinessOwnerOnboardingStatusResponseDto(200, true, 'Business owner onboarding status retrieved successfully', statusData);
    }
    async getBusinessOwnerWithOnboarding(userId) {
        let businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
            relations: ['onboarding'],
        });
        let needsCustomerDataCopy = false;
        if (!businessOwner) {
            const uniqueShopId = await this.generateUniqueShopId();
            businessOwner = this.businessOwnerRepository.create({
                userId,
                shopId: uniqueShopId
            });
            needsCustomerDataCopy = true;
        }
        else if (!businessOwner.firstName || !businessOwner.lastName) {
            needsCustomerDataCopy = true;
        }
        let customerDataCopied = false;
        if (needsCustomerDataCopy) {
            const customer = await this.customerRepository.findOne({ where: { userId } });
            if (customer && customer.firstName && customer.lastName) {
                businessOwner.firstName = customer.firstName;
                businessOwner.lastName = customer.lastName;
                businessOwner.dateOfBirth = customer.dateOfBirth;
                customerDataCopied = true;
            }
        }
        if (!businessOwner.id || customerDataCopied) {
            businessOwner = await this.businessOwnerRepository.save(businessOwner);
        }
        if (!businessOwner.onboarding) {
            const onboarding = this.onboardingRepository.create({
                businessOwnerId: businessOwner.id,
                currentStep: customerDataCopied ? 2 : 1,
                completedSteps: customerDataCopied ? [1] : [],
            });
            businessOwner.onboarding = await this.onboardingRepository.save(onboarding);
        }
        if (businessOwner.onboarding && !businessOwner.onboarding.completedSteps.includes(1)) {
            const hasCompletePersonalData = businessOwner.firstName && businessOwner.lastName;
            if (hasCompletePersonalData) {
                businessOwner.onboarding.completedSteps.push(1);
                businessOwner.onboarding.currentStep = Math.max(businessOwner.onboarding.currentStep, 2);
                if (!businessOwner.onboarding.step1Data || Object.keys(businessOwner.onboarding.step1Data).length === 0) {
                    const user = await this.userRepository.findOne({ where: { id: userId } });
                    businessOwner.onboarding.step1Data = {
                        firstName: businessOwner.firstName,
                        lastName: businessOwner.lastName,
                        phone: user?.phone || '',
                        email: user?.email || '',
                        dateOfBirth: businessOwner.dateOfBirth ?
                            (businessOwner.dateOfBirth instanceof Date ?
                                businessOwner.dateOfBirth.toISOString().split('T')[0] :
                                String(businessOwner.dateOfBirth)) : '',
                    };
                }
                businessOwner.onboarding = await this.onboardingRepository.save(businessOwner.onboarding);
            }
        }
        return businessOwner;
    }
    async uploadProfilePicture(userId, file) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.profilePicS3Key) {
            try {
                await this.s3Service.deleteFile(user.profilePicS3Key);
            }
            catch (error) {
                console.error('Failed to delete old profile picture:', error);
            }
        }
        const uploadOptions = {
            folder: 'profiles',
            prefix: `business_owner_${userId}`,
            customFileName: 'profile',
            publicRead: true,
        };
        const result = await this.s3Service.uploadFile(file, uploadOptions);
        await this.userRepository.update(userId, {
            profilePic: result.url,
            profilePicCdnUrl: result.cdnUrl,
            profilePicS3Key: result.key,
        });
        return {
            profilePic: result.url,
            profilePicCdnUrl: result.cdnUrl,
            profilePicS3Key: result.key,
        };
    }
    async deleteProfilePicture(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.profilePicS3Key) {
            throw new common_1.BadRequestException('No profile picture to delete');
        }
        await this.s3Service.deleteFile(user.profilePicS3Key);
        await this.userRepository.update(userId, {
            profilePic: null,
            profilePicCdnUrl: null,
            profilePicS3Key: null,
        });
    }
    async uploadBusinessMedia(userId, files, mediaType = enums_1.MediaType.IMAGE) {
        const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const uploadOptions = {
            folder: 'portfolios',
            prefix: `business_owner_${businessOwner.id}`,
            publicRead: true,
        };
        const uploadResults = await this.s3Service.uploadFiles(files, uploadOptions);
        const mediaRecords = await Promise.all(uploadResults.map(async (result, index) => {
            const media = this.mediaRepository.create({
                businessOwnerId: businessOwner.id,
                mediaType: this.s3Service.isVideo(result.mimeType) ? enums_1.MediaType.VIDEO : enums_1.MediaType.IMAGE,
                mediaUrl: result.url,
                cdnUrl: result.cdnUrl,
                s3Key: result.key,
                fileName: result.originalName,
                fileSize: result.size,
                mimeType: result.mimeType,
                displayOrder: index,
                isActive: true,
            });
            return await this.mediaRepository.save(media);
        }));
        const mediaData = mediaRecords.map(media => ({
            mediaId: media.id,
            mediaUrl: media.mediaUrl,
            cdnUrl: media.cdnUrl,
            s3Key: media.s3Key,
        }));
        const responseData = {
            media: mediaData,
            count: mediaData.length,
        };
        return new dto_1.BusinessMediaUploadResponseDto(201, true, 'Business media uploaded successfully', responseData);
    }
    async deleteBusinessMedia(userId, mediaId) {
        const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId, businessOwnerId: businessOwner.id },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        if (media.s3Key) {
            await this.s3Service.deleteFile(media.s3Key);
        }
        await this.mediaRepository.remove(media);
        return new dto_1.BusinessMediaDeleteResponseDto(200, true, 'Business media deleted successfully');
    }
    async getBusinessMediaRaw(userId) {
        const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const media = await this.mediaRepository.find({
            where: { businessOwnerId: businessOwner.id, isActive: true },
            order: { displayOrder: 'ASC', createdAt: 'DESC' },
        });
        return media.map(item => ({
            id: item.id,
            mediaType: item.mediaType,
            mediaUrl: item.mediaUrl,
            cdnUrl: item.cdnUrl,
            thumbnailUrl: item.thumbnailUrl,
            fileName: item.fileName,
            fileSize: item.fileSize,
            mimeType: item.mimeType,
            displayOrder: item.displayOrder,
            createdAt: item.createdAt,
        }));
    }
    async getBusinessMedia(userId) {
        const mediaData = await this.getBusinessMediaRaw(userId);
        const responseData = {
            media: mediaData,
            count: mediaData.length,
        };
        return new dto_1.BusinessMediaListResponseDto(200, true, 'Business media retrieved successfully', responseData);
    }
    async getBusinessInfo(userId) {
        let businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
            relations: ['addresses'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        if (!businessOwner.shopId) {
            businessOwner.shopId = await this.generateUniqueShopId();
            businessOwner = await this.businessOwnerRepository.save(businessOwner);
        }
        const businessMedia = await this.getBusinessMediaRaw(userId);
        const businessInfo = {
            id: businessOwner.id,
            userId: businessOwner.userId,
            shopId: businessOwner.shopId,
            businessName: businessOwner.businessName,
            businessDescription: businessOwner.businessDescription,
            operatingYears: businessOwner.operatingYears,
            isApproved: businessOwner.isApproved,
            approvedAt: businessOwner.approvedAt,
            address: (() => {
                const businessAddress = businessOwner.addresses?.find(addr => addr.addressType === enums_1.AddressType.BUSINESS && addr.isActive);
                return businessAddress ? {
                    id: businessAddress.id,
                    addressType: businessAddress.addressType,
                    latitude: businessAddress.latitude,
                    longitude: businessAddress.longitude,
                    streetAddress: businessAddress.streetAddress,
                    addressLine1: businessAddress.addressLine1,
                    addressLine2: businessAddress.addressLine2,
                    landmark: businessAddress.landmark,
                    city: businessAddress.city,
                    state: businessAddress.state,
                    postalCode: businessAddress.postalCode,
                    country: businessAddress.country,
                    isPrimary: businessAddress.isPrimary,
                    isActive: businessAddress.isActive,
                } : null;
            })(),
            media: businessMedia,
            ...await this.calculateBusinessRating(businessOwner.id),
            createdAt: businessOwner.createdAt,
            updatedAt: businessOwner.updatedAt,
        };
        return new dto_1.BusinessInfoResponseDto(200, true, 'Business information retrieved successfully', businessInfo);
    }
    async updateBusinessInfo(userId, updateData) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        if (updateData.businessName && updateData.businessName !== businessOwner.businessName) {
            const existingBusiness = await this.businessOwnerRepository.findOne({
                where: { businessName: updateData.businessName },
            });
            if (existingBusiness && existingBusiness.id !== businessOwner.id) {
                throw new common_1.ConflictException('Business name already exists');
            }
        }
        if (updateData.businessName !== undefined) {
            businessOwner.businessName = updateData.businessName;
        }
        if (updateData.businessDescription !== undefined) {
            businessOwner.businessDescription = updateData.businessDescription;
        }
        if (updateData.operatingYears !== undefined) {
            businessOwner.operatingYears = updateData.operatingYears;
        }
        await this.businessOwnerRepository.save(businessOwner);
        return this.getBusinessInfo(userId);
    }
    async getBusinessServices(userId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
            relations: ['businessServices', 'businessServices.service', 'businessServices.service.category'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const services = businessOwner.businessServices?.map(bs => ({
            id: bs.id,
            serviceId: bs.serviceId,
            serviceName: bs.service?.name || '',
            serviceDescription: bs.service?.description || '',
            serviceCategoryName: bs.service?.category?.name || '',
            defaultPrice: bs.service?.basePrice || 0,
            defaultDurationMinutes: bs.service?.defaultDuration || 0,
            customPrice: bs.customPrice,
            customDurationMinutes: bs.customDurationMinutes,
            isActive: bs.isActive,
            createdAt: bs.createdAt,
            updatedAt: bs.updatedAt,
        })) || [];
        return new dto_1.BusinessServicesResponseDto(200, true, 'Business services retrieved successfully', services);
    }
    async updateBusinessServices(userId, updateData) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const serviceIds = updateData.services.map(s => s.serviceId);
        const existingServices = await this.serviceRepository.findBy({
            id: (0, typeorm_2.In)(serviceIds),
            isActive: true,
        });
        if (existingServices.length !== serviceIds.length) {
            const foundServiceIds = existingServices.map(service => service.id);
            const invalidServiceIds = serviceIds.filter(id => !foundServiceIds.includes(id));
            throw new common_1.BadRequestException(`Invalid or inactive service IDs: ${invalidServiceIds.join(', ')}`);
        }
        for (const serviceUpdate of updateData.services) {
            let businessService = await this.businessServiceRepository.findOne({
                where: {
                    businessOwnerId: businessOwner.id,
                    serviceId: serviceUpdate.serviceId
                },
            });
            if (!businessService) {
                businessService = this.businessServiceRepository.create({
                    businessOwnerId: businessOwner.id,
                    serviceId: serviceUpdate.serviceId,
                    customPrice: serviceUpdate.customPrice,
                    customDurationMinutes: serviceUpdate.customDurationMinutes,
                    isActive: serviceUpdate.isActive !== undefined ? serviceUpdate.isActive : true,
                });
            }
            else {
                if (serviceUpdate.customPrice !== undefined) {
                    businessService.customPrice = serviceUpdate.customPrice;
                }
                if (serviceUpdate.customDurationMinutes !== undefined) {
                    businessService.customDurationMinutes = serviceUpdate.customDurationMinutes;
                }
                if (serviceUpdate.isActive !== undefined) {
                    businessService.isActive = serviceUpdate.isActive;
                }
            }
            await this.businessServiceRepository.save(businessService);
        }
        return this.getBusinessServices(userId);
    }
    async deleteBusinessServices(userId, deleteData) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const { businessServiceIds } = deleteData;
        const deleted = [];
        const failed = [];
        for (const businessServiceId of businessServiceIds) {
            try {
                const businessService = await this.businessServiceRepository.findOne({
                    where: {
                        id: businessServiceId,
                        businessOwnerId: businessOwner.id,
                    },
                });
                if (!businessService) {
                    failed.push({
                        id: businessServiceId,
                        reason: 'Business service not found or does not belong to this business owner',
                    });
                    continue;
                }
                const packageDependency = await this.servicePackageItemRepository.findOne({
                    where: {
                        businessServiceId: businessServiceId,
                    },
                    relations: ['servicePackage'],
                });
                if (packageDependency && packageDependency.servicePackage.isActive) {
                    failed.push({
                        id: businessServiceId,
                        reason: `Used in active service package: ${packageDependency.servicePackage.name}`,
                    });
                    continue;
                }
                await this.servicePackageItemRepository.delete({
                    businessServiceId: businessServiceId,
                });
                await this.businessServiceRepository.remove(businessService);
                deleted.push(businessServiceId);
            }
            catch (error) {
                failed.push({
                    id: businessServiceId,
                    reason: 'Failed to delete due to unexpected error',
                });
            }
        }
        const responseData = {
            deleted,
            failed,
            total: deleted.length,
        };
        const message = failed.length > 0
            ? `${deleted.length} services deleted, ${failed.length} failed`
            : 'Business services deleted successfully';
        const success = failed.length === 0;
        const code = failed.length > 0 ? 207 : 200;
        return new dto_1.DeleteBusinessServicesResponseDto(code, success, message, responseData);
    }
    async getBusinessServicesGroupedByCategory(userId, page = 1, limit = 10, isActive) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const skip = (page - 1) * limit;
        const categoryQuery = this.serviceCategoryRepository
            .createQueryBuilder('category')
            .innerJoin('category.services', 'service')
            .innerJoin('service.businessServices', 'businessService')
            .where('category.isActive = :categoryIsActive', { categoryIsActive: true })
            .andWhere('businessService.businessOwnerId = :businessOwnerId', { businessOwnerId: businessOwner.id });
        if (isActive !== undefined) {
            categoryQuery.andWhere('businessService.isActive = :isActive', { isActive });
        }
        categoryQuery
            .groupBy('category.id')
            .orderBy('category.name', 'ASC');
        const categories = await categoryQuery.getMany();
        const categoriesWithServices = [];
        for (const category of categories) {
            const businessServiceQuery = this.businessServiceRepository
                .createQueryBuilder('businessService')
                .leftJoinAndSelect('businessService.service', 'service')
                .where('businessService.businessOwnerId = :businessOwnerId', { businessOwnerId: businessOwner.id })
                .andWhere('service.categoryId = :categoryId', { categoryId: category.id })
                .andWhere('service.isActive = :serviceIsActive', { serviceIsActive: true });
            if (isActive !== undefined) {
                businessServiceQuery.andWhere('businessService.isActive = :isActive', { isActive });
            }
            businessServiceQuery.orderBy('service.name', 'ASC');
            const businessServices = await businessServiceQuery.getMany();
            if (businessServices.length > 0) {
                categoriesWithServices.push({
                    id: category.id,
                    name: category.name,
                    description: category.description,
                    image: category.image,
                    isActive: category.isActive,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt,
                    services: businessServices.map(bs => this.mapToBusinessOwnerServiceInCategoryDto(bs)),
                });
            }
        }
        const total = categoriesWithServices.length;
        const paginatedCategories = categoriesWithServices.slice(skip, skip + limit);
        const responseData = {
            categories: paginatedCategories,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
        return new dto_1.BusinessOwnerServicesGroupedByCategoryResponseDto(200, true, 'Business services grouped by categories retrieved successfully', responseData);
    }
    mapToBusinessOwnerServiceInCategoryDto(businessService) {
        return {
            id: businessService.id,
            serviceId: businessService.serviceId,
            name: businessService.service.name,
            description: businessService.service.description,
            image: businessService.service.image,
            defaultPrice: businessService.service.basePrice || 0,
            defaultDurationMinutes: businessService.service.defaultDuration || 0,
            customPrice: businessService.customPrice,
            customDurationMinutes: businessService.customDurationMinutes,
            availableAtHome: businessService.service.availableAtHome,
            isActive: businessService.isActive,
            gender: businessService.service.gender,
            createdAt: businessService.createdAt,
            updatedAt: businessService.updatedAt,
        };
    }
    async createServicePackage(userId, createDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const businessServiceIds = createDto.services.map(s => s.businessServiceId);
        const businessServices = await this.businessServiceRepository.find({
            where: {
                id: (0, typeorm_2.In)(businessServiceIds),
                businessOwnerId: businessOwner.id,
                isActive: true,
            },
            relations: ['service', 'service.category'],
        });
        if (businessServices.length !== businessServiceIds.length) {
            const foundIds = businessServices.map(bs => bs.id);
            const invalidIds = businessServiceIds.filter(id => !foundIds.includes(id));
            throw new common_1.BadRequestException(`Invalid business service IDs: ${invalidIds.join(', ')}`);
        }
        const servicePackage = this.servicePackageRepository.create({
            businessOwnerId: businessOwner.id,
            name: createDto.name,
            description: createDto.description,
            discountPercentage: createDto.discountPercentage,
        });
        const savedPackage = await this.servicePackageRepository.save(servicePackage);
        const packageItems = createDto.services.map(serviceDto => this.servicePackageItemRepository.create({
            packageId: savedPackage.id,
            businessServiceId: serviceDto.businessServiceId,
        }));
        await this.servicePackageItemRepository.save(packageItems);
        const createdPackage = await this.getServicePackageById(userId, savedPackage.id);
        return new dto_1.ServicePackageResponseWrapperDto(201, true, 'Service package created successfully', createdPackage);
    }
    async getServicePackages(userId, page = 1, limit = 10, isActive) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const skip = (page - 1) * limit;
        const queryBuilder = this.servicePackageRepository
            .createQueryBuilder('package')
            .leftJoinAndSelect('package.packageItems', 'packageItem')
            .leftJoinAndSelect('packageItem.businessService', 'businessService')
            .leftJoinAndSelect('businessService.service', 'service')
            .leftJoinAndSelect('service.category', 'category')
            .where('package.businessOwnerId = :businessOwnerId', { businessOwnerId: businessOwner.id })
            .orderBy('package.createdAt', 'DESC')
            .skip(skip)
            .take(limit);
        if (isActive !== undefined) {
            queryBuilder.andWhere('package.isActive = :isActive', { isActive });
        }
        const [packages, total] = await queryBuilder.getManyAndCount();
        const packageData = packages.map(pkg => this.mapToServicePackageResponseDto(pkg));
        const responseData = {
            packages: packageData,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
        return new dto_1.ServicePackageListResponseDto(200, true, 'Service packages retrieved successfully', responseData);
    }
    async getServicePackageById(userId, packageId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const servicePackage = await this.servicePackageRepository.findOne({
            where: { id: packageId, businessOwnerId: businessOwner.id },
            relations: [
                'packageItems',
                'packageItems.businessService',
                'packageItems.businessService.service',
                'packageItems.businessService.service.category',
            ],
        });
        if (!servicePackage) {
            throw new common_1.NotFoundException('Service package not found');
        }
        return this.mapToServicePackageResponseDto(servicePackage);
    }
    async updateServicePackage(userId, packageId, updateDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const servicePackage = await this.servicePackageRepository.findOne({
            where: { id: packageId, businessOwnerId: businessOwner.id },
        });
        if (!servicePackage) {
            throw new common_1.NotFoundException('Service package not found');
        }
        if (updateDto.name !== undefined) {
            servicePackage.name = updateDto.name;
        }
        if (updateDto.description !== undefined) {
            servicePackage.description = updateDto.description;
        }
        if (updateDto.discountPercentage !== undefined) {
            servicePackage.discountPercentage = updateDto.discountPercentage;
        }
        await this.servicePackageRepository.save(servicePackage);
        if (updateDto.services) {
            const businessServiceIds = updateDto.services.map(s => s.businessServiceId);
            const businessServices = await this.businessServiceRepository.find({
                where: {
                    id: (0, typeorm_2.In)(businessServiceIds),
                    businessOwnerId: businessOwner.id,
                    isActive: true,
                },
            });
            if (businessServices.length !== businessServiceIds.length) {
                const foundIds = businessServices.map(bs => bs.id);
                const invalidIds = businessServiceIds.filter(id => !foundIds.includes(id));
                throw new common_1.BadRequestException(`Invalid business service IDs: ${invalidIds.join(', ')}`);
            }
            await this.servicePackageItemRepository.delete({ packageId });
            const packageItems = updateDto.services.map(serviceDto => this.servicePackageItemRepository.create({
                packageId,
                businessServiceId: serviceDto.businessServiceId,
            }));
            await this.servicePackageItemRepository.save(packageItems);
        }
        const updatedPackage = await this.getServicePackageById(userId, packageId);
        return new dto_1.ServicePackageResponseWrapperDto(200, true, 'Service package updated successfully', updatedPackage);
    }
    async deleteServicePackage(userId, packageId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const servicePackage = await this.servicePackageRepository.findOne({
            where: { id: packageId, businessOwnerId: businessOwner.id },
        });
        if (!servicePackage) {
            throw new common_1.NotFoundException('Service package not found');
        }
        servicePackage.isActive = false;
        await this.servicePackageRepository.save(servicePackage);
        return new dto_1.ServicePackageDeleteResponseDto(200, true, 'Service package deleted successfully');
    }
    async toggleServicePackageActive(userId, packageId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const servicePackage = await this.servicePackageRepository.findOne({
            where: { id: packageId, businessOwnerId: businessOwner.id },
        });
        if (!servicePackage) {
            throw new common_1.NotFoundException('Service package not found');
        }
        servicePackage.isActive = !servicePackage.isActive;
        await this.servicePackageRepository.save(servicePackage);
        const updatedPackage = await this.getServicePackageById(userId, packageId);
        return new dto_1.ServicePackageResponseWrapperDto(200, true, `Service package ${servicePackage.isActive ? 'activated' : 'deactivated'} successfully`, updatedPackage);
    }
    mapToServicePackageResponseDto(servicePackage) {
        const packageItems = servicePackage.packageItems || [];
        let totalOriginalPrice = 0;
        let totalDiscountedPrice = 0;
        let totalDurationMinutes = 0;
        const services = packageItems.map(item => {
            const originalPrice = Number(item.businessService.customPrice);
            const effectiveDuration = item.businessService.customDurationMinutes || item.businessService.service?.defaultDuration || 0;
            totalOriginalPrice += originalPrice;
            totalDurationMinutes += effectiveDuration;
            if (effectiveDuration === 0) {
                console.warn(`⚠️ Service ${item.businessService.id} (${item.businessService.service.name}) in package ${servicePackage.id} has 0 duration. customDurationMinutes: ${item.businessService.customDurationMinutes}, defaultDuration: ${item.businessService.service?.defaultDuration}`);
            }
            return {
                id: item.id,
                businessServiceId: item.businessServiceId,
                serviceName: item.businessService.service.name,
                serviceDescription: item.businessService.service.description || '',
                serviceCategoryName: item.businessService.service.category.name,
                defaultPrice: Number(item.businessService.service.basePrice) || 0,
                customPrice: originalPrice,
                defaultDurationMinutes: item.businessService.service.defaultDuration || 0,
                customDurationMinutes: item.businessService.customDurationMinutes,
                effectiveDurationMinutes: effectiveDuration,
                finalPrice: 0,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            };
        });
        const discountPercent = Number(servicePackage.discountPercentage) || 0;
        const packageDiscountAmount = (totalOriginalPrice * discountPercent) / 100;
        totalDiscountedPrice = totalOriginalPrice - packageDiscountAmount;
        const totalSavings = totalOriginalPrice - totalDiscountedPrice;
        services.forEach(service => {
            if (totalOriginalPrice > 0) {
                const serviceDiscountAmount = (service.customPrice * discountPercent) / 100;
                service.finalPrice = service.customPrice - serviceDiscountAmount;
            }
            else {
                service.finalPrice = service.customPrice;
            }
        });
        return {
            id: servicePackage.id,
            name: servicePackage.name,
            description: servicePackage.description || '',
            discountPercentage: discountPercent,
            totalOriginalPrice,
            totalDiscountedPrice,
            totalSavings,
            totalDurationMinutes,
            serviceCount: packageItems.length,
            isActive: servicePackage.isActive ?? true,
            services,
            createdAt: servicePackage.createdAt,
            updatedAt: servicePackage.updatedAt,
        };
    }
    async cleanupBusinessServicesWithDependencies(businessOwnerId) {
        try {
            const businessServices = await this.businessServiceRepository.find({
                where: { businessOwnerId },
                select: ['id'],
            });
            if (businessServices.length === 0) {
                return;
            }
            const businessServiceIds = businessServices.map(service => service.id);
            const servicePackageItems = await this.servicePackageItemRepository.find({
                where: { businessServiceId: (0, typeorm_2.In)(businessServiceIds) },
                relations: ['servicePackage'],
            });
            if (servicePackageItems.length > 0) {
                await this.servicePackageItemRepository.remove(servicePackageItems);
            }
            const affectedPackageIds = [...new Set(servicePackageItems.map(item => item.servicePackage.id))];
            for (const packageId of affectedPackageIds) {
                const remainingItems = await this.servicePackageItemRepository.count({
                    where: { packageId },
                });
                if (remainingItems === 0) {
                    await this.servicePackageRepository.delete({ id: packageId });
                }
            }
            await this.businessServiceRepository.delete({ businessOwnerId });
        }
        catch (error) {
            console.error('Error during business services cleanup:', error);
            throw new common_1.BadRequestException('Failed to cleanup existing services. Please try again.');
        }
    }
    async getDeliverySettings(businessOwnerId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        let settings = await this.businessSettingsRepository.findOne({
            where: { businessOwnerId },
        });
        if (!settings) {
            settings = this.businessSettingsRepository.create({
                businessOwnerId,
                deliveryChargesEnabled: true,
                baseDeliveryCharge: 0,
                perKmCharge: 10,
                freeDeliveryUptoKm: 5,
                maxDeliveryDistanceKm: 20,
                freeDeliveryAboveAmount: 1000,
            });
            await this.businessSettingsRepository.save(settings);
        }
        return settings;
    }
    async updateDeliverySettings(businessOwnerId, updateDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        let settings = await this.businessSettingsRepository.findOne({
            where: { businessOwnerId },
        });
        if (!settings) {
            settings = this.businessSettingsRepository.create({
                businessOwnerId,
                ...updateDto,
            });
        }
        else {
            Object.assign(settings, updateDto);
        }
        return await this.businessSettingsRepository.save(settings);
    }
    async calculateBusinessRating(businessOwnerId) {
        const result = await this.reviewRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'avgRating')
            .addSelect('COUNT(review.id)', 'reviewCount')
            .where('review.businessOwnerId = :businessOwnerId', { businessOwnerId })
            .andWhere('review.isApproved = :isApproved', { isApproved: true })
            .getRawOne();
        return {
            averageRating: result.avgRating ? parseFloat(parseFloat(result.avgRating).toFixed(1)) : null,
            reviewCount: parseInt(result.reviewCount) || 0,
        };
    }
    async getBusinessDocuments(userId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
            relations: ['documents'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const documents = businessOwner.documents || [];
        const hasAadhar = documents.some(doc => doc.documentType === business_document_enum_1.DocumentType.AADHAR);
        const hasPan = documents.some(doc => doc.documentType === business_document_enum_1.DocumentType.PAN);
        const docDtos = documents.map(doc => ({
            id: doc.id,
            businessOwnerId: doc.businessOwnerId,
            documentType: doc.documentType,
            documentUrl: doc.documentUrl,
            status: doc.status,
            rejectionReason: doc.rejectionReason,
            uploadedAt: doc.uploadedAt,
            verifiedAt: doc.verifiedAt,
        }));
        return {
            documents: docDtos,
            allRequiredUploaded: hasAadhar && hasPan,
        };
    }
    async uploadBusinessDocument(userId, documentType, file) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const uploadOptions = {
            folder: 'documents',
            prefix: `business_owner_${businessOwner.id}`,
            customFileName: documentType.toLowerCase().replace(/_/g, '-'),
            publicRead: true,
        };
        const result = await this.s3Service.uploadFile(file, uploadOptions);
        let document = await this.businessDocumentRepository.findOne({
            where: { businessOwnerId: businessOwner.id, documentType },
        });
        if (document) {
            document.documentUrl = result.url;
            document.status = business_document_enum_1.DocumentStatus.PENDING;
            document.rejectionReason = null;
            document.uploadedAt = new Date();
        }
        else {
            document = this.businessDocumentRepository.create({
                businessOwnerId: businessOwner.id,
                documentType,
                documentUrl: result.url,
                status: business_document_enum_1.DocumentStatus.PENDING,
            });
        }
        const savedDoc = await this.businessDocumentRepository.save(document);
        return {
            id: savedDoc.id,
            businessOwnerId: savedDoc.businessOwnerId,
            documentType: savedDoc.documentType,
            documentUrl: savedDoc.documentUrl,
            status: savedDoc.status,
            rejectionReason: savedDoc.rejectionReason,
            uploadedAt: savedDoc.uploadedAt,
            verifiedAt: savedDoc.verifiedAt,
        };
    }
    async getBusinessMediaById(userId, mediaId) {
        const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId, businessOwnerId: businessOwner.id },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        const responseData = {
            media: [media],
            count: 1,
        };
        return new dto_1.BusinessMediaListResponseDto(200, true, 'Business media retrieved successfully', responseData);
    }
    async updateBusinessMedia(userId, mediaId, updateData) {
        const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const media = await this.mediaRepository.findOne({
            where: { id: mediaId, businessOwnerId: businessOwner.id },
        });
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        if (updateData.displayOrder !== undefined) {
            media.displayOrder = updateData.displayOrder;
        }
        if (updateData.isActive !== undefined) {
            media.isActive = updateData.isActive;
        }
        const updatedMedia = await this.mediaRepository.save(media);
        const responseData = {
            media: [updatedMedia],
            count: 1,
        };
        return new dto_1.BusinessMediaListResponseDto(200, true, 'Business media updated successfully', responseData);
    }
};
exports.BusinessOwnerService = BusinessOwnerService;
exports.BusinessOwnerService = BusinessOwnerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwnerOnboarding)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.BusinessAddress)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.BusinessMedia)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.BusinessOperatingHours)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.BusinessService)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.ServicePackage)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.ServicePackageItem)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.Service)),
    __param(9, (0, typeorm_1.InjectRepository)(entities_2.ServiceCategory)),
    __param(10, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(11, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __param(12, (0, typeorm_1.InjectRepository)(entities_1.BankingInfo)),
    __param(13, (0, typeorm_1.InjectRepository)(entities_1.BusinessSettings)),
    __param(14, (0, typeorm_1.InjectRepository)(entities_1.Review)),
    __param(15, (0, typeorm_1.InjectRepository)(entities_1.BusinessDocument)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        approval_service_1.ApprovalService,
        s3_service_1.S3Service])
], BusinessOwnerService);
//# sourceMappingURL=business-owner.service.js.map
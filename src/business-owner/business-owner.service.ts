import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Express } from 'express';
import {
  BusinessOwner,
  BusinessOwnerOnboarding,
  BusinessAddress,
  BusinessMedia,
  BusinessOperatingHours,
  BusinessService,
  ServicePackage,
  ServicePackageItem,
  Service,
  User,
  Customer,
  UserAddress,
  BankingInfo,
  BusinessSettings,
  Review,
  BusinessDocument,
  BusinessApproval,
} from '../database/entities';
import {
  BusinessOwnerOnboardingStep1Dto,
  BusinessOwnerOnboardingStep2Dto,
  BusinessOwnerOnboardingStep3Dto,
  BusinessOwnerOnboardingStep4Dto,
  BusinessOwnerOnboardingStepResponseDto,
  BusinessOwnerOnboardingCompletionResponseDto,
  BusinessOwnerOnboardingStatusResponseDto,
  BusinessOwnerProfileResponseDto,
  BusinessOwnerProfileUpdateDto,
  BusinessInfoDto,
  BusinessInfoResponseDto,
  UpdateBusinessInfoDto,
  BusinessServiceDto,
  BusinessServicesResponseDto,
  UpdateBusinessServicesDto,
  BusinessMediaUploadResponseDto,
  BusinessMediaListResponseDto,
  BusinessMediaDeleteResponseDto,
  BusinessMediaUploadDataDto,
  BusinessMediaListDataDto,
  BusinessOwnerServicesGroupedByCategoryResponseDto,
  BusinessOwnerServicesGroupedByCategoryDataDto,
  BusinessOwnerCategoryWithServicesDto,
  BusinessOwnerServiceInCategoryDto,
  CreateServicePackageDto,
  UpdateServicePackageDto,
  ServicePackageResponseDto,
  ServicePackageListResponseDto,
  ServicePackageResponseWrapperDto,
  ServicePackageDeleteResponseDto,
  ServicePackageItemResponseDto,
  ServicePackageListDataDto,
  DeleteBusinessServicesDto,
  DeleteBusinessServicesResponseDto,
  DeleteBusinessServicesDataDto,
  DeletedBusinessServiceDto,
  UpdateDeliverySettingsDto,
  BusinessDocumentResponseDto,
  BusinessDocumentListResponseDto,
} from './dto';
import { MediaType, AddressType } from '../common/enums';
import { ApprovalStatus } from '../common/enums';
import { DocumentType, DocumentStatus } from '../common/enums/business-document.enum';
import { SubscriptionStatus } from '../common/enums/subscription-status.enum';
import { ServiceCategory } from '../database/entities';
import { generateShopId } from '../common/utils/shop-id.util';
import { ApprovalService } from '../approval/approval.service';
import { S3Service, UploadResult } from '../common/services/s3.service';

@Injectable()
export class BusinessOwnerService {
  constructor(
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(BusinessOwnerOnboarding)
    private onboardingRepository: Repository<BusinessOwnerOnboarding>,
    @InjectRepository(BusinessAddress)
    private addressRepository: Repository<BusinessAddress>,
    @InjectRepository(BusinessMedia)
    private mediaRepository: Repository<BusinessMedia>,
    @InjectRepository(BusinessOperatingHours)
    private businessOperatingHoursRepository: Repository<BusinessOperatingHours>,
    @InjectRepository(BusinessService)
    private businessServiceRepository: Repository<BusinessService>,
    @InjectRepository(ServicePackage)
    private servicePackageRepository: Repository<ServicePackage>,
    @InjectRepository(ServicePackageItem)
    private servicePackageItemRepository: Repository<ServicePackageItem>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private serviceCategoryRepository: Repository<ServiceCategory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(BankingInfo)
    private bankingInfoRepository: Repository<BankingInfo>,
    @InjectRepository(BusinessSettings)
    private businessSettingsRepository: Repository<BusinessSettings>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(BusinessDocument)
    private businessDocumentRepository: Repository<BusinessDocument>,
    @InjectRepository(BusinessApproval)
    private businessApprovalRepository: Repository<BusinessApproval>,
    private approvalService: ApprovalService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * Generate a unique shopId for a business owner
   * Retries up to 5 times if collision occurs
   */
  private async generateUniqueShopId(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const shopId = generateShopId();
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

  /**
   * Populate shopIds for existing business owners that don't have one
   * This is used during migration
   */
  async populateShopIds(): Promise<void> {
    const businessOwnersWithoutShopId = await this.businessOwnerRepository.find({
      where: { shopId: null }
    });

    for (const businessOwner of businessOwnersWithoutShopId) {
      businessOwner.shopId = await this.generateUniqueShopId();
      await this.businessOwnerRepository.save(businessOwner);
    }
  }

  async getBusinessOwnerProfile(userId: string): Promise<BusinessOwnerProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
      relations: ['addresses', 'onboarding', 'user', 'user.addresses'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner profile not found');
    }

    // Ensure shopId exists for existing records
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
        const homeAddress = businessOwner.user.addresses?.find(addr => addr.addressType === AddressType.HOME && addr.isActive);
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

    return new BusinessOwnerProfileResponseDto(200, true, 'Business owner profile retrieved successfully', profileData);
  }

  async updateBusinessOwnerProfile(
    userId: string,
    updateData: BusinessOwnerProfileUpdateDto,
  ): Promise<BusinessOwnerProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
      relations: ['addresses', 'onboarding', 'user'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner profile not found');
    }

    // Use updateData directly since profile picture fields are no longer in the DTO
    const businessOwnerUpdate = updateData;

    // Check for business name conflicts if business name is being updated
    if (businessOwnerUpdate.businessName && businessOwnerUpdate.businessName !== businessOwner.businessName) {
      const existingBusiness = await this.businessOwnerRepository.findOne({
        where: { businessName: businessOwnerUpdate.businessName },
      });
      if (existingBusiness && existingBusiness.id !== businessOwner.id) {
        throw new ConflictException('Business name already exists');
      }
    }


    // Update business owner fields (excluding profile picture fields)
    Object.keys(businessOwnerUpdate).forEach((key) => {
      if (businessOwnerUpdate[key] !== undefined) {
        if (key === 'dateOfBirth' && businessOwnerUpdate[key]) {
          // Convert string date to Date object
          businessOwner[key] = new Date(businessOwnerUpdate[key]);
        } else {
          businessOwner[key] = businessOwnerUpdate[key];
        }
      }
    });

    // Save the updated business owner
    await this.businessOwnerRepository.save(businessOwner);

    // Return the updated profile
    return this.getBusinessOwnerProfile(userId);
  }

  async completeOnboardingStep1(
    userId: string,
    step1Data: BusinessOwnerOnboardingStep1Dto,
  ): Promise<BusinessOwnerOnboardingStepResponseDto> {
    const businessOwner = await this.getBusinessOwnerWithOnboarding(userId);
    
    // Get current user data to check signup method and existing info
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has complete profile info (customer->business_owner scenario)
    const hasCompleteInfo = user.phone && user.email && 
                           businessOwner.firstName && businessOwner.lastName;

    if (hasCompleteInfo) {
      // Skip step 1, mark as completed and move to step 2
      if (!businessOwner.onboarding.completedSteps.includes(1)) {
        businessOwner.onboarding.completedSteps.push(1);
      }
      businessOwner.onboarding.currentStep = Math.max(businessOwner.onboarding.currentStep, 2);
      businessOwner.onboarding.step1Data = {
        skipped: true,
        reason: 'User already has complete profile information'
      };

      await this.onboardingRepository.save(businessOwner.onboarding);

      return new BusinessOwnerOnboardingStepResponseDto(
        200,
        true,
        'Step 1 skipped - user already has complete profile information',
        { nextStep: businessOwner.onboarding.currentStep, skipStep1: true }
      );
    }

    // Validate conditional requirements based on signup method
    const signedUpWithPhone = user.phone && user.isPhoneVerified;
    const signedUpWithEmail = user.email && user.isEmailVerified;

    if (signedUpWithPhone && !signedUpWithEmail) {
      if (step1Data.phone && step1Data.phone !== user.phone) {
        throw new BadRequestException('Cannot change phone number after signup');
      }
    } else if (signedUpWithEmail && !signedUpWithPhone) {
      if (!step1Data.phone) {
        throw new BadRequestException('Phone number is required for email signup users');
      }
      if (step1Data.email && step1Data.email !== user.email) {
        throw new BadRequestException('Cannot change email address after signup');
      }
    }

    if (!businessOwner.onboarding.completedSteps.includes(1)) {
      businessOwner.onboarding.completedSteps.push(1);
    }

    businessOwner.onboarding.step1Data = step1Data;
    businessOwner.onboarding.currentStep = Math.max(businessOwner.onboarding.currentStep, 2);

    // Update business owner basic info
    businessOwner.firstName = step1Data.firstName;
    businessOwner.lastName = step1Data.lastName;
    businessOwner.gender = step1Data.gender;
    if (step1Data.dateOfBirth) {
      businessOwner.dateOfBirth = new Date(step1Data.dateOfBirth);
    }

    // Update user phone/email only if they weren't set during signup
    if (!user.phone && step1Data.phone) {
      // Check if phone is already taken by another user
      const existingPhoneUser = await this.userRepository.findOne({
        where: { phone: step1Data.phone }
      });
      if (existingPhoneUser && existingPhoneUser.id !== userId) {
        throw new ConflictException('Phone number already exists');
      }
      await this.userRepository.update(userId, { phone: step1Data.phone });
    }
    if (!user.email && step1Data.email) {
      // Check if email is already taken by another user
      const existingEmailUser = await this.userRepository.findOne({
        where: { email: step1Data.email }
      });
      if (existingEmailUser && existingEmailUser.id !== userId) {
        throw new ConflictException('Email already exists');
      }
      await this.userRepository.update(userId, { email: step1Data.email });
    }

    await this.businessOwnerRepository.save(businessOwner);
    await this.onboardingRepository.save(businessOwner.onboarding);

    return new BusinessOwnerOnboardingStepResponseDto(
      200,
      true,
      'Step 1 completed successfully',
      { nextStep: businessOwner.onboarding.currentStep }
    );
  }

  async completeOnboardingStep2(
    userId: string,
    step2Data: BusinessOwnerOnboardingStep2Dto,
    files?: any[],
  ): Promise<BusinessOwnerOnboardingStepResponseDto> {
    const businessOwner = await this.getBusinessOwnerWithOnboarding(userId);
    
    // Check for duplicate business name
    const existingBusiness = await this.businessOwnerRepository.findOne({
      where: { businessName: step2Data.businessName },
    });
    
    if (existingBusiness && existingBusiness.id !== businessOwner.id) {
      throw new ConflictException('Business name already exists');
    }

    if (!businessOwner.onboarding.completedSteps.includes(2)) {
      businessOwner.onboarding.completedSteps.push(2);
    }

    businessOwner.onboarding.step2Data = step2Data;
    businessOwner.onboarding.currentStep = Math.max(businessOwner.onboarding.currentStep, 3);

    // Update business info
    businessOwner.businessName = step2Data.businessName;
    businessOwner.businessDescription = step2Data.businessDescription;

    // Create business address
    const address = this.addressRepository.create({
      businessOwnerId: businessOwner.id,
      addressType: AddressType.BUSINESS,
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

    // Upload business media files if provided
    if (files && files.length > 0) {
      const uploadOptions = {
        folder: 'portfolios',
        prefix: `business_owner_${businessOwner.id}`,
        publicRead: true,
      };

      const uploadResults: UploadResult[] = await this.s3Service.uploadFiles(files, uploadOptions);

      // Save media records to database
      await Promise.all(
        uploadResults.map(async (result, index) => {
          const media = this.mediaRepository.create({
            businessOwnerId: businessOwner.id,
            mediaType: this.s3Service.isVideo(result.mimeType) ? MediaType.VIDEO : MediaType.IMAGE,
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
        })
      );
    }

    await this.businessOwnerRepository.save(businessOwner);
    await this.onboardingRepository.save(businessOwner.onboarding);

    return new BusinessOwnerOnboardingStepResponseDto(
      200,
      true,
      'Step 2 completed successfully',
      { nextStep: businessOwner.onboarding.currentStep }
    );
  }

  async completeOnboardingStep3(
    userId: string,
    step3Data: BusinessOwnerOnboardingStep3Dto,
  ): Promise<BusinessOwnerOnboardingStepResponseDto> {
    const businessOwner = await this.getBusinessOwnerWithOnboarding(userId);

    // Validate that all provided service IDs exist and are active
    if (step3Data.servicesOffered && step3Data.servicesOffered.length > 0) {
      const serviceIds = step3Data.servicesOffered.map(service => service.serviceId);
      const existingServices = await this.serviceRepository.findBy({
        id: In(serviceIds),
        isActive: true,
      });

      if (existingServices.length !== serviceIds.length) {
        const foundServiceIds = existingServices.map(service => service.id);
        const invalidServiceIds = serviceIds.filter(id => !foundServiceIds.includes(id));
        throw new BadRequestException(`Invalid or inactive service IDs: ${invalidServiceIds.join(', ')}`);
      }

      // Remove existing business services and their dependencies safely
      await this.cleanupBusinessServicesWithDependencies(businessOwner.id);

      // Create new business service entries
      const businessServices = step3Data.servicesOffered.map(serviceOffering => ({
        businessOwnerId: businessOwner.id,
        serviceId: serviceOffering.serviceId,
        customPrice: serviceOffering.customPrice,
        customDurationMinutes: serviceOffering.customDurationMinutes,
        isActive: true,
      }));

      await this.businessServiceRepository.save(businessServices);
    }

    // Save business operating hours
    if (step3Data.businessHours && step3Data.businessHours.length > 0) {
      // Remove existing business hours for this business owner
      await this.businessOperatingHoursRepository.delete({ businessOwnerId: businessOwner.id });

      // Create new business operating hours entries
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

    return new BusinessOwnerOnboardingStepResponseDto(
      200,
      true,
      'Step 3 completed successfully',
      { nextStep: businessOwner.onboarding.currentStep }
    );
  }

  async completeOnboardingStep4(
    userId: string,
    step4Data: BusinessOwnerOnboardingStep4Dto,
  ): Promise<BusinessOwnerOnboardingCompletionResponseDto> {
    const businessOwner = await this.getBusinessOwnerWithOnboarding(userId);

    if (!businessOwner.onboarding.completedSteps.includes(4)) {
      businessOwner.onboarding.completedSteps.push(4);
    }

    businessOwner.onboarding.step4Data = step4Data;
    businessOwner.onboarding.isCompleted = true;
    businessOwner.operatingYears = step4Data.operatingYears;

    await this.businessOwnerRepository.save(businessOwner);
    await this.onboardingRepository.save(businessOwner.onboarding);

    // Save banking information
    try {
      // Check if banking info already exists
      let bankingInfo = await this.bankingInfoRepository.findOne({
        where: { businessOwnerId: businessOwner.id },
      });

      if (bankingInfo) {
        // Update existing banking info
        bankingInfo.accountNumber = step4Data.accountNumber;
        bankingInfo.accountHolderName = step4Data.accountHolderName;
        bankingInfo.ifscCode = step4Data.ifscCode;
        bankingInfo.bankName = step4Data.bankName;
        bankingInfo.branch = step4Data.branch;
        bankingInfo.isVerified = false; // Reset verification status on update
        bankingInfo.verifiedAt = null;
      } else {
        // Create new banking info
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
    } catch (error) {
      // Log error but don't fail the onboarding process
      console.error('Failed to save banking information:', error.message);
    }

    // Onboarding completion - user should now upload documents
    // No automatic approval request created - user needs to upload documents first

    return new BusinessOwnerOnboardingCompletionResponseDto(
      200,
      true,
      'Business owner onboarding completed successfully! Please upload your business documents to proceed with verification.',
      { completed: true }
    );
  }

  async getOnboardingStatus(userId: string): Promise<BusinessOwnerOnboardingStatusResponseDto> {
    const businessOwner = await this.getBusinessOwnerWithOnboarding(userId);

    // Get user data for phone/email information
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If step1Data is empty but business owner or user has profile data, populate it
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

    // Get business media for step2
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
          media: businessMedia, // Add business media to step2
        },
        step3: businessOwner.onboarding.step3Data || {},
        step4: businessOwner.onboarding.step4Data || {},
      },
    };

    return new BusinessOwnerOnboardingStatusResponseDto(200, true, 'Business owner onboarding status retrieved successfully', statusData);
  }

  private async getBusinessOwnerWithOnboarding(userId: string): Promise<BusinessOwner> {
    let businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
      relations: ['onboarding'],
    });

    let needsCustomerDataCopy = false;

    if (!businessOwner) {
      // Create business owner profile if it doesn't exist
      const uniqueShopId = await this.generateUniqueShopId();
      businessOwner = this.businessOwnerRepository.create({
        userId,
        shopId: uniqueShopId
      });
      needsCustomerDataCopy = true;
    } else if (!businessOwner.firstName || !businessOwner.lastName) {
      // Business owner exists but personal fields are empty
      needsCustomerDataCopy = true;
    }

    // Copy customer data if needed
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

    // Save business owner first to get the ID (if newly created or modified)
    if (!businessOwner.id || customerDataCopied) {
      businessOwner = await this.businessOwnerRepository.save(businessOwner);
    }

    if (!businessOwner.onboarding) {
      // Create onboarding record if it doesn't exist
      const onboarding = this.onboardingRepository.create({
        businessOwnerId: businessOwner.id,
        currentStep: customerDataCopied ? 2 : 1, // Start at step 2 if customer data was copied
        completedSteps: customerDataCopied ? [1] : [], // Mark step 1 as completed if data was copied
      });
      businessOwner.onboarding = await this.onboardingRepository.save(onboarding);
    }

    // For existing business owners, check if step1 should be completed
    if (businessOwner.onboarding && !businessOwner.onboarding.completedSteps.includes(1)) {
      // Check if business owner has complete personal data (either copied or already existing)
      const hasCompletePersonalData = businessOwner.firstName && businessOwner.lastName;

      if (hasCompletePersonalData) {
        // Mark step 1 as completed
        businessOwner.onboarding.completedSteps.push(1);
        businessOwner.onboarding.currentStep = Math.max(businessOwner.onboarding.currentStep, 2);

        // Save step1 data in onboarding record if not already saved
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



  /**
   * Upload profile picture for business owner
   */
  async uploadProfilePicture(userId: string, file: any): Promise<{ profilePic: string; profilePicCdnUrl: string; profilePicS3Key: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old profile picture if it exists
    if (user.profilePicS3Key) {
      try {
        await this.s3Service.deleteFile(user.profilePicS3Key);
      } catch (error) {
        // Log error but don't fail the upload
        console.error('Failed to delete old profile picture:', error);
      }
    }

    // Upload new profile picture
    const uploadOptions = {
      folder: 'profiles',
      prefix: `business_owner_${userId}`,
      customFileName: 'profile',
      publicRead: true,
    };

    const result: UploadResult = await this.s3Service.uploadFile(file, uploadOptions);

    // Update user with new profile picture URLs
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

  /**
   * Delete profile picture for business owner
   */
  async deleteProfilePicture(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profilePicS3Key) {
      throw new BadRequestException('No profile picture to delete');
    }

    // Delete from S3
    await this.s3Service.deleteFile(user.profilePicS3Key);

    // Update user record
    await this.userRepository.update(userId, {
      profilePic: null,
      profilePicCdnUrl: null,
      profilePicS3Key: null,
    });
  }

  /**
   * Upload business media (images/videos for portfolio)
   */
  async uploadBusinessMedia(
    userId: string,
    files: any[],
    mediaType: MediaType = MediaType.IMAGE
  ): Promise<BusinessMediaUploadResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Upload files to S3
    const uploadOptions = {
      folder: 'portfolios',
      prefix: `business_owner_${businessOwner.id}`,
      publicRead: true,
    };

    const uploadResults: UploadResult[] = await this.s3Service.uploadFiles(files, uploadOptions);
    
    // Save media records to database
    const mediaRecords = await Promise.all(
      uploadResults.map(async (result, index) => {
        const media = this.mediaRepository.create({
          businessOwnerId: businessOwner.id,
          mediaType: this.s3Service.isVideo(result.mimeType) ? MediaType.VIDEO : MediaType.IMAGE,
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
      })
    );

    const mediaData = mediaRecords.map(media => ({
      mediaId: media.id,
      mediaUrl: media.mediaUrl,
      cdnUrl: media.cdnUrl,
      s3Key: media.s3Key,
    }));

    const responseData: BusinessMediaUploadDataDto = {
      media: mediaData,
      count: mediaData.length,
    };

    return new BusinessMediaUploadResponseDto(
      201,
      true,
      'Business media uploaded successfully',
      responseData
    );
  }

  /**
   * Delete business media
   */
  async deleteBusinessMedia(userId: string, mediaId: string): Promise<BusinessMediaDeleteResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, businessOwnerId: businessOwner.id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete from S3
    if (media.s3Key) {
      await this.s3Service.deleteFile(media.s3Key);
    }

    // Delete from database
    await this.mediaRepository.remove(media);

    return new BusinessMediaDeleteResponseDto(
      200,
      true,
      'Business media deleted successfully'
    );
  }

  /**
   * Get raw business media data (internal use)
   */
  private async getBusinessMediaRaw(userId: string): Promise<any[]> {
    const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
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

  /**
   * Get business media for business owner (API endpoint)
   */
  async getBusinessMedia(userId: string): Promise<BusinessMediaListResponseDto> {
    const mediaData = await this.getBusinessMediaRaw(userId);

    const responseData: BusinessMediaListDataDto = {
      media: mediaData,
      count: mediaData.length,
    };

    return new BusinessMediaListResponseDto(
      200,
      true,
      'Business media retrieved successfully',
      responseData
    );
  }

  /**
   * Get business information for business owner
   */
  async getBusinessInfo(userId: string): Promise<BusinessInfoResponseDto> {
    let businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
      relations: ['addresses'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Ensure shopId exists for existing records
    if (!businessOwner.shopId) {
      businessOwner.shopId = await this.generateUniqueShopId();
      businessOwner = await this.businessOwnerRepository.save(businessOwner);
    }

    // Get business media
    const businessMedia = await this.getBusinessMediaRaw(userId);

    const businessInfo: BusinessInfoDto = {
      id: businessOwner.id,
      userId: businessOwner.userId,
      shopId: businessOwner.shopId,
      businessName: businessOwner.businessName,
      businessDescription: businessOwner.businessDescription,
      operatingYears: businessOwner.operatingYears,
      isApproved: businessOwner.isApproved,
      approvedAt: businessOwner.approvedAt,
      address: (() => {
        const businessAddress = businessOwner.addresses?.find(addr => addr.addressType === AddressType.BUSINESS && addr.isActive);
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

    return new BusinessInfoResponseDto(
      200,
      true,
      'Business information retrieved successfully',
      businessInfo
    );
  }

  /**
   * Update business information for business owner
   */
  async updateBusinessInfo(
    userId: string,
    updateData: UpdateBusinessInfoDto,
  ): Promise<BusinessInfoResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Check for business name conflicts if business name is being updated
    if (updateData.businessName && updateData.businessName !== businessOwner.businessName) {
      const existingBusiness = await this.businessOwnerRepository.findOne({
        where: { businessName: updateData.businessName },
      });
      if (existingBusiness && existingBusiness.id !== businessOwner.id) {
        throw new ConflictException('Business name already exists');
      }
    }

    // Update business owner fields
    if (updateData.businessName !== undefined) {
      businessOwner.businessName = updateData.businessName;
    }
    if (updateData.businessDescription !== undefined) {
      businessOwner.businessDescription = updateData.businessDescription;
    }
    if (updateData.operatingYears !== undefined) {
      businessOwner.operatingYears = updateData.operatingYears;
    }

    // Save the updated business owner
    await this.businessOwnerRepository.save(businessOwner);

    // Return the updated business info
    return this.getBusinessInfo(userId);
  }

  /**
   * Get business services for business owner
   */
  async getBusinessServices(userId: string): Promise<BusinessServicesResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
      relations: ['businessServices', 'businessServices.service', 'businessServices.service.category'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const services: BusinessServiceDto[] = businessOwner.businessServices?.map(bs => ({
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

    return new BusinessServicesResponseDto(
      200,
      true,
      'Business services retrieved successfully',
      services
    );
  }

  /**
   * Update business services for business owner
   */
  async updateBusinessServices(
    userId: string,
    updateData: UpdateBusinessServicesDto,
  ): Promise<BusinessServicesResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Validate that all provided service IDs exist and are active
    const serviceIds = updateData.services.map(s => s.serviceId);
    const existingServices = await this.serviceRepository.findBy({
      id: In(serviceIds),
      isActive: true,
    });

    if (existingServices.length !== serviceIds.length) {
      const foundServiceIds = existingServices.map(service => service.id);
      const invalidServiceIds = serviceIds.filter(id => !foundServiceIds.includes(id));
      throw new BadRequestException(`Invalid or inactive service IDs: ${invalidServiceIds.join(', ')}`);
    }

    // Update business services
    for (const serviceUpdate of updateData.services) {
      // Find existing business service
      let businessService = await this.businessServiceRepository.findOne({
        where: {
          businessOwnerId: businessOwner.id,
          serviceId: serviceUpdate.serviceId
        },
      });

      if (!businessService) {
        // Create new business service if it doesn't exist
        businessService = this.businessServiceRepository.create({
          businessOwnerId: businessOwner.id,
          serviceId: serviceUpdate.serviceId,
          customPrice: serviceUpdate.customPrice,
          customDurationMinutes: serviceUpdate.customDurationMinutes,
          isActive: serviceUpdate.isActive !== undefined ? serviceUpdate.isActive : true,
        });
      } else {
        // Update existing business service
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

    // Return updated services
    return this.getBusinessServices(userId);
  }

  /**
   * Delete business services permanently (hard delete)
   */
  async deleteBusinessServices(
    userId: string,
    deleteData: DeleteBusinessServicesDto,
  ): Promise<DeleteBusinessServicesResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const { businessServiceIds } = deleteData;
    const deleted: string[] = [];
    const failed: DeletedBusinessServiceDto[] = [];

    // Process each business service ID
    for (const businessServiceId of businessServiceIds) {
      try {
        // Check if business service exists and belongs to this business owner
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

        // Check if this business service is used in any active service packages
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

        // Delete package items first (if any) - cascade cleanup
        await this.servicePackageItemRepository.delete({
          businessServiceId: businessServiceId,
        });

        // Hard delete the business service
        await this.businessServiceRepository.remove(businessService);

        deleted.push(businessServiceId);
      } catch (error) {
        failed.push({
          id: businessServiceId,
          reason: 'Failed to delete due to unexpected error',
        });
      }
    }

    const responseData: DeleteBusinessServicesDataDto = {
      deleted,
      failed,
      total: deleted.length,
    };

    const message = failed.length > 0
      ? `${deleted.length} services deleted, ${failed.length} failed`
      : 'Business services deleted successfully';

    const success = failed.length === 0;
    const code = failed.length > 0 ? 207 : 200; // 207 Multi-Status for partial success

    return new DeleteBusinessServicesResponseDto(code, success, message, responseData);
  }

  /**
   * Get business services grouped by category for business owner
   */
  async getBusinessServicesGroupedByCategory(
    userId: string,
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
  ): Promise<BusinessOwnerServicesGroupedByCategoryResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const skip = (page - 1) * limit;

    // Get all active categories that have services offered by this business owner
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

    // Get business services for each category
    const categoriesWithServices: BusinessOwnerCategoryWithServicesDto[] = [];

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

      // Only include categories that have business services
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

    // Apply pagination to categories
    const total = categoriesWithServices.length;
    const paginatedCategories = categoriesWithServices.slice(skip, skip + limit);

    const responseData: BusinessOwnerServicesGroupedByCategoryDataDto = {
      categories: paginatedCategories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return new BusinessOwnerServicesGroupedByCategoryResponseDto(
      200,
      true,
      'Business services grouped by categories retrieved successfully',
      responseData
    );
  }

  /**
   * Map BusinessService to BusinessOwnerServiceInCategoryDto
   */
  private mapToBusinessOwnerServiceInCategoryDto(businessService: BusinessService): BusinessOwnerServiceInCategoryDto {
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

  /**
   * Create a new service package
   */
  async createServicePackage(
    userId: string,
    createDto: CreateServicePackageDto,
  ): Promise<ServicePackageResponseWrapperDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Validate that all business service IDs belong to this business owner
    const businessServiceIds = createDto.services.map(s => s.businessServiceId);
    const businessServices = await this.businessServiceRepository.find({
      where: {
        id: In(businessServiceIds),
        businessOwnerId: businessOwner.id,
        isActive: true,
      },
      relations: ['service', 'service.category'],
    });

    if (businessServices.length !== businessServiceIds.length) {
      const foundIds = businessServices.map(bs => bs.id);
      const invalidIds = businessServiceIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Invalid business service IDs: ${invalidIds.join(', ')}`);
    }

    // Create service package
    const servicePackage = this.servicePackageRepository.create({
      businessOwnerId: businessOwner.id,
      name: createDto.name,
      description: createDto.description,
      discountPercentage: createDto.discountPercentage,
    });

    const savedPackage = await this.servicePackageRepository.save(servicePackage);

    // Create package items
    const packageItems = createDto.services.map(serviceDto =>
      this.servicePackageItemRepository.create({
        packageId: savedPackage.id,
        businessServiceId: serviceDto.businessServiceId,
      })
    );

    await this.servicePackageItemRepository.save(packageItems);

    // Return the created package with all details
    const createdPackage = await this.getServicePackageById(userId, savedPackage.id);

    return new ServicePackageResponseWrapperDto(
      201,
      true,
      'Service package created successfully',
      createdPackage
    );
  }

  /**
   * Get all service packages for business owner
   */
  async getServicePackages(
    userId: string,
    page: number = 1,
    limit: number = 10,
    isActive?: boolean,
  ): Promise<ServicePackageListResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
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

    const responseData: ServicePackageListDataDto = {
      packages: packageData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return new ServicePackageListResponseDto(
      200,
      true,
      'Service packages retrieved successfully',
      responseData
    );
  }

  /**
   * Get a single service package by ID
   */
  async getServicePackageById(userId: string, packageId: string): Promise<ServicePackageResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
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
      throw new NotFoundException('Service package not found');
    }

    return this.mapToServicePackageResponseDto(servicePackage);
  }

  /**
   * Update a service package
   */
  async updateServicePackage(
    userId: string,
    packageId: string,
    updateDto: UpdateServicePackageDto,
  ): Promise<ServicePackageResponseWrapperDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const servicePackage = await this.servicePackageRepository.findOne({
      where: { id: packageId, businessOwnerId: businessOwner.id },
    });

    if (!servicePackage) {
      throw new NotFoundException('Service package not found');
    }

    // Update package basic info
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

    // Update services if provided
    if (updateDto.services) {
      // Validate business service IDs
      const businessServiceIds = updateDto.services.map(s => s.businessServiceId);
      const businessServices = await this.businessServiceRepository.find({
        where: {
          id: In(businessServiceIds),
          businessOwnerId: businessOwner.id,
          isActive: true,
        },
      });

      if (businessServices.length !== businessServiceIds.length) {
        const foundIds = businessServices.map(bs => bs.id);
        const invalidIds = businessServiceIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(`Invalid business service IDs: ${invalidIds.join(', ')}`);
      }

      // Remove existing package items
      await this.servicePackageItemRepository.delete({ packageId });

      // Create new package items
      const packageItems = updateDto.services.map(serviceDto =>
        this.servicePackageItemRepository.create({
          packageId,
          businessServiceId: serviceDto.businessServiceId,
        })
      );

      await this.servicePackageItemRepository.save(packageItems);
    }

    // Return updated package
    const updatedPackage = await this.getServicePackageById(userId, packageId);

    return new ServicePackageResponseWrapperDto(
      200,
      true,
      'Service package updated successfully',
      updatedPackage
    );
  }

  /**
   * Delete a service package (soft delete)
   */
  async deleteServicePackage(
    userId: string,
    packageId: string,
  ): Promise<ServicePackageDeleteResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const servicePackage = await this.servicePackageRepository.findOne({
      where: { id: packageId, businessOwnerId: businessOwner.id },
    });

    if (!servicePackage) {
      throw new NotFoundException('Service package not found');
    }

    // Soft delete by setting isActive to false
    servicePackage.isActive = false;
    await this.servicePackageRepository.save(servicePackage);

    return new ServicePackageDeleteResponseDto(
      200,
      true,
      'Service package deleted successfully'
    );
  }

  /**
   * Toggle service package active status
   */
  async toggleServicePackageActive(
    userId: string,
    packageId: string,
  ): Promise<ServicePackageResponseWrapperDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const servicePackage = await this.servicePackageRepository.findOne({
      where: { id: packageId, businessOwnerId: businessOwner.id },
    });

    if (!servicePackage) {
      throw new NotFoundException('Service package not found');
    }

    servicePackage.isActive = !servicePackage.isActive;
    await this.servicePackageRepository.save(servicePackage);

    const updatedPackage = await this.getServicePackageById(userId, packageId);

    return new ServicePackageResponseWrapperDto(
      200,
      true,
      `Service package ${servicePackage.isActive ? 'activated' : 'deactivated'} successfully`,
      updatedPackage
    );
  }


  /**
   * Map ServicePackage entity to ServicePackageResponseDto
   */
  private mapToServicePackageResponseDto(servicePackage: ServicePackage): ServicePackageResponseDto {
    const packageItems = servicePackage.packageItems || [];

    // Calculate pricing
    let totalOriginalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalDurationMinutes = 0;

    const services: ServicePackageItemResponseDto[] = packageItems.map(item => {
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
        finalPrice: 0, // Will be calculated after package discount is applied
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    // Apply package discount to the total original price
    const discountPercent = Number(servicePackage.discountPercentage) || 0;
    const packageDiscountAmount = (totalOriginalPrice * discountPercent) / 100;
    totalDiscountedPrice = totalOriginalPrice - packageDiscountAmount;

    const totalSavings = totalOriginalPrice - totalDiscountedPrice;

    // Calculate final price per service (proportional discount)
    services.forEach(service => {
      if (totalOriginalPrice > 0) {
        const serviceDiscountAmount = (service.customPrice * discountPercent) / 100;
        service.finalPrice = service.customPrice - serviceDiscountAmount;
      } else {
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

  /**
   * Safely cleanup business services with their dependencies
   * Handles service packages and their items before deleting business services
   */
  private async cleanupBusinessServicesWithDependencies(businessOwnerId: string): Promise<void> {
    // Start a transaction-like cleanup process
    try {
      // Step 1: Find all business services for this business owner
      const businessServices = await this.businessServiceRepository.find({
        where: { businessOwnerId },
        select: ['id'],
      });

      if (businessServices.length === 0) {
        return; // Nothing to cleanup
      }

      const businessServiceIds = businessServices.map(service => service.id);

      // Step 2: Find service package items that reference these business services
      const servicePackageItems = await this.servicePackageItemRepository.find({
        where: { businessServiceId: In(businessServiceIds) },
        relations: ['servicePackage'],
      });

      // Step 3: Delete service package items first
      if (servicePackageItems.length > 0) {
        await this.servicePackageItemRepository.remove(servicePackageItems);
      }

      // Step 4: Find and handle empty service packages
      const affectedPackageIds = [...new Set(servicePackageItems.map(item => item.servicePackage.id))];

      for (const packageId of affectedPackageIds) {
        // Check if package still has any items left
        const remainingItems = await this.servicePackageItemRepository.count({
          where: { packageId },
        });

        // If no items left, delete the package
        if (remainingItems === 0) {
          await this.servicePackageRepository.delete({ id: packageId });
        }
      }

      // Step 5: Finally, delete the business services safely
      await this.businessServiceRepository.delete({ businessOwnerId });

    } catch (error) {
      // Log the error and re-throw for proper error handling
      console.error('Error during business services cleanup:', error);
      throw new BadRequestException('Failed to cleanup existing services. Please try again.');
    }
  }

  /**
   * Get delivery settings for a business owner
   */
  async getDeliverySettings(businessOwnerId: string): Promise<BusinessSettings> {
    // Verify business owner exists
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Get or create settings
    let settings = await this.businessSettingsRepository.findOne({
      where: { businessOwnerId },
    });

    // If settings don't exist, create with defaults
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

  /**
   * Update delivery settings for a business owner
   */
  async updateDeliverySettings(
    businessOwnerId: string,
    updateDto: UpdateDeliverySettingsDto,
  ): Promise<BusinessSettings> {
    // Verify business owner exists
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Get or create settings
    let settings = await this.businessSettingsRepository.findOne({
      where: { businessOwnerId },
    });

    if (!settings) {
      // Create new settings with provided values
      settings = this.businessSettingsRepository.create({
        businessOwnerId,
        ...updateDto,
      });
    } else {
      // Update existing settings
      Object.assign(settings, updateDto);
    }

    // Save and return
    return await this.businessSettingsRepository.save(settings);
  }

  /**
   * Calculate average rating and review count for a business
   * Only counts approved reviews
   */
  private async calculateBusinessRating(businessOwnerId: string): Promise<{ averageRating: number | null; reviewCount: number }> {
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

  /**
   * Get all documents for a business owner
   */
  async getBusinessDocuments(userId: string): Promise<BusinessDocumentListResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
      relations: ['documents'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const documents = businessOwner.documents || [];

    // Check if mandatory documents (Aadhar and PAN) are uploaded
    const hasAadhar = documents.some(doc => doc.documentType === DocumentType.AADHAR);
    const hasPan = documents.some(doc => doc.documentType === DocumentType.PAN);

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

  /**
   * Upload a business document for approval
   */
  async uploadBusinessDocumentForApproval(
    userId: string,
    file: Express.Multer.File,
    documentType?: string,
  ): Promise<BusinessDocumentResponseDto> {
    console.log('Service received file:', file);
    console.log('File details:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      buffer: file?.buffer ? 'Buffer present' : 'No buffer'
    });
    
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Upload to S3
    const uploadOptions = {
      folder: 'documents',
      prefix: `business_owner_${businessOwner.id}`,
      customFileName: `document_${Date.now()}`,
      publicRead: true,
    };

    const result: UploadResult = await this.s3Service.uploadFile(file, uploadOptions);

    // Determine document type - use provided type first, then fallback to filename detection
    let docType = DocumentType.OTHER;
    
    if (documentType) {
      // Map string to DocumentType enum
      const normalizedType = documentType.toLowerCase().replace(/[-\s]/g, '_');
      switch (normalizedType) {
        case 'aadhar':
        case 'aadhaar':
          docType = DocumentType.AADHAR;
          break;
        case 'pan':
          docType = DocumentType.PAN;
          break;
        case 'gst':
        case 'gst_certificate':
          docType = DocumentType.GST_CERTIFICATE;
          break;
        case 'udyam':
        case 'udyam_aadhaar':
          docType = DocumentType.UDYAM_AADHAAR;
          break;
        case 'shop':
        case 'trade':
        case 'trade_license':
          docType = DocumentType.TRADE_LICENSE;
          break;
        case 'shop_act':
          docType = DocumentType.SHOP_ACT;
          break;
        case 'fssai':
        case 'fssai_license':
          docType = DocumentType.FSSAI_LICENSE;
          break;
        case 'msme':
        case 'udyam':
        case 'msme_registration':
          docType = DocumentType.MSME_REGISTRATION;
          break;
        case 'bank':
        case 'statement':
        case 'bank_statement':
          docType = DocumentType.BANK_STATEMENT;
          break;
        case 'cheque':
        case 'cancelled_cheque':
          docType = DocumentType.CANCELLED_CHEQUE;
          break;
        case 'electricity':
        case 'bill':
        case 'electricity_bill':
          docType = DocumentType.ELECTRICITY_BILL;
          break;
        case 'rent':
        case 'agreement':
        case 'rent_agreement':
          docType = DocumentType.RENT_AGREEMENT;
          break;
        case 'photograph':
        case 'photo':
          docType = DocumentType.PHOTOGRAPH;
          break;
        case 'passport_photo':
          docType = DocumentType.PASSPORT_PHOTO;
          break;
        case 'business_license':
          docType = DocumentType.BUSINESS_LICENSE;
          break;
        case 'signature':
          docType = DocumentType.SIGNATURE;
          break;
        case 'id':
        case 'proof':
        case 'id_proof':
          docType = DocumentType.ID_PROOF;
          break;
        case 'address':
        case 'address_proof':
          docType = DocumentType.ADDRESS_PROOF;
          break;
        default:
          docType = DocumentType.OTHER;
      }
    } else {
      // Fallback to filename detection
      const fileName = file.originalname.toLowerCase();
      if (fileName.includes('aadhar') || fileName.includes('aadhaar')) {
        docType = DocumentType.AADHAR;
      } else if (fileName.includes('pan')) {
        docType = DocumentType.PAN;
      } else if (fileName.includes('gst')) {
        docType = DocumentType.GST_CERTIFICATE;
      } else if (fileName.includes('shop') || fileName.includes('trade')) {
        docType = DocumentType.TRADE_LICENSE;
      } else if (fileName.includes('fssai')) {
        docType = DocumentType.FSSAI_LICENSE;
      } else if (fileName.includes('msme') || fileName.includes('udyam')) {
        docType = DocumentType.MSME_REGISTRATION;
      } else if (fileName.includes('bank') || fileName.includes('statement')) {
        docType = DocumentType.BANK_STATEMENT;
      } else if (fileName.includes('cheque')) {
        docType = DocumentType.CANCELLED_CHEQUE;
      } else if (fileName.includes('electricity') || fileName.includes('bill')) {
        docType = DocumentType.ELECTRICITY_BILL;
      } else if (fileName.includes('rent') || fileName.includes('agreement')) {
        docType = DocumentType.RENT_AGREEMENT;
      } else if (fileName.includes('photo') || fileName.includes('shop')) {
        docType = DocumentType.SHOP_PHOTO;
      } else if (fileName.includes('signature')) {
        docType = DocumentType.SIGNATURE;
      } else if (fileName.includes('id') || fileName.includes('proof')) {
        docType = DocumentType.ID_PROOF;
      } else if (fileName.includes('address')) {
        docType = DocumentType.ADDRESS_PROOF;
      }
    }

    console.log('Provided documentType:', documentType);
    console.log('Detected docType:', docType);

    // Check if document of this type already exists
    let document = await this.businessDocumentRepository.findOne({
      where: { businessOwnerId: businessOwner.id, documentType: docType },
    });

    if (document) {
      document.documentUrl = result.url;
      document.status = DocumentStatus.PENDING;
      document.rejectionReason = null;
      document.uploadedAt = new Date();
    } else {
      document = this.businessDocumentRepository.create({
        businessOwnerId: businessOwner.id,
        documentType: docType,
        documentUrl: result.url,
        status: DocumentStatus.PENDING,
      });
    }

    const savedDoc = await this.businessDocumentRepository.save(document);

    // Check if business approval exists, create if not
    let approval = await this.businessApprovalRepository.findOne({
      where: { businessOwnerId: businessOwner.id },
    });

    if (!approval) {
      // Create business approval record
      approval = this.businessApprovalRepository.create({
        businessOwnerId: businessOwner.id,
        assignedAgentId: 'default-agent', // You might want to implement agent assignment logic
        status: ApprovalStatus.PENDING,
        isAutoAssigned: true,
      });
      await this.businessApprovalRepository.save(approval);
    }

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

  /**
   * Upload a business document
   */
  async uploadBusinessDocument(
    userId: string,
    documentType: DocumentType,
    file: Express.Multer.File,
  ): Promise<BusinessDocumentResponseDto> {
    console.log('Service received file:', file);
    console.log('File details:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      buffer: file?.buffer ? 'Buffer present' : 'No buffer'
    });
    
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Upload to S3
    const uploadOptions = {
      folder: 'documents',
      prefix: `business_owner_${businessOwner.id}`,
      customFileName: documentType.toLowerCase().replace(/_/g, '-'),
      publicRead: true,
    };

    const result: UploadResult = await this.s3Service.uploadFile(file, uploadOptions);

    // Check if document of this type already exists
    let document = await this.businessDocumentRepository.findOne({
      where: { businessOwnerId: businessOwner.id, documentType },
    });

    if (document) {
      document.documentUrl = result.url;
      document.status = DocumentStatus.PENDING;
      document.rejectionReason = null;
      document.uploadedAt = new Date();
    } else {
      document = this.businessDocumentRepository.create({
        businessOwnerId: businessOwner.id,
        documentType,
        documentUrl: result.url,
        status: DocumentStatus.PENDING,
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

  /**
   * Get business media by ID
   */
  async getBusinessMediaById(userId: string, mediaId: string): Promise<BusinessMediaListResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, businessOwnerId: businessOwner.id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    const responseData: BusinessMediaListDataDto = {
      media: [media],
      count: 1,
    };

    return new BusinessMediaListResponseDto(200, true, 'Business media retrieved successfully', responseData);
  }

  /**
   * Update business media
   */
  async updateBusinessMedia(userId: string, mediaId: string, updateData: any): Promise<BusinessMediaListResponseDto> {
    const businessOwner = await this.businessOwnerRepository.findOne({ where: { userId } });
    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, businessOwnerId: businessOwner.id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Update media fields
    if (updateData.displayOrder !== undefined) {
      media.displayOrder = updateData.displayOrder;
    }
    if (updateData.isActive !== undefined) {
      media.isActive = updateData.isActive;
    }

    const updatedMedia = await this.mediaRepository.save(media);

    const responseData: BusinessMediaListDataDto = {
      media: [updatedMedia],
      count: 1,
    };

    return new BusinessMediaListResponseDto(200, true, 'Business media updated successfully', responseData);
  }

  /**
   * Check if all required documents are uploaded and create approval request
   */
  async checkDocumentsAndCreateApprovalRequest(userId: string): Promise<any> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
      relations: ['documents'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Check if onboarding is completed
    if (!businessOwner.onboarding?.isCompleted) {
      throw new BadRequestException('Please complete onboarding first');
    }

    // Check if all required documents are uploaded
    const requiredDocuments = [DocumentType.PAN, DocumentType.AADHAR, DocumentType.BUSINESS_LICENSE];
    const uploadedDocuments = businessOwner.documents || [];
    
    const uploadedTypes = uploadedDocuments.map(doc => doc.documentType);
    const missingDocuments = requiredDocuments.filter(type => !uploadedTypes.includes(type));

    if (missingDocuments.length > 0) {
      throw new BadRequestException(`Please upload all required documents: ${missingDocuments.join(', ')}`);
    }

    // Check if approval request already exists
    const existingApproval = await this.businessApprovalRepository.findOne({
      where: { businessOwnerId: businessOwner.id },
    });

    if (existingApproval) {
      throw new BadRequestException('Approval request already exists');
    }

    // Create approval request
    try {
      await this.approvalService.createApprovalRequest(businessOwner.id);
      return {
        success: true,
        message: 'Approval request created successfully. Your business is now under review.',
      };
    } catch (error) {
      console.error('Failed to create approval request:', error.message);
      throw new BadRequestException('Failed to create approval request');
    }
  }

  /**
   * Get business flow status - shows current step in the process
   */
  async getBusinessFlowStatus(userId: string): Promise<any> {
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
      relations: ['documents', 'businessSubscription'],
    });

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    // Check onboarding status
    const isOnboardingCompleted = businessOwner.onboarding?.isCompleted || false;

    // Check documents status
    const requiredDocuments = [DocumentType.PAN, DocumentType.AADHAR, DocumentType.BUSINESS_LICENSE];
    const uploadedDocuments = businessOwner.documents || [];
    const uploadedTypes = uploadedDocuments.map(doc => doc.documentType);
    const allDocumentsUploaded = requiredDocuments.every(type => uploadedTypes.includes(type));

    // Check approval status
    const approval = await this.businessApprovalRepository.findOne({
      where: { businessOwnerId: businessOwner.id },
    });

    const isApproved = businessOwner.isApproved || false;

    // Check subscription status
    const businessSubscriptions = businessOwner.businessSubscriptions || [];
    const activeSubscription = businessSubscriptions.find(sub => sub.status === SubscriptionStatus.ACTIVE);
    const hasSubscription = !!activeSubscription;

    // Determine current step
    let currentStep = 'onboarding';
    let nextStep = 'complete_onboarding';
    
    if (isOnboardingCompleted) {
      currentStep = 'documents';
      nextStep = allDocumentsUploaded ? 'create_approval' : 'upload_documents';
    }
    
    if (isOnboardingCompleted && allDocumentsUploaded) {
      currentStep = 'approval';
      nextStep = isApproved ? 'subscribe' : 'wait_for_approval';
    }
    
    if (isOnboardingCompleted && allDocumentsUploaded && isApproved) {
      currentStep = 'subscription';
      nextStep = hasSubscription ? 'dashboard' : 'subscribe';
    }
    
    if (isOnboardingCompleted && allDocumentsUploaded && isApproved && hasSubscription) {
      currentStep = 'dashboard';
      nextStep = null;
    }

    return {
      currentStep,
      nextStep,
      isOnboardingCompleted,
      allDocumentsUploaded,
      isApproved,
      hasSubscription,
      approvalStatus: approval?.status,
      canAccessDashboard: isOnboardingCompleted && allDocumentsUploaded && isApproved && hasSubscription,
    };
  }
}

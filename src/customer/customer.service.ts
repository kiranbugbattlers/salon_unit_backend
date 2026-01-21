import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Customer,
  CustomerOnboarding,
  User,
  UserAddress,
  CustomerFavorite,
  BusinessOwner,
  BusinessAddress,
  BusinessMedia,
} from '../database/entities';
import { S3Service, UploadResult } from '../common/services/s3.service';
import {
  OnboardingStep1Dto,
  OnboardingStep2Dto,
  OnboardingStep3Dto,
  OnboardingStep4Dto,
  CustomerProfileDto,
  OnboardingStepResponseDto,
  OnboardingCompletionResponseDto,
  OnboardingStatusResponseDto,
  CustomerProfileResponseDto,
  UpdateCustomerProfileDto,
  UpdateProfileResponseDto,
  FavoritesResponseDto,
  FavoritesDataDto,
  FavoriteBusinessItemDto,
  FavoritesMetaDto,
  FavoritesPaginationDto,
  FavoriteActionResponseDto,
} from './dto';
import { BusinessAddressDto, BusinessMediaDto } from '../business/dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerOnboarding)
    private onboardingRepository: Repository<CustomerOnboarding>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
    @InjectRepository(CustomerFavorite)
    private customerFavoriteRepository: Repository<CustomerFavorite>,
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(BusinessAddress)
    private businessAddressRepository: Repository<BusinessAddress>,
    @InjectRepository(BusinessMedia)
    private businessMediaRepository: Repository<BusinessMedia>,
    private readonly s3Service: S3Service,
  ) {}

  async getCustomerProfile(userId: string): Promise<CustomerProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const customer = await this.customerRepository.findOne({
      where: { userId },
      relations: ['onboarding', 'user'],
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const profileData = {
      id: customer.id,
      userId: customer.userId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      gender: customer.gender,
      dateOfBirth: customer.dateOfBirth,
      phone: user.phone,
      email: user.email,
      profilePic: user.profilePic,
      profilePicCdnUrl: user.profilePicCdnUrl,
      profilePicS3Key: user.profilePicS3Key,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
      onboarding: {
        isCompleted: customer.onboarding?.isCompleted || false,
        currentStep: customer.onboarding?.currentStep || 1,
        completedSteps: customer.onboarding?.completedSteps || [],
        progressPercentage: customer.onboarding?.getProgressPercentage() || 0,
        stepData: {
          step1: customer.onboarding?.step1Data || {},
          step2: customer.onboarding?.step2Data || {},
          step3: customer.onboarding?.step3Data || {},
          step4: customer.onboarding?.step4Data || {},
        },
      },
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };

    return new CustomerProfileResponseDto(200, true, 'Customer profile retrieved successfully', profileData);
  }

  async completeOnboardingStep1(
    userId: string,
    step1Data: OnboardingStep1Dto,
  ): Promise<OnboardingStepResponseDto> {
    const customer = await this.getCustomerWithOnboarding(userId);
    
    // Get current user data to check signup method
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate conditional requirements based on signup method
    const signedUpWithPhone = user.phone && user.isPhoneVerified;
    const signedUpWithEmail = user.email && user.isEmailVerified;

    if (signedUpWithPhone && !signedUpWithEmail) {
      // Phone signup: email is optional, ignore any phone number provided
      // (phone is already verified and cannot be changed)
    } else if (signedUpWithEmail && !signedUpWithPhone) {
      // Email signup: phone is required, but email cannot be changed  
      if (!step1Data.phone) {
        throw new BadRequestException('Phone number is required for email signup users');
      }
      if (step1Data.email && step1Data.email !== user.email) {
        throw new BadRequestException('Cannot change email address after signup');
      }
    }

    if (!customer.onboarding.completedSteps.includes(1)) {
      customer.onboarding.completedSteps.push(1);
    }

    customer.onboarding.step1Data = step1Data;
    customer.onboarding.currentStep = Math.max(customer.onboarding.currentStep, 2);

    // Update customer basic info
    customer.firstName = step1Data.firstName;
    customer.lastName = step1Data.lastName;
    customer.gender = step1Data.gender;

    // Update user phone/email only if they weren't set during signup
    if (!user.phone && step1Data.phone) {
      // Only set phone if user doesn't have one (email signup case)
      await this.userRepository.update(userId, { phone: step1Data.phone });
    }
    if (!user.email && step1Data.email) {
      // Only set email if user doesn't have one (phone signup case)
      await this.userRepository.update(userId, { email: step1Data.email });
    }

    await this.customerRepository.save(customer);
    await this.onboardingRepository.save(customer.onboarding);

    return new OnboardingStepResponseDto(
      200,
      true,
      'Step 1 completed successfully',
      { nextStep: customer.onboarding.currentStep }
    );
  }

  async completeOnboardingStep2(
    userId: string,
    step2Data: OnboardingStep2Dto,
  ): Promise<OnboardingStepResponseDto> {
    const customer = await this.getCustomerWithOnboarding(userId);

    if (!customer.onboarding.completedSteps.includes(2)) {
      customer.onboarding.completedSteps.push(2);
    }

    customer.onboarding.step2Data = step2Data;
    customer.onboarding.currentStep = Math.max(customer.onboarding.currentStep, 3);

    // Create or update user address from onboarding step 2 data
    // Check if user already has an address created from onboarding
    const existingAddress = await this.userAddressRepository.findOne({
      where: { userId, isActive: true },
      order: { createdAt: 'ASC' },
    });

    if (existingAddress && existingAddress.isPrimary) {
      // Update existing primary address
      Object.assign(existingAddress, {
        addressType: step2Data.addressType,
        latitude: step2Data.latitude,
        longitude: step2Data.longitude,
        streetAddress: step2Data.streetAddress,
        addressLine1: step2Data.addressLine1,
        addressLine2: step2Data.addressLine2,
        landmark: step2Data.landmark,
        city: step2Data.city,
        state: step2Data.state,
        postalCode: step2Data.postalCode,
        country: 'India',
      });
      await this.userAddressRepository.save(existingAddress);
    } else {
      // Create new address as primary
      const newAddress = this.userAddressRepository.create({
        userId,
        addressType: step2Data.addressType,
        latitude: step2Data.latitude,
        longitude: step2Data.longitude,
        streetAddress: step2Data.streetAddress,
        addressLine1: step2Data.addressLine1,
        addressLine2: step2Data.addressLine2,
        landmark: step2Data.landmark,
        city: step2Data.city,
        state: step2Data.state,
        postalCode: step2Data.postalCode,
        country: 'India',
        isPrimary: true,
        isActive: true,
      });
      await this.userAddressRepository.save(newAddress);
    }

    await this.onboardingRepository.save(customer.onboarding);

    return new OnboardingStepResponseDto(
      200,
      true,
      'Step 2 completed successfully',
      { nextStep: customer.onboarding.currentStep }
    );
  }

  async completeOnboardingStep3(
    userId: string,
    step3Data: OnboardingStep3Dto,
  ): Promise<OnboardingStepResponseDto> {
    const customer = await this.getCustomerWithOnboarding(userId);
    
    if (!customer.onboarding.completedSteps.includes(3)) {
      customer.onboarding.completedSteps.push(3);
    }

    customer.onboarding.step3Data = step3Data;
    customer.onboarding.currentStep = Math.max(customer.onboarding.currentStep, 4);

    await this.onboardingRepository.save(customer.onboarding);

    return new OnboardingStepResponseDto(
      200,
      true,
      'Step 3 completed successfully',
      { nextStep: customer.onboarding.currentStep }
    );
  }

  async completeOnboardingStep4(
    userId: string,
    step4Data: OnboardingStep4Dto,
  ): Promise<OnboardingCompletionResponseDto> {
    const customer = await this.getCustomerWithOnboarding(userId);
    
    if (!customer.onboarding.completedSteps.includes(4)) {
      customer.onboarding.completedSteps.push(4);
    }

    customer.onboarding.step4Data = step4Data;
    customer.onboarding.isCompleted = true;

    await this.onboardingRepository.save(customer.onboarding);

    return new OnboardingCompletionResponseDto(
      200,
      true,
      'Onboarding completed successfully!',
      { completed: true }
    );
  }

  async getOnboardingStatus(userId: string): Promise<OnboardingStatusResponseDto> {
    const customer = await this.getCustomerWithOnboarding(userId);
    
    const statusData = {
      isCompleted: customer.onboarding.isCompleted,
      currentStep: customer.onboarding.currentStep,
      completedSteps: customer.onboarding.completedSteps,
      progressPercentage: customer.onboarding.getProgressPercentage(),
      stepData: {
        step1: customer.onboarding.step1Data || {},
        step2: customer.onboarding.step2Data || {},
        step3: customer.onboarding.step3Data || {},
        step4: customer.onboarding.step4Data || {},
      },
    };

    return new OnboardingStatusResponseDto(200, true, 'Onboarding status retrieved successfully', statusData);
  }

  async updateCustomerProfile(
    userId: string,
    updateData: UpdateCustomerProfileDto,
  ): Promise<UpdateProfileResponseDto> {
    // Get user and customer with onboarding
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const customer = await this.customerRepository.findOne({
      where: { userId },
      relations: ['onboarding', 'user'],
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    // Ensure onboarding exists
    if (!customer.onboarding) {
      const onboarding = this.onboardingRepository.create({
        customerId: customer.id,
        currentStep: 1,
        completedSteps: [],
      });
      customer.onboarding = await this.onboardingRepository.save(onboarding);
    }

    // Update customer fields (Step 1 data)
    if (updateData.firstName !== undefined) {
      customer.firstName = updateData.firstName;
    }
    if (updateData.lastName !== undefined) {
      customer.lastName = updateData.lastName;
    }
    if (updateData.gender !== undefined) {
      customer.gender = updateData.gender;
    }
    if (updateData.dateOfBirth !== undefined) {
      customer.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    // Profile picture updates should use dedicated endpoints (POST /customer/profile-picture)
    // Phone and email cannot be changed via this endpoint to enforce signup method restrictions
    // if (updateData.profilePic !== undefined) {
    //   await this.userRepository.update(userId, { profilePic: updateData.profilePic });
    // }

    // Update onboarding step data
    let onboardingUpdated = false;

    // Update Step 1 data in onboarding
    const currentStep1Data = customer.onboarding.step1Data || {};
    if (updateData.firstName !== undefined || updateData.lastName !== undefined || updateData.gender !== undefined) {
      customer.onboarding.step1Data = {
        ...currentStep1Data,
        ...(updateData.firstName !== undefined && { firstName: updateData.firstName }),
        ...(updateData.lastName !== undefined && { lastName: updateData.lastName }),
        ...(updateData.gender !== undefined && { gender: updateData.gender }),
      };
      onboardingUpdated = true;
    }

    // Update Step 3 data (service preferences)
    const currentStep3Data = customer.onboarding.step3Data || {};
    if (updateData.hairType !== undefined || updateData.preferredCategoryIds !== undefined) {
      customer.onboarding.step3Data = {
        ...currentStep3Data,
        ...(updateData.hairType !== undefined && { hairType: updateData.hairType }),
        ...(updateData.preferredCategoryIds !== undefined && { preferredCategoryIds: updateData.preferredCategoryIds }),
      };
      onboardingUpdated = true;
    }

    // Update Step 4 data (timing preferences)
    const currentStep4Data = customer.onboarding.step4Data || {};
    if (updateData.preferredTimeSlotIds !== undefined || updateData.preferredDays !== undefined) {
      customer.onboarding.step4Data = {
        ...currentStep4Data,
        ...(updateData.preferredTimeSlotIds !== undefined && { preferredTimeSlotIds: updateData.preferredTimeSlotIds }),
        ...(updateData.preferredDays !== undefined && { preferredDays: updateData.preferredDays }),
      };
      onboardingUpdated = true;
    }

    // Save all changes
    const promises: Promise<any>[] = [this.customerRepository.save(customer)];
    if (onboardingUpdated) {
      promises.push(this.onboardingRepository.save(customer.onboarding));
    }

    await Promise.all(promises);

    // Fetch updated user data
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    // Fetch updated customer with onboarding
    const updatedCustomer = await this.customerRepository.findOne({
      where: { userId },
      relations: ['onboarding'],
    });

    // Build updated profile data
    const profileData = {
      id: updatedCustomer.id,
      userId: updatedCustomer.userId,
      firstName: updatedCustomer.firstName,
      lastName: updatedCustomer.lastName,
      gender: updatedCustomer.gender,
      dateOfBirth: updatedCustomer.dateOfBirth,
      phone: updatedUser.phone,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      isPhoneVerified: updatedUser.isPhoneVerified,
      isEmailVerified: updatedUser.isEmailVerified,
      onboarding: {
        isCompleted: updatedCustomer.onboarding?.isCompleted || false,
        currentStep: updatedCustomer.onboarding?.currentStep || 1,
        completedSteps: updatedCustomer.onboarding?.completedSteps || [],
        progressPercentage: updatedCustomer.onboarding?.getProgressPercentage() || 0,
        stepData: {
          step1: updatedCustomer.onboarding?.step1Data || {},
          step2: updatedCustomer.onboarding?.step2Data || {},
          step3: updatedCustomer.onboarding?.step3Data || {},
          step4: updatedCustomer.onboarding?.step4Data || {},
        },
      },
      createdAt: updatedCustomer.createdAt,
      updatedAt: updatedCustomer.updatedAt,
    };

    return new UpdateProfileResponseDto(200, true, 'Customer profile updated successfully', profileData);
  }

  private async getCustomerWithOnboarding(userId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { userId },
      relations: ['onboarding'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (!customer.onboarding) {
      // Create onboarding record if it doesn't exist
      const onboarding = this.onboardingRepository.create({
        customerId: customer.id,
        currentStep: 1,
        completedSteps: [],
      });
      customer.onboarding = await this.onboardingRepository.save(onboarding);
    }

    return customer;
  }

  /**
   * Upload profile picture for customer
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
      prefix: `customer_${userId}`,
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
   * Delete profile picture for customer
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
   * Toggle favorite status for a business
   * If favorited, removes it. If not favorited, adds it.
   */
  async toggleFavorite(customerId: string, businessOwnerId: string): Promise<FavoriteActionResponseDto> {
    // Verify customer exists
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Verify business exists and is approved
    const business = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId, isApproved: true, isDefaulter: false },
    });
    if (!business) {
      throw new NotFoundException('Business not found or not approved');
    }

    // Check if already favorited
    const existingFavorite = await this.customerFavoriteRepository.findOne({
      where: { customerId, businessOwnerId },
    });

    if (existingFavorite) {
      // Remove from favorites
      await this.customerFavoriteRepository.remove(existingFavorite);
      return new FavoriteActionResponseDto(200, true, 'Business removed from favorites', false);
    } else {
      // Add to favorites
      const favorite = this.customerFavoriteRepository.create({
        customerId,
        businessOwnerId,
      });
      await this.customerFavoriteRepository.save(favorite);
      return new FavoriteActionResponseDto(200, true, 'Business added to favorites', true);
    }
  }

  /**
   * Get all favorite businesses for a customer with pagination
   */
  async getFavorites(customerId: string, paginationDto: FavoritesPaginationDto): Promise<FavoritesResponseDto> {
    // Verify customer exists
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.customerFavoriteRepository.count({
      where: { customerId },
    });

    // Get favorites with pagination
    const favorites = await this.customerFavoriteRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Transform to business items
    const favoriteBusinesses: FavoriteBusinessItemDto[] = await Promise.all(
      favorites.map(async (favorite) => {
        const business = await this.businessOwnerRepository.findOne({
          where: { id: favorite.businessOwnerId },
        });

        if (!business) {
          return null;
        }

        // Get business address
        const address = await this.businessAddressRepository.findOne({
          where: { businessOwnerId: business.id },
          order: { createdAt: 'ASC' },
        });

        // Get business media
        const businessMedia = await this.businessMediaRepository.find({
          where: { businessOwnerId: business.id, isActive: true },
          order: { displayOrder: 'ASC', createdAt: 'ASC' },
          take: 10,
        });

        return {
          id: business.id,
          shopId: business.shopId,
          businessName: business.businessName,
          businessDescription: business.businessDescription,
          operatingYears: business.operatingYears,
          businessAddress: address ? {
            id: address.id,
            streetAddress: address.streetAddress,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            latitude: address.latitude,
            longitude: address.longitude,
          } as BusinessAddressDto : undefined,
          businessMedia: businessMedia.map(media => ({
            id: media.id,
            mediaUrl: media.mediaUrl,
            mediaCdnUrl: media.cdnUrl,
            mediaType: media.mediaType,
          } as BusinessMediaDto)),
          averageRating: undefined, // TODO: Implement when rating system is available
          reviewCount: undefined, // TODO: Implement when rating system is available
          favoritedAt: favorite.createdAt,
        } as FavoriteBusinessItemDto;
      })
    );

    // Filter out null entries (deleted businesses)
    const validFavorites = favoriteBusinesses.filter(fb => fb !== null);

    // Build metadata
    const totalPages = Math.ceil(total / limit);
    const meta: FavoritesMetaDto = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    const data: FavoritesDataDto = {
      favorites: validFavorites,
      meta,
    };

    return new FavoritesResponseDto(200, true, 'Favorites retrieved successfully', data);
  }

  /**
   * Check if a business is favorited by a customer
   */
  async isFavorite(customerId: string, businessOwnerId: string): Promise<boolean> {
    const favorite = await this.customerFavoriteRepository.findOne({
      where: { customerId, businessOwnerId },
    });
    return !!favorite;
  }

  /**
   * Check favorites for multiple businesses (bulk operation for efficiency)
   * Returns a Map of businessOwnerId -> isFavorite boolean
   */
  async checkFavoritesForBusinesses(customerId: string, businessOwnerIds: string[]): Promise<Map<string, boolean>> {
    if (!customerId || businessOwnerIds.length === 0) {
      return new Map();
    }

    const favorites = await this.customerFavoriteRepository.find({
      where: { customerId },
      select: ['businessOwnerId'],
    });

    const favoriteMap = new Map<string, boolean>();
    const favoritedBusinessIds = new Set(favorites.map(f => f.businessOwnerId));

    businessOwnerIds.forEach(id => {
      favoriteMap.set(id, favoritedBusinessIds.has(id));
    });

    return favoriteMap;
  }
}
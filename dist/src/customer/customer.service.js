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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const s3_service_1 = require("../common/services/s3.service");
const dto_1 = require("./dto");
let CustomerService = class CustomerService {
    constructor(customerRepository, onboardingRepository, userRepository, userAddressRepository, customerFavoriteRepository, businessOwnerRepository, businessAddressRepository, businessMediaRepository, s3Service) {
        this.customerRepository = customerRepository;
        this.onboardingRepository = onboardingRepository;
        this.userRepository = userRepository;
        this.userAddressRepository = userAddressRepository;
        this.customerFavoriteRepository = customerFavoriteRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.businessAddressRepository = businessAddressRepository;
        this.businessMediaRepository = businessMediaRepository;
        this.s3Service = s3Service;
    }
    async getCustomerProfile(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const customer = await this.customerRepository.findOne({
            where: { userId },
            relations: ['onboarding', 'user'],
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer profile not found');
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
        return new dto_1.CustomerProfileResponseDto(200, true, 'Customer profile retrieved successfully', profileData);
    }
    async completeOnboardingStep1(userId, step1Data) {
        const customer = await this.getCustomerWithOnboarding(userId);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const signedUpWithPhone = user.phone && user.isPhoneVerified;
        const signedUpWithEmail = user.email && user.isEmailVerified;
        if (signedUpWithPhone && !signedUpWithEmail) {
        }
        else if (signedUpWithEmail && !signedUpWithPhone) {
            if (!step1Data.phone) {
                throw new common_1.BadRequestException('Phone number is required for email signup users');
            }
            if (step1Data.email && step1Data.email !== user.email) {
                throw new common_1.BadRequestException('Cannot change email address after signup');
            }
        }
        if (!customer.onboarding.completedSteps.includes(1)) {
            customer.onboarding.completedSteps.push(1);
        }
        customer.onboarding.step1Data = step1Data;
        customer.onboarding.currentStep = Math.max(customer.onboarding.currentStep, 2);
        customer.firstName = step1Data.firstName;
        customer.lastName = step1Data.lastName;
        customer.gender = step1Data.gender;
        if (!user.phone && step1Data.phone) {
            await this.userRepository.update(userId, { phone: step1Data.phone });
        }
        if (!user.email && step1Data.email) {
            await this.userRepository.update(userId, { email: step1Data.email });
        }
        await this.customerRepository.save(customer);
        await this.onboardingRepository.save(customer.onboarding);
        return new dto_1.OnboardingStepResponseDto(200, true, 'Step 1 completed successfully', { nextStep: customer.onboarding.currentStep });
    }
    async completeOnboardingStep2(userId, step2Data) {
        const customer = await this.getCustomerWithOnboarding(userId);
        if (!customer.onboarding.completedSteps.includes(2)) {
            customer.onboarding.completedSteps.push(2);
        }
        customer.onboarding.step2Data = step2Data;
        customer.onboarding.currentStep = Math.max(customer.onboarding.currentStep, 3);
        const existingAddress = await this.userAddressRepository.findOne({
            where: { userId, isActive: true },
            order: { createdAt: 'ASC' },
        });
        if (existingAddress && existingAddress.isPrimary) {
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
        }
        else {
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
        return new dto_1.OnboardingStepResponseDto(200, true, 'Step 2 completed successfully', { nextStep: customer.onboarding.currentStep });
    }
    async completeOnboardingStep3(userId, step3Data) {
        const customer = await this.getCustomerWithOnboarding(userId);
        if (!customer.onboarding.completedSteps.includes(3)) {
            customer.onboarding.completedSteps.push(3);
        }
        customer.onboarding.step3Data = step3Data;
        customer.onboarding.currentStep = Math.max(customer.onboarding.currentStep, 4);
        await this.onboardingRepository.save(customer.onboarding);
        return new dto_1.OnboardingStepResponseDto(200, true, 'Step 3 completed successfully', { nextStep: customer.onboarding.currentStep });
    }
    async completeOnboardingStep4(userId, step4Data) {
        const customer = await this.getCustomerWithOnboarding(userId);
        if (!customer.onboarding.completedSteps.includes(4)) {
            customer.onboarding.completedSteps.push(4);
        }
        customer.onboarding.step4Data = step4Data;
        customer.onboarding.isCompleted = true;
        await this.onboardingRepository.save(customer.onboarding);
        return new dto_1.OnboardingCompletionResponseDto(200, true, 'Onboarding completed successfully!', { completed: true });
    }
    async getOnboardingStatus(userId) {
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
        return new dto_1.OnboardingStatusResponseDto(200, true, 'Onboarding status retrieved successfully', statusData);
    }
    async updateCustomerProfile(userId, updateData) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const customer = await this.customerRepository.findOne({
            where: { userId },
            relations: ['onboarding', 'user'],
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer profile not found');
        }
        if (!customer.onboarding) {
            const onboarding = this.onboardingRepository.create({
                customerId: customer.id,
                currentStep: 1,
                completedSteps: [],
            });
            customer.onboarding = await this.onboardingRepository.save(onboarding);
        }
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
        let onboardingUpdated = false;
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
        const currentStep3Data = customer.onboarding.step3Data || {};
        if (updateData.hairType !== undefined || updateData.preferredCategoryIds !== undefined) {
            customer.onboarding.step3Data = {
                ...currentStep3Data,
                ...(updateData.hairType !== undefined && { hairType: updateData.hairType }),
                ...(updateData.preferredCategoryIds !== undefined && { preferredCategoryIds: updateData.preferredCategoryIds }),
            };
            onboardingUpdated = true;
        }
        const currentStep4Data = customer.onboarding.step4Data || {};
        if (updateData.preferredTimeSlotIds !== undefined || updateData.preferredDays !== undefined) {
            customer.onboarding.step4Data = {
                ...currentStep4Data,
                ...(updateData.preferredTimeSlotIds !== undefined && { preferredTimeSlotIds: updateData.preferredTimeSlotIds }),
                ...(updateData.preferredDays !== undefined && { preferredDays: updateData.preferredDays }),
            };
            onboardingUpdated = true;
        }
        const promises = [this.customerRepository.save(customer)];
        if (onboardingUpdated) {
            promises.push(this.onboardingRepository.save(customer.onboarding));
        }
        await Promise.all(promises);
        const updatedUser = await this.userRepository.findOne({
            where: { id: userId },
        });
        const updatedCustomer = await this.customerRepository.findOne({
            where: { userId },
            relations: ['onboarding'],
        });
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
        return new dto_1.UpdateProfileResponseDto(200, true, 'Customer profile updated successfully', profileData);
    }
    async getCustomerWithOnboarding(userId) {
        const customer = await this.customerRepository.findOne({
            where: { userId },
            relations: ['onboarding'],
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        if (!customer.onboarding) {
            const onboarding = this.onboardingRepository.create({
                customerId: customer.id,
                currentStep: 1,
                completedSteps: [],
            });
            customer.onboarding = await this.onboardingRepository.save(onboarding);
        }
        return customer;
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
            prefix: `customer_${userId}`,
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
    async toggleFavorite(customerId, businessOwnerId) {
        const customer = await this.customerRepository.findOne({ where: { id: customerId } });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const business = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId, isApproved: true, isDefaulter: false },
        });
        if (!business) {
            throw new common_1.NotFoundException('Business not found or not approved');
        }
        const existingFavorite = await this.customerFavoriteRepository.findOne({
            where: { customerId, businessOwnerId },
        });
        if (existingFavorite) {
            await this.customerFavoriteRepository.remove(existingFavorite);
            return new dto_1.FavoriteActionResponseDto(200, true, 'Business removed from favorites', false);
        }
        else {
            const favorite = this.customerFavoriteRepository.create({
                customerId,
                businessOwnerId,
            });
            await this.customerFavoriteRepository.save(favorite);
            return new dto_1.FavoriteActionResponseDto(200, true, 'Business added to favorites', true);
        }
    }
    async getFavorites(customerId, paginationDto) {
        const customer = await this.customerRepository.findOne({ where: { id: customerId } });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const page = paginationDto.page || 1;
        const limit = paginationDto.limit || 20;
        const skip = (page - 1) * limit;
        const total = await this.customerFavoriteRepository.count({
            where: { customerId },
        });
        const favorites = await this.customerFavoriteRepository.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        const favoriteBusinesses = await Promise.all(favorites.map(async (favorite) => {
            const business = await this.businessOwnerRepository.findOne({
                where: { id: favorite.businessOwnerId },
            });
            if (!business) {
                return null;
            }
            const address = await this.businessAddressRepository.findOne({
                where: { businessOwnerId: business.id },
                order: { createdAt: 'ASC' },
            });
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
                } : undefined,
                businessMedia: businessMedia.map(media => ({
                    id: media.id,
                    mediaUrl: media.mediaUrl,
                    mediaCdnUrl: media.cdnUrl,
                    mediaType: media.mediaType,
                })),
                averageRating: undefined,
                reviewCount: undefined,
                favoritedAt: favorite.createdAt,
            };
        }));
        const validFavorites = favoriteBusinesses.filter(fb => fb !== null);
        const totalPages = Math.ceil(total / limit);
        const meta = {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
        const data = {
            favorites: validFavorites,
            meta,
        };
        return new dto_1.FavoritesResponseDto(200, true, 'Favorites retrieved successfully', data);
    }
    async isFavorite(customerId, businessOwnerId) {
        const favorite = await this.customerFavoriteRepository.findOne({
            where: { customerId, businessOwnerId },
        });
        return !!favorite;
    }
    async checkFavoritesForBusinesses(customerId, businessOwnerIds) {
        if (!customerId || businessOwnerIds.length === 0) {
            return new Map();
        }
        const favorites = await this.customerFavoriteRepository.find({
            where: { customerId },
            select: ['businessOwnerId'],
        });
        const favoriteMap = new Map();
        const favoritedBusinessIds = new Set(favorites.map(f => f.businessOwnerId));
        businessOwnerIds.forEach(id => {
            favoriteMap.set(id, favoritedBusinessIds.has(id));
        });
        return favoriteMap;
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.CustomerOnboarding)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.UserAddress)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.CustomerFavorite)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.BusinessAddress)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.BusinessMedia)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        s3_service_1.S3Service])
], CustomerService);
//# sourceMappingURL=customer.service.js.map
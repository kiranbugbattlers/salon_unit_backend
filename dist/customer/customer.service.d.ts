import { Repository } from 'typeorm';
import { Customer, CustomerOnboarding, User, UserAddress, CustomerFavorite, BusinessOwner, BusinessAddress, BusinessMedia } from '../database/entities';
import { S3Service } from '../common/services/s3.service';
import { OnboardingStep1Dto, OnboardingStep2Dto, OnboardingStep3Dto, OnboardingStep4Dto, OnboardingStepResponseDto, OnboardingCompletionResponseDto, OnboardingStatusResponseDto, CustomerProfileResponseDto, UpdateCustomerProfileDto, UpdateProfileResponseDto, FavoritesResponseDto, FavoritesPaginationDto, FavoriteActionResponseDto } from './dto';
export declare class CustomerService {
    private customerRepository;
    private onboardingRepository;
    private userRepository;
    private userAddressRepository;
    private customerFavoriteRepository;
    private businessOwnerRepository;
    private businessAddressRepository;
    private businessMediaRepository;
    private readonly s3Service;
    constructor(customerRepository: Repository<Customer>, onboardingRepository: Repository<CustomerOnboarding>, userRepository: Repository<User>, userAddressRepository: Repository<UserAddress>, customerFavoriteRepository: Repository<CustomerFavorite>, businessOwnerRepository: Repository<BusinessOwner>, businessAddressRepository: Repository<BusinessAddress>, businessMediaRepository: Repository<BusinessMedia>, s3Service: S3Service);
    getCustomerProfile(userId: string): Promise<CustomerProfileResponseDto>;
    completeOnboardingStep1(userId: string, step1Data: OnboardingStep1Dto): Promise<OnboardingStepResponseDto>;
    completeOnboardingStep2(userId: string, step2Data: OnboardingStep2Dto): Promise<OnboardingStepResponseDto>;
    completeOnboardingStep3(userId: string, step3Data: OnboardingStep3Dto): Promise<OnboardingStepResponseDto>;
    completeOnboardingStep4(userId: string, step4Data: OnboardingStep4Dto): Promise<OnboardingCompletionResponseDto>;
    getOnboardingStatus(userId: string): Promise<OnboardingStatusResponseDto>;
    updateCustomerProfile(userId: string, updateData: UpdateCustomerProfileDto): Promise<UpdateProfileResponseDto>;
    private getCustomerWithOnboarding;
    uploadProfilePicture(userId: string, file: any): Promise<{
        profilePic: string;
        profilePicCdnUrl: string;
        profilePicS3Key: string;
    }>;
    deleteProfilePicture(userId: string): Promise<void>;
    toggleFavorite(customerId: string, businessOwnerId: string): Promise<FavoriteActionResponseDto>;
    getFavorites(customerId: string, paginationDto: FavoritesPaginationDto): Promise<FavoritesResponseDto>;
    isFavorite(customerId: string, businessOwnerId: string): Promise<boolean>;
    checkFavoritesForBusinesses(customerId: string, businessOwnerIds: string[]): Promise<Map<string, boolean>>;
}

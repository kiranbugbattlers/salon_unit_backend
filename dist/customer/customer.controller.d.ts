import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { CustomerService } from './customer.service';
import { AssignmentService } from '../support-member/assignment.service';
import { OnboardingStep1Dto, OnboardingStep2Dto, OnboardingStep3Dto, OnboardingStep4Dto, OnboardingStepResponseDto, OnboardingCompletionResponseDto, OnboardingStatusResponseDto, CustomerProfileResponseDto, UpdateCustomerProfileDto, UpdateProfileResponseDto, FavoritesResponseDto, FavoritesPaginationDto, FavoriteActionResponseDto } from './dto';
export declare class CustomerController {
    private customerService;
    private assignmentService;
    constructor(customerService: CustomerService, assignmentService: AssignmentService);
    getProfile(user: CurrentUserData): Promise<CustomerProfileResponseDto>;
    getOnboardingStatus(user: CurrentUserData): Promise<OnboardingStatusResponseDto>;
    completeStep1(user: CurrentUserData, step1Data: OnboardingStep1Dto): Promise<OnboardingStepResponseDto>;
    completeStep2(user: CurrentUserData, step2Data: OnboardingStep2Dto): Promise<OnboardingStepResponseDto>;
    completeStep3(user: CurrentUserData, step3Data: OnboardingStep3Dto): Promise<OnboardingStepResponseDto>;
    completeStep4(user: CurrentUserData, step4Data: OnboardingStep4Dto): Promise<OnboardingCompletionResponseDto>;
    updateProfile(user: CurrentUserData, updateData: UpdateCustomerProfileDto): Promise<UpdateProfileResponseDto>;
    uploadProfilePicture(file: any, user: CurrentUserData): Promise<{
        profilePic: string;
        profilePicCdnUrl: string;
        profilePicS3Key: string;
    }>;
    deleteProfilePicture(user: CurrentUserData): Promise<{
        message: string;
    }>;
    getMySupportMember(user: CurrentUserData): Promise<{
        message: string;
        assignment: any;
        type?: undefined;
        supportMember?: undefined;
        assignedAt?: undefined;
        admin?: undefined;
        note?: undefined;
    } | {
        type: string;
        supportMember: {
            id: string;
            name: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            profilePic: string;
        };
        assignedAt: Date;
        message?: undefined;
        assignment?: undefined;
        admin?: undefined;
        note?: undefined;
    } | {
        type: string;
        admin: {
            id: string;
            name: string;
            email: string;
        };
        assignedAt: Date;
        note: string;
        message?: undefined;
        assignment?: undefined;
        supportMember?: undefined;
    }>;
    toggleFavorite(user: CurrentUserData, businessOwnerId: string): Promise<FavoriteActionResponseDto>;
    getFavorites(user: CurrentUserData, paginationDto: FavoritesPaginationDto): Promise<FavoritesResponseDto>;
}

export declare class RoleOnboardingDto {
    isRequired: boolean;
    isCompleted: boolean;
    currentStep: number;
    completedSteps: number[];
    progressPercentage: number;
    stepData: Record<string, any>;
}
export declare class OnboardingStatusDto {
    customer?: RoleOnboardingDto;
    businessOwner?: RoleOnboardingDto;
}
export declare class UserDto {
    id: string;
    phone: string;
    email?: string;
    profilePic?: string;
    name?: string;
    roles: string[];
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
}
export declare class TokensDto {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthResponseDto {
    user: UserDto;
    onboarding: OnboardingStatusDto;
    tokens: TokensDto;
    isNewUser: boolean;
}

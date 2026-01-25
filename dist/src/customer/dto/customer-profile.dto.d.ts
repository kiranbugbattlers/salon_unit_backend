import { Gender } from '../../common/enums';
export declare class OnboardingProgressDto {
    isCompleted: boolean;
    currentStep: number;
    completedSteps: number[];
    progressPercentage: number;
    stepData: {
        step1?: any;
        step2?: any;
        step3?: any;
        step4?: any;
    };
}
export declare class CustomerProfileDto {
    id: string;
    userId: string;
    firstName?: string;
    lastName?: string;
    gender?: Gender;
    dateOfBirth?: Date;
    phone: string;
    email?: string;
    profilePic?: string;
    profilePicCdnUrl?: string;
    profilePicS3Key?: string;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    onboarding: OnboardingProgressDto;
    createdAt: Date;
    updatedAt: Date;
}

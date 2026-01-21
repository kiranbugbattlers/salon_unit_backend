import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class OnboardingStepResponseData {
    nextStep: number;
}
export declare class OnboardingStepResponseDto extends ApiResponseDto<OnboardingStepResponseData> {
    code: number;
    success: boolean;
    message: string;
    data: OnboardingStepResponseData;
    constructor(code: number, success: boolean, message: string, data: OnboardingStepResponseData);
}
export declare class OnboardingCompletionData {
    completed: boolean;
}
export declare class OnboardingCompletionResponseDto extends ApiResponseDto<OnboardingCompletionData> {
    code: number;
    success: boolean;
    message: string;
    data: OnboardingCompletionData;
    constructor(code: number, success: boolean, message: string, data: OnboardingCompletionData);
}
export declare class OnboardingStatusData {
    isCompleted: boolean;
    currentStep: number;
    completedSteps: number[];
    progressPercentage: number;
    stepData: Record<string, any>;
}
export declare class OnboardingStatusResponseDto extends ApiResponseDto<OnboardingStatusData> {
    code: number;
    success: boolean;
    message: string;
    data: OnboardingStatusData;
    constructor(code: number, success: boolean, message: string, data: OnboardingStatusData);
}
export declare class CustomerProfileResponseDto extends ApiResponseDto<any> {
    code: number;
    success: boolean;
    message: string;
    data: any;
    constructor(code: number, success: boolean, message: string, data: any);
}

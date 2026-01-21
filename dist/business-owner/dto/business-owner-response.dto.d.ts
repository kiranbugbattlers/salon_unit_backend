import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class BusinessOwnerOnboardingStepResponseData {
    nextStep: number;
    skipStep1?: boolean;
}
export declare class BusinessOwnerOnboardingStepResponseDto extends ApiResponseDto<BusinessOwnerOnboardingStepResponseData> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessOwnerOnboardingStepResponseData;
    constructor(code: number, success: boolean, message: string, data: BusinessOwnerOnboardingStepResponseData);
}
export declare class BusinessOwnerOnboardingCompletionData {
    completed: boolean;
}
export declare class BusinessOwnerOnboardingCompletionResponseDto extends ApiResponseDto<BusinessOwnerOnboardingCompletionData> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessOwnerOnboardingCompletionData;
    constructor(code: number, success: boolean, message: string, data: BusinessOwnerOnboardingCompletionData);
}
export declare class BusinessOwnerOnboardingStatusData {
    isCompleted: boolean;
    currentStep: number;
    completedSteps: number[];
    progressPercentage: number;
    stepData: Record<string, any>;
}
export declare class BusinessOwnerOnboardingStatusResponseDto extends ApiResponseDto<BusinessOwnerOnboardingStatusData> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessOwnerOnboardingStatusData;
    constructor(code: number, success: boolean, message: string, data: BusinessOwnerOnboardingStatusData);
}
export declare class BusinessOwnerProfileResponseDto extends ApiResponseDto<any> {
    code: number;
    success: boolean;
    message: string;
    data: any;
    constructor(code: number, success: boolean, message: string, data: any);
}

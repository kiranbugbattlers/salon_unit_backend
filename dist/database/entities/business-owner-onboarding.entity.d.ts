import { BusinessOwner } from './business-owner.entity';
export declare class BusinessOwnerOnboarding {
    id: string;
    businessOwnerId: string;
    currentStep: number;
    completedSteps: number[];
    isCompleted: boolean;
    step1Data?: any;
    step2Data?: any;
    step3Data?: any;
    step4Data?: any;
    createdAt: Date;
    updatedAt: Date;
    businessOwner: BusinessOwner;
    getProgressPercentage(): number;
}

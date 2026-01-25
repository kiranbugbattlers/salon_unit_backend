import { Customer } from './customer.entity';
export declare class CustomerOnboarding {
    id: string;
    customerId: string;
    currentStep: number;
    completedSteps: number[];
    isCompleted: boolean;
    step1Data?: Record<string, any>;
    step2Data?: Record<string, any>;
    step3Data?: Record<string, any>;
    step4Data?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    customer: Customer;
    getProgressPercentage(): number;
}

import { BusinessSubscriptionResponseDto } from './subscription-response.dto';
export declare class SubscriptionPaymentOrderDataDto {
    orderId: string;
    amount: number;
    currency: string;
    razorpayKeyId: string;
    subscriptionId: string;
    planName: string;
    description: string;
}
export declare class SubscriptionPaymentOrderResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: SubscriptionPaymentOrderDataDto;
}
export declare class VerifySubscriptionPaymentDataDto {
    status: string;
    subscriptionId: string;
    razorpayPaymentId: string;
    subscription: BusinessSubscriptionResponseDto;
}
export declare class VerifySubscriptionPaymentResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: VerifySubscriptionPaymentDataDto;
}
export declare class SubscriptionPaymentStatusDataDto {
    subscriptionId: string;
    status: string;
    razorpayOrderId?: string;
    canRetry: boolean;
    planName: string;
    amount: number;
    currency: string;
}
export declare class SubscriptionPaymentStatusResponseDto {
    code: number;
    success: boolean;
    message: string;
    data: SubscriptionPaymentStatusDataDto;
}

export declare class CreateCommissionPaymentDto {
    amount: number;
    notes?: string;
}
export declare class CommissionPaymentResponseDto {
    orderId: string;
    amount: number;
    currency: string;
    razorpayKey: string;
    description: string;
    businessOwnerName: string;
    businessOwnerPhone: string;
}
export declare class VerifyCommissionPaymentDto {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}
export declare class CommissionPaymentVerificationResponseDto {
    verified: boolean;
    amount: number;
    newBalance: number;
    defaulterStatusRemoved: boolean;
    paymentId: string;
}

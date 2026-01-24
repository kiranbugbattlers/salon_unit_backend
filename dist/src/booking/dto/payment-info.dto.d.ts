export declare class PaymentInfoDto {
    paymentMethod: string | null;
    paymentStatus: string;
    amount: number;
    razorpayPaymentId?: string | null;
    paymentCompletedAt?: Date | null;
}

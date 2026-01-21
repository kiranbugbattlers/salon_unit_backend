export interface OtpProviderInterface {
    sendOtp(phone: string, otp: string): Promise<boolean>;
    verifyOtp?(phone: string, otp: string): Promise<boolean>;
}

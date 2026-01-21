export interface OtpSendResult {
    success: boolean;
    otp?: string;
}
export interface IOtpProvider {
    sendOtp(phone: string, role?: string): Promise<boolean | OtpSendResult>;
    verifyOtp(phone: string, otp: string, role?: string): Promise<boolean>;
    getProviderName(): string;
}
export declare enum OtpProviderType {
    CONSOLE = "console",
    TWILIO = "twilio",
    TWILIO_SMS = "twilio-sms",
    BHASHSMS = "bhashsms",
    AWS_SNS = "aws-sns",
    FIREBASE = "firebase"
}

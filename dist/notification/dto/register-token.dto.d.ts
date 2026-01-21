import { DeviceType, UserType } from '../entities/device-token.entity';
export declare class RegisterTokenDto {
    fcmToken: string;
    deviceType: DeviceType;
    userType: UserType;
    deviceInfo?: {
        model?: string;
        osVersion?: string;
        appVersion?: string;
        deviceName?: string;
    };
}

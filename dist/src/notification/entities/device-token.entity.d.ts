import { User } from '../../database/entities/user.entity';
export declare enum DeviceType {
    IOS = "ios",
    ANDROID = "android",
    WEB = "web"
}
export declare enum UserType {
    CUSTOMER = "customer",
    BUSINESS_OWNER = "business_owner",
    STAFF = "staff",
    ADMIN = "admin"
}
export declare class DeviceToken {
    id: string;
    userId: string;
    user: User;
    userType: UserType;
    fcmToken: string;
    deviceType: DeviceType;
    deviceInfo: {
        model?: string;
        osVersion?: string;
        appVersion?: string;
        deviceName?: string;
    };
    isActive: boolean;
    lastUsedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

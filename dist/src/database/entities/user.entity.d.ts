import { Customer } from './customer.entity';
import { BusinessOwner } from './business-owner.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserRole } from './user-role.entity';
import { UserAddress } from './user-address.entity';
export declare class User {
    id: string;
    phone: string;
    email?: string;
    profilePic?: string;
    profilePicCdnUrl?: string;
    profilePicS3Key?: string;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    fcmToken?: string;
    deviceType?: string;
    deviceId?: string;
    createdAt: Date;
    updatedAt: Date;
    roles: UserRole[];
    customer: Customer;
    businessOwner: BusinessOwner;
    refreshTokens: RefreshToken[];
    addresses: UserAddress[];
}

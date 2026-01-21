import { Gender } from '../../common/enums';
import { VendorStatus } from '../../common/enums/vendor-status.enum';
import { BusinessOwnerOnboardingStatusDto } from './business-owner-onboarding-status.dto';
export declare class BusinessAddressDto {
    id: string;
    addressType: string;
    latitude: number;
    longitude: number;
    streetAddress: string;
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary: boolean;
    isActive: boolean;
}
export declare class BusinessOwnerProfileDto {
    id: string;
    userId: string;
    shopId: string;
    firstName?: string;
    lastName?: string;
    gender?: Gender;
    dateOfBirth?: Date;
    businessName?: string;
    businessDescription?: string;
    operatingYears?: number;
    phone: string;
    email?: string;
    profilePic?: string;
    profilePicCdnUrl?: string;
    profilePicS3Key?: string;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    address?: BusinessAddressDto;
    onboarding: BusinessOwnerOnboardingStatusDto;
    averageRating?: number;
    reviewCount: number;
    upiId?: string;
    creditLimit?: number;
    vendorStatus?: VendorStatus;
    createdAt: Date;
    updatedAt: Date;
}

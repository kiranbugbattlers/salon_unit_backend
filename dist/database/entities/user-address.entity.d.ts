import { AddressType } from '../../common/enums';
import { User } from './user.entity';
export declare class UserAddress {
    id: string;
    userId: string;
    addressType: AddressType;
    latitude?: number;
    longitude?: number;
    streetAddress: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}

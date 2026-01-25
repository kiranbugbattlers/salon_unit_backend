import { AddressType } from '../../common/enums';
export declare class CreateUserAddressDto {
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
}

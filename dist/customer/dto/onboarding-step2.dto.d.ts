import { AddressType } from '../../common/enums';
export declare class OnboardingStep2Dto {
    latitude: number;
    longitude: number;
    streetAddress: string;
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    addressType?: AddressType;
}

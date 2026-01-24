import { Gender } from '../../common/enums';
export declare class BusinessOwnerProfileUpdateDto {
    firstName?: string;
    lastName?: string;
    gender?: Gender;
    dateOfBirth?: string;
    businessName?: string;
    businessDescription?: string;
    operatingYears?: number;
    upiId?: string;
    creditLimit?: number;
}

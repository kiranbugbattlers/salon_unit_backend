import { Gender, HairType } from '../../common/enums';
export declare class UpdateCustomerProfileDto {
    firstName?: string;
    lastName?: string;
    gender?: Gender;
    dateOfBirth?: string;
    profilePic?: string;
    hairType?: HairType;
    preferredCategoryIds?: string[];
    preferredTimeSlotIds?: string[];
    preferredDays?: number[];
}

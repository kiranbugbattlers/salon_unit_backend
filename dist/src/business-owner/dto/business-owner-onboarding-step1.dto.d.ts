import { Gender } from '../../common/enums';
export declare class BusinessOwnerOnboardingStep1Dto {
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    gender: Gender;
    dateOfBirth?: string;
}

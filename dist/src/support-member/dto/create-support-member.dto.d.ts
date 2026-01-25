import { Gender } from '../../common/enums';
export declare class CreateSupportMemberDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender?: Gender;
    dateOfBirth?: string;
}

import { Gender } from '../../common/enums';
export declare class CreateStaffDto {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    dateOfBirth: string;
    gender: Gender;
    lunchStartTime: string;
    lunchEndTime: string;
}

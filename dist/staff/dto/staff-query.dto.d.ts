import { Gender } from '../../common/enums';
export declare class StaffQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    gender?: Gender;
}

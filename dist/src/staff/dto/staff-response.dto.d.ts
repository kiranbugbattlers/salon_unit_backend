import { Gender } from '../../common/enums';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class StaffData {
    id: string;
    businessOwnerId: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    dateOfBirth: Date;
    gender: Gender;
    profilePic?: string;
    profilePicCdnUrl?: string;
    isActive: boolean;
    lunchStartTime?: string | null;
    lunchEndTime?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class StaffResponseDto extends ApiResponseDto<StaffData> {
    code: number;
    success: boolean;
    message: string;
    data: StaffData;
    constructor(code: number, success: boolean, message: string, data: StaffData);
}
export declare class StaffListData {
    data: StaffData[];
    total: number;
    page: number;
    limit: number;
}
export declare class StaffListResponseDto extends ApiResponseDto<StaffListData> {
    code: number;
    success: boolean;
    message: string;
    data: StaffListData;
    constructor(code: number, success: boolean, message: string, data: StaffListData);
}
export declare class ProfilePictureData {
    profilePic: string;
    profilePicCdnUrl: string;
    profilePicS3Key: string;
}
export declare class ProfilePictureResponseDto extends ApiResponseDto<ProfilePictureData> {
    code: number;
    success: boolean;
    message: string;
    data: ProfilePictureData;
    constructor(code: number, success: boolean, message: string, data: ProfilePictureData);
}
export declare class MessageData {
    message: string;
}
export declare class MessageResponseDto extends ApiResponseDto<MessageData> {
    code: number;
    success: boolean;
    message: string;
    data: MessageData;
    constructor(code: number, success: boolean, message: string, data: MessageData);
}

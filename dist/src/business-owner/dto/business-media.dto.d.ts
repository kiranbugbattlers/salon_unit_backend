import { ApiResponseDto } from '../../common/dto/api-response.dto';
export declare class BusinessMediaDto {
    id: string;
    mediaType: string;
    mediaUrl: string;
    cdnUrl?: string;
    thumbnailUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    displayOrder: number;
    createdAt: Date;
}
export declare class BusinessMediaUploadDto {
    mediaId: string;
    mediaUrl: string;
    cdnUrl: string;
    s3Key: string;
}
export declare class BusinessMediaListDataDto {
    media: BusinessMediaDto[];
    count: number;
}
export declare class BusinessMediaUploadDataDto {
    media: BusinessMediaUploadDto[];
    count: number;
}
export declare class BusinessMediaUploadResponseDto extends ApiResponseDto<BusinessMediaUploadDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessMediaUploadDataDto;
    constructor(code: number, success: boolean, message: string, data: BusinessMediaUploadDataDto);
}
export declare class BusinessMediaListResponseDto extends ApiResponseDto<BusinessMediaListDataDto> {
    code: number;
    success: boolean;
    message: string;
    data: BusinessMediaListDataDto;
    constructor(code: number, success: boolean, message: string, data: BusinessMediaListDataDto);
}
export declare class BusinessMediaDeleteResponseDto extends ApiResponseDto<null> {
    code: number;
    success: boolean;
    message: string;
    data: null;
    constructor(code?: number, success?: boolean, message?: string);
}

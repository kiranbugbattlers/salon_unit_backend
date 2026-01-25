import { CustomerProfileDto } from './customer-profile.dto';
export declare class UpdateProfileResponseDto {
    statusCode: number;
    success: boolean;
    message: string;
    data: CustomerProfileDto;
    constructor(statusCode: number, success: boolean, message: string, data: CustomerProfileDto);
}

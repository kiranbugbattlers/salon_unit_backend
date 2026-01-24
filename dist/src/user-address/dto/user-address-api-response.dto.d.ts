import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { UserAddressResponseDto } from './user-address-response.dto';
export declare class UserAddressListResponseDto extends ApiResponseDto<UserAddressResponseDto[]> {
    code: number;
    success: boolean;
    message: string;
    data: UserAddressResponseDto[];
    constructor(code: number, success: boolean, message: string, data: UserAddressResponseDto[]);
}
export declare class UserAddressSingleResponseDto extends ApiResponseDto<UserAddressResponseDto> {
    code: number;
    success: boolean;
    message: string;
    data: UserAddressResponseDto;
    constructor(code: number, success: boolean, message: string, data: UserAddressResponseDto);
}
export declare class UserAddressCreateResponseDto extends ApiResponseDto<UserAddressResponseDto> {
    code: number;
    success: boolean;
    message: string;
    data: UserAddressResponseDto;
    constructor(code: number, success: boolean, message: string, data: UserAddressResponseDto);
}
export declare class UserAddressUpdateResponseDto extends ApiResponseDto<UserAddressResponseDto> {
    code: number;
    success: boolean;
    message: string;
    data: UserAddressResponseDto;
    constructor(code: number, success: boolean, message: string, data: UserAddressResponseDto);
}
export declare class UserAddressDeleteData {
    message: string;
}
export declare class UserAddressDeleteResponseDto extends ApiResponseDto<UserAddressDeleteData> {
    code: number;
    success: boolean;
    message: string;
    data: UserAddressDeleteData;
    constructor(code: number, success: boolean, message: string, data: UserAddressDeleteData);
}

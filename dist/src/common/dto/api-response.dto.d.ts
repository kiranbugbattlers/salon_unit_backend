export declare class ApiResponseDto<T = any> {
    code: number;
    success: boolean;
    message: string;
    data?: T;
    constructor(code: number, success: boolean, message: string, data?: T);
}
export declare class SendOtpResponseDto extends ApiResponseDto<null> {
    code: number;
    success: boolean;
    message: string;
    constructor(code?: number, success?: boolean, message?: string);
}
export declare class VerifyOtpResponseDto<T> extends ApiResponseDto<T> {
    code: number;
    success: boolean;
    message: string;
    constructor(code: number, success: boolean, message: string, data: T);
}

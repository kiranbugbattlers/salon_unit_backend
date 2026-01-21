export interface CurrentUserData {
    userId: string;
    phone: string;
    email?: string;
    roles: string[];
    customerId?: string;
    businessOwnerId?: string;
}
export declare const CurrentUser: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | keyof CurrentUserData)[]) => ParameterDecorator;

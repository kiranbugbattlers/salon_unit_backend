import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  userId: string;
  phone: string;
  email?: string;
  roles: string[];
  customerId?: string;
  businessOwnerId?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData, ctx: ExecutionContext): CurrentUserData | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    return data ? user?.[data] : user;
  },
);
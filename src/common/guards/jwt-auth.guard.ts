import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      // For public endpoints, try to authenticate if token is provided
      // but don't fail if token is missing or invalid
      try {
        await super.canActivate(context);
      } catch (error) {
        // Silently ignore authentication errors for public endpoints
      }
      return true;
    }
    
    // For protected endpoints, require valid authentication
    return super.canActivate(context) as Promise<boolean>;
  }
}
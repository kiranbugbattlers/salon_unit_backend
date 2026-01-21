import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../database/entities/admin.entity';
import { UserRole } from '../enums';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // This comes from JWT strategy
    
    if (!user) {
      throw new ForbiddenException('Admin access required - no user in request');
    }

    // Check if user has admin role and is of type admin
    if (!user.roles?.includes(UserRole.ADMIN) || user.type !== 'admin') {
      throw new ForbiddenException('Admin access required - insufficient permissions');
    }

    // Verify admin exists and is active
    const admin = await this.adminRepository.findOne({
      where: { id: user.sub, isActive: true },
    });

    if (!admin) {
      throw new ForbiddenException('Admin access required - admin not found or inactive');
    }

    // Attach admin info to request for easy access
    request.admin = {
      id: admin.id,
      username: admin.username,
      roles: user.roles,
    };

    return true;
  }
}
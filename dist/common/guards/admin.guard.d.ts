import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Admin } from '../../database/entities/admin.entity';
export declare class AdminGuard implements CanActivate {
    private adminRepository;
    constructor(adminRepository: Repository<Admin>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}

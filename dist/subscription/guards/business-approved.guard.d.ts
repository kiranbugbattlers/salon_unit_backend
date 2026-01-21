import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BusinessOwner } from '../../database/entities';
export declare class BusinessApprovedGuard implements CanActivate {
    private businessOwnerRepository;
    constructor(businessOwnerRepository: Repository<BusinessOwner>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}

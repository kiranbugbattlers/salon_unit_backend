import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessOwner } from '../../database/entities';

@Injectable()
export class BusinessApprovedGuard implements CanActivate {
  constructor(
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('User ID not found');
    }

    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId: user.userId },
    });

    if (!businessOwner) {
      throw new ForbiddenException('Business not found');
    }

    if (!businessOwner.isApproved) {
      throw new ForbiddenException('Only approved businesses can access this resource');
    }

    return true;
  }
}
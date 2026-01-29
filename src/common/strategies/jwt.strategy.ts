import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserRole, Admin, Agent, Customer, BusinessOwner } from '../../database/entities';
import { VendorStatus } from '../../common/enums/vendor-status.enum';

export interface JwtPayload {
  sub: string; // user ID, admin ID, or agent ID
  phone?: string;
  username?: string;
  roles: string[];
  type?: string; // 'admin' for admin users, 'agent' for agent users
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    // Handle admin tokens
    if (payload.type === 'admin') {
      const admin = await this.adminRepository.findOne({
        where: { id: payload.sub, isActive: true },
      });

      if (!admin) {
        throw new UnauthorizedException('Admin not found');
      }

      return {
        sub: admin.id,
        username: admin.username,
        email: admin.email,
        roles: payload.roles,
        type: 'admin',
      };
    }

    // Handle agent tokens
    if (payload.type === 'agent') {
      const agent = await this.agentRepository.findOne({
        where: { id: payload.sub, isActive: true },
        relations: ['user'],
      });

      if (!agent) {
        throw new UnauthorizedException('Agent not found');
      }

      return {
        agentId: agent.id,
        userId: agent.userId,
        username: agent.username,
        phone: agent.user?.phone,
        email: agent.user?.email,
        roles: payload.roles,
        type: 'agent',
      };
    }

    // Handle regular user tokens
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const activeRoles = await this.userRoleRepository.find({
      where: { userId: user.id, isActive: true },
    });

    // Fetch customer and business owner IDs if they exist
    const customer = await this.customerRepository.findOne({
      where: { userId: user.id },
    });

    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId: user.id },
    });

    // Check if business owner is SUSPENDED - if so, deny access
    if (businessOwner && businessOwner.vendorStatus === VendorStatus.SUSPENDED) {
      throw new UnauthorizedException('Business owner account is suspended. Please contact admin.');
    }

    return {
      userId: user.id,
      phone: user.phone,
      email: user.email,
      roles: activeRoles.map(role => role.role),
      customerId: customer?.id,
      businessOwnerId: businessOwner?.id,
    };
  }
}
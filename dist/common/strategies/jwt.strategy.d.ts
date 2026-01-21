import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Strategy } from 'passport-jwt';
import { User, UserRole, Admin, Agent, Customer, BusinessOwner } from '../../database/entities';
export interface JwtPayload {
    sub: string;
    phone?: string;
    username?: string;
    roles: string[];
    type?: string;
    iat?: number;
    exp?: number;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userRepository;
    private userRoleRepository;
    private adminRepository;
    private agentRepository;
    private customerRepository;
    private businessOwnerRepository;
    constructor(configService: ConfigService, userRepository: Repository<User>, userRoleRepository: Repository<UserRole>, adminRepository: Repository<Admin>, agentRepository: Repository<Agent>, customerRepository: Repository<Customer>, businessOwnerRepository: Repository<BusinessOwner>);
    validate(payload: JwtPayload): Promise<{
        sub: string;
        username: string;
        email: string;
        roles: string[];
        type: string;
        agentId?: undefined;
        userId?: undefined;
        phone?: undefined;
        customerId?: undefined;
        businessOwnerId?: undefined;
    } | {
        agentId: string;
        userId: string;
        username: string;
        phone: string;
        email: string;
        roles: string[];
        type: string;
        sub?: undefined;
        customerId?: undefined;
        businessOwnerId?: undefined;
    } | {
        userId: string;
        phone: string;
        email: string;
        roles: import("../enums").UserRole[];
        customerId: string;
        businessOwnerId: string;
        sub?: undefined;
        username?: undefined;
        type?: undefined;
        agentId?: undefined;
    }>;
}
export {};

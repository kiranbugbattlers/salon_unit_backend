"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const passport_jwt_1 = require("passport-jwt");
const entities_1 = require("../../database/entities");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, userRepository, userRoleRepository, adminRepository, agentRepository, customerRepository, businessOwnerRepository) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('app.jwt.secret'),
        });
        this.configService = configService;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.adminRepository = adminRepository;
        this.agentRepository = agentRepository;
        this.customerRepository = customerRepository;
        this.businessOwnerRepository = businessOwnerRepository;
    }
    async validate(payload) {
        if (payload.type === 'admin') {
            const admin = await this.adminRepository.findOne({
                where: { id: payload.sub, isActive: true },
            });
            if (!admin) {
                throw new common_1.UnauthorizedException('Admin not found');
            }
            return {
                sub: admin.id,
                username: admin.username,
                email: admin.email,
                roles: payload.roles,
                type: 'admin',
            };
        }
        if (payload.type === 'agent') {
            const agent = await this.agentRepository.findOne({
                where: { id: payload.sub, isActive: true },
                relations: ['user'],
            });
            if (!agent) {
                throw new common_1.UnauthorizedException('Agent not found');
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
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
            relations: ['roles'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const activeRoles = await this.userRoleRepository.find({
            where: { userId: user.id, isActive: true },
        });
        const customer = await this.customerRepository.findOne({
            where: { userId: user.id },
        });
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId: user.id },
        });
        return {
            userId: user.id,
            phone: user.phone,
            email: user.email,
            roles: activeRoles.map(role => role.role),
            customerId: customer?.id,
            businessOwnerId: businessOwner?.id,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.UserRole)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Admin)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Agent)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map
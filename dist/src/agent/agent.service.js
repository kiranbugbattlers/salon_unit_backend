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
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const dto_1 = require("./dto");
let AgentService = class AgentService {
    constructor(agentRepository, userRepository) {
        this.agentRepository = agentRepository;
        this.userRepository = userRepository;
    }
    async getAgentProfile(agentId) {
        const agent = await this.agentRepository.findOne({
            where: { id: agentId },
            relations: ['user', 'createdByAdmin'],
        });
        if (!agent) {
            throw new common_1.NotFoundException('Agent not found');
        }
        const user = agent.user;
        if (!user) {
            throw new common_1.NotFoundException('Associated user not found');
        }
        const profileData = {
            id: agent.id,
            userId: agent.userId,
            username: agent.username,
            firstName: agent.firstName,
            lastName: agent.lastName,
            gender: agent.gender,
            dateOfBirth: agent.dateOfBirth,
            employeeId: agent.employeeId,
            department: agent.department,
            position: agent.position,
            hireDate: agent.hireDate,
            isActive: agent.isActive,
            lastLogin: agent.lastLogin,
            permissions: agent.permissions || {},
            latitude: agent.latitude,
            longitude: agent.longitude,
            locationAddress: agent.locationAddress,
            phone: user.phone,
            email: user.email,
            profilePic: user.profilePic,
            profilePicCdnUrl: user.profilePicCdnUrl,
            profilePicS3Key: user.profilePicS3Key,
            isPhoneVerified: user.isPhoneVerified,
            isEmailVerified: user.isEmailVerified,
            createdBy: agent.createdByAdmin ? {
                id: agent.createdByAdmin.id,
                username: agent.createdByAdmin.username,
                email: agent.createdByAdmin.email,
            } : null,
            createdAt: agent.createdAt,
            updatedAt: agent.updatedAt,
        };
        return new dto_1.AgentProfileResponseDto(200, true, 'Agent profile retrieved successfully', profileData);
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Agent)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AgentService);
//# sourceMappingURL=agent.service.js.map
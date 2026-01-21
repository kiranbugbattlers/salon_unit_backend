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
exports.AdminGuard = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_entity_1 = require("../../database/entities/admin.entity");
const enums_1 = require("../enums");
let AdminGuard = class AdminGuard {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Admin access required - no user in request');
        }
        if (!user.roles?.includes(enums_1.UserRole.ADMIN) || user.type !== 'admin') {
            throw new common_1.ForbiddenException('Admin access required - insufficient permissions');
        }
        const admin = await this.adminRepository.findOne({
            where: { id: user.sub, isActive: true },
        });
        if (!admin) {
            throw new common_1.ForbiddenException('Admin access required - admin not found or inactive');
        }
        request.admin = {
            id: admin.id,
            username: admin.username,
            roles: user.roles,
        };
        return true;
    }
};
exports.AdminGuard = AdminGuard;
exports.AdminGuard = AdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminGuard);
//# sourceMappingURL=admin.guard.js.map
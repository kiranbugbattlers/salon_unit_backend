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
exports.BusinessApprovedGuard = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
let BusinessApprovedGuard = class BusinessApprovedGuard {
    constructor(businessOwnerRepository) {
        this.businessOwnerRepository = businessOwnerRepository;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.userId) {
            throw new common_1.ForbiddenException('User ID not found');
        }
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId: user.userId },
        });
        if (!businessOwner) {
            throw new common_1.ForbiddenException('Business not found');
        }
        if (!businessOwner.isApproved) {
            throw new common_1.ForbiddenException('Only approved businesses can access this resource');
        }
        return true;
    }
};
exports.BusinessApprovedGuard = BusinessApprovedGuard;
exports.BusinessApprovedGuard = BusinessApprovedGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BusinessApprovedGuard);
//# sourceMappingURL=business-approved.guard.js.map
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
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const agent_service_1 = require("./agent.service");
const dto_1 = require("./dto");
let AgentController = class AgentController {
    constructor(agentService) {
        this.agentService = agentService;
    }
    async getProfile(req) {
        return this.agentService.getAgentProfile(req.user.agentId);
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.AGENT),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get agent profile',
        description: 'Retrieves the complete agent profile including personal information, employment details, and associated user information',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent profile retrieved successfully',
        type: dto_1.AgentProfileResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - User does not have agent role',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Agent not found',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getProfile", null);
exports.AgentController = AgentController = __decorate([
    (0, swagger_1.ApiTags)('Agent'),
    (0, common_1.Controller)('agent'),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
//# sourceMappingURL=agent.controller.js.map
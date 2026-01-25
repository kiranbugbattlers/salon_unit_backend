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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessApprovalStatusDto = exports.BusinessApprovalStatusDataDto = exports.AgentInfo = void 0;
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class AgentInfo {
}
exports.AgentInfo = AgentInfo;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Agent ID',
        example: 'agent-uuid-123',
    }),
    __metadata("design:type", String)
], AgentInfo.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Agent full name',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], AgentInfo.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Agent email',
        example: 'john.doe@company.com',
        required: false,
    }),
    __metadata("design:type", String)
], AgentInfo.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Agent phone number',
        example: '+1234567890',
        required: false,
    }),
    __metadata("design:type", String)
], AgentInfo.prototype, "phone", void 0);
class BusinessApprovalStatusDataDto {
}
exports.BusinessApprovalStatusDataDto = BusinessApprovalStatusDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indicates if the business has an approval request',
        example: true,
    }),
    __metadata("design:type", Boolean)
], BusinessApprovalStatusDataDto.prototype, "hasApprovalRequested", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current approval status',
        enum: enums_1.ApprovalStatus,
        example: enums_1.ApprovalStatus.PENDING,
        required: false,
    }),
    __metadata("design:type", String)
], BusinessApprovalStatusDataDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indicates if the business is approved',
        example: false,
    }),
    __metadata("design:type", Boolean)
], BusinessApprovalStatusDataDto.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Information about the assigned agent',
        type: AgentInfo,
        required: false,
    }),
    __metadata("design:type", AgentInfo)
], BusinessApprovalStatusDataDto.prototype, "assignedAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rejection reason if business was rejected',
        example: 'Missing required documents',
        required: false,
    }),
    __metadata("design:type", String)
], BusinessApprovalStatusDataDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'When the approval request was created',
        example: '2024-01-15T10:30:00Z',
        required: false,
    }),
    __metadata("design:type", Date)
], BusinessApprovalStatusDataDto.prototype, "requestedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Human-readable status message',
        example: 'Your business registration is being reviewed by our team.',
    }),
    __metadata("design:type", String)
], BusinessApprovalStatusDataDto.prototype, "statusMessage", void 0);
class BusinessApprovalStatusDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Business approval status retrieved successfully', data) {
        super(code, success, message, data);
    }
}
exports.BusinessApprovalStatusDto = BusinessApprovalStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessApprovalStatusDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessApprovalStatusDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business approval status retrieved successfully' }),
    __metadata("design:type", String)
], BusinessApprovalStatusDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BusinessApprovalStatusDataDto }),
    __metadata("design:type", BusinessApprovalStatusDataDto)
], BusinessApprovalStatusDto.prototype, "data", void 0);
//# sourceMappingURL=business-approval-status.dto.js.map
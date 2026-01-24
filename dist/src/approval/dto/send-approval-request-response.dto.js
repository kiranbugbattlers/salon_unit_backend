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
exports.SendApprovalRequestResponseDto = exports.SendApprovalRequestDataDto = exports.ApprovalRequestInfoDto = exports.AssignedAdminDto = exports.AssignedAgentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AssignedAgentDto {
}
exports.AssignedAgentDto = AssignedAgentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AssignedAgentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AssignedAgentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], AssignedAgentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], AssignedAgentDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], AssignedAgentDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], AssignedAgentDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], AssignedAgentDto.prototype, "distanceKm", void 0);
class AssignedAdminDto {
}
exports.AssignedAdminDto = AssignedAdminDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AssignedAdminDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AssignedAdminDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], AssignedAdminDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AssignedAdminDto.prototype, "username", void 0);
class ApprovalRequestInfoDto {
}
exports.ApprovalRequestInfoDto = ApprovalRequestInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestInfoDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestInfoDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestInfoDto.prototype, "businessAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestInfoDto.prototype, "businessOwnerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalRequestInfoDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ApprovalRequestInfoDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ApprovalRequestInfoDto.prototype, "isAutoAssigned", void 0);
class SendApprovalRequestDataDto {
}
exports.SendApprovalRequestDataDto = SendApprovalRequestDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: ApprovalRequestInfoDto }),
    __metadata("design:type", ApprovalRequestInfoDto)
], SendApprovalRequestDataDto.prototype, "requestInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AssignedAgentDto, required: false }),
    __metadata("design:type", AssignedAgentDto)
], SendApprovalRequestDataDto.prototype, "assignedAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AssignedAdminDto, required: false }),
    __metadata("design:type", AssignedAdminDto)
], SendApprovalRequestDataDto.prototype, "assignedAdmin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['agent', 'admin'],
        description: 'Type of assignee - agent when assigned to agent, admin when no agents available'
    }),
    __metadata("design:type", String)
], SendApprovalRequestDataDto.prototype, "assignmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], SendApprovalRequestDataDto.prototype, "fallbackReason", void 0);
class SendApprovalRequestResponseDto {
}
exports.SendApprovalRequestResponseDto = SendApprovalRequestResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], SendApprovalRequestResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], SendApprovalRequestResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Step completed successfully' }),
    __metadata("design:type", String)
], SendApprovalRequestResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SendApprovalRequestDataDto }),
    __metadata("design:type", SendApprovalRequestDataDto)
], SendApprovalRequestResponseDto.prototype, "data", void 0);
//# sourceMappingURL=send-approval-request-response.dto.js.map
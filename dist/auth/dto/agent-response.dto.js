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
exports.AgentAuthResponseDto = exports.AgentCreateResponseDto = exports.AgentListResponseDto = exports.AgentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const auth_response_dto_1 = require("./auth-response.dto");
class AgentDto {
}
exports.AgentDto = AgentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Agent ID', example: 'uuid' }),
    __metadata("design:type", String)
], AgentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID', example: 'uuid' }),
    __metadata("design:type", String)
], AgentDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Agent username', example: 'agent_user' }),
    __metadata("design:type", String)
], AgentDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number', example: '9876543210' }),
    __metadata("design:type", String)
], AgentDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email address', example: 'agent@salon.com', required: false }),
    __metadata("design:type", String)
], AgentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name', example: 'John' }),
    __metadata("design:type", String)
], AgentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name', example: 'Doe', required: false }),
    __metadata("design:type", String)
], AgentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full name', example: 'John Doe' }),
    __metadata("design:type", String)
], AgentDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender', example: 'male', required: false }),
    __metadata("design:type", String)
], AgentDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth', example: '1990-01-15', required: false }),
    __metadata("design:type", String)
], AgentDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID', example: 'AGT-001', required: false }),
    __metadata("design:type", String)
], AgentDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Department', example: 'Customer Service', required: false }),
    __metadata("design:type", String)
], AgentDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Position', example: 'Senior Agent', required: false }),
    __metadata("design:type", String)
], AgentDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hire date', example: '2024-01-01', required: false }),
    __metadata("design:type", String)
], AgentDto.prototype, "hireDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Salary', example: 50000.00, required: false }),
    __metadata("design:type", Number)
], AgentDto.prototype, "salary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is active', example: true }),
    __metadata("design:type", Boolean)
], AgentDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last login timestamp', required: false }),
    __metadata("design:type", Date)
], AgentDto.prototype, "lastLogin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Permissions',
        example: { canManageBookings: true, canViewReports: false },
        required: false
    }),
    __metadata("design:type", Object)
], AgentDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', example: 'Experienced agent', required: false }),
    __metadata("design:type", String)
], AgentDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created by admin ID', example: 'uuid' }),
    __metadata("design:type", String)
], AgentDto.prototype, "createdByAdminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created by admin username', example: 'admin_user' }),
    __metadata("design:type", String)
], AgentDto.prototype, "createdByAdminUsername", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation date', example: '2024-09-07T10:30:00Z' }),
    __metadata("design:type", Date)
], AgentDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated date', example: '2024-09-07T10:30:00Z' }),
    __metadata("design:type", Date)
], AgentDto.prototype, "updatedAt", void 0);
class AgentListResponseDto {
}
exports.AgentListResponseDto = AgentListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AgentDto], description: 'List of agents' }),
    __metadata("design:type", Array)
], AgentListResponseDto.prototype, "agents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total count', example: 25 }),
    __metadata("design:type", Number)
], AgentListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page', example: 1 }),
    __metadata("design:type", Number)
], AgentListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items per page', example: 10 }),
    __metadata("design:type", Number)
], AgentListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total pages', example: 3 }),
    __metadata("design:type", Number)
], AgentListResponseDto.prototype, "totalPages", void 0);
class AgentCreateResponseDto {
}
exports.AgentCreateResponseDto = AgentCreateResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created agent', type: AgentDto }),
    __metadata("design:type", AgentDto)
], AgentCreateResponseDto.prototype, "agent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success message', example: 'Agent created successfully' }),
    __metadata("design:type", String)
], AgentCreateResponseDto.prototype, "message", void 0);
class AgentAuthResponseDto {
}
exports.AgentAuthResponseDto = AgentAuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Agent information', type: AgentDto }),
    __metadata("design:type", AgentDto)
], AgentAuthResponseDto.prototype, "agent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'JWT tokens', type: auth_response_dto_1.TokensDto }),
    __metadata("design:type", auth_response_dto_1.TokensDto)
], AgentAuthResponseDto.prototype, "tokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is a new agent login', example: false }),
    __metadata("design:type", Boolean)
], AgentAuthResponseDto.prototype, "isNewLogin", void 0);
//# sourceMappingURL=agent-response.dto.js.map
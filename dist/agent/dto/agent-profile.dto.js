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
exports.AgentProfileDto = exports.AgentCreatorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AgentCreatorDto {
}
exports.AgentCreatorDto = AgentCreatorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin ID who created this agent' }),
    __metadata("design:type", String)
], AgentCreatorDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin username' }),
    __metadata("design:type", String)
], AgentCreatorDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin email' }),
    __metadata("design:type", String)
], AgentCreatorDto.prototype, "email", void 0);
class AgentProfileDto {
}
exports.AgentProfileDto = AgentProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Agent ID' }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Agent username' }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name' }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name' }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender' }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth' }),
    __metadata("design:type", Date)
], AgentProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Department' }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Position' }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hire date' }),
    __metadata("design:type", Date)
], AgentProfileDto.prototype, "hireDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is agent active' }),
    __metadata("design:type", Boolean)
], AgentProfileDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last login timestamp' }),
    __metadata("design:type", Date)
], AgentProfileDto.prototype, "lastLogin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Agent permissions' }),
    __metadata("design:type", Object)
], AgentProfileDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Latitude', required: false }),
    __metadata("design:type", Number)
], AgentProfileDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Longitude', required: false }),
    __metadata("design:type", Number)
], AgentProfileDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Location address', required: false }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "locationAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number' }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email' }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profile picture URL', required: false }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "profilePic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profile picture CDN URL', required: false }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "profilePicCdnUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profile picture S3 key', required: false }),
    __metadata("design:type", String)
], AgentProfileDto.prototype, "profilePicS3Key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is phone verified' }),
    __metadata("design:type", Boolean)
], AgentProfileDto.prototype, "isPhoneVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is email verified' }),
    __metadata("design:type", Boolean)
], AgentProfileDto.prototype, "isEmailVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin who created this agent', type: AgentCreatorDto }),
    __metadata("design:type", AgentCreatorDto)
], AgentProfileDto.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", Date)
], AgentProfileDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", Date)
], AgentProfileDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=agent-profile.dto.js.map
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
exports.BusinessOwnerProfileResponseDto = exports.BusinessOwnerOnboardingStatusResponseDto = exports.BusinessOwnerOnboardingStatusData = exports.BusinessOwnerOnboardingCompletionResponseDto = exports.BusinessOwnerOnboardingCompletionData = exports.BusinessOwnerOnboardingStepResponseDto = exports.BusinessOwnerOnboardingStepResponseData = void 0;
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class BusinessOwnerOnboardingStepResponseData {
}
exports.BusinessOwnerOnboardingStepResponseData = BusinessOwnerOnboardingStepResponseData;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], BusinessOwnerOnboardingStepResponseData.prototype, "nextStep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, required: false }),
    __metadata("design:type", Boolean)
], BusinessOwnerOnboardingStepResponseData.prototype, "skipStep1", void 0);
class BusinessOwnerOnboardingStepResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message, data) {
        super(code, success, message, data);
    }
}
exports.BusinessOwnerOnboardingStepResponseDto = BusinessOwnerOnboardingStepResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessOwnerOnboardingStepResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessOwnerOnboardingStepResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Step completed successfully' }),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStepResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", BusinessOwnerOnboardingStepResponseData)
], BusinessOwnerOnboardingStepResponseDto.prototype, "data", void 0);
class BusinessOwnerOnboardingCompletionData {
}
exports.BusinessOwnerOnboardingCompletionData = BusinessOwnerOnboardingCompletionData;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessOwnerOnboardingCompletionData.prototype, "completed", void 0);
class BusinessOwnerOnboardingCompletionResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message, data) {
        super(code, success, message, data);
    }
}
exports.BusinessOwnerOnboardingCompletionResponseDto = BusinessOwnerOnboardingCompletionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessOwnerOnboardingCompletionResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessOwnerOnboardingCompletionResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business owner onboarding completed successfully! Your business registration is now being reviewed by our team. You will be notified once approved.' }),
    __metadata("design:type", String)
], BusinessOwnerOnboardingCompletionResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", BusinessOwnerOnboardingCompletionData)
], BusinessOwnerOnboardingCompletionResponseDto.prototype, "data", void 0);
class BusinessOwnerOnboardingStatusData {
}
exports.BusinessOwnerOnboardingStatusData = BusinessOwnerOnboardingStatusData;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessOwnerOnboardingStatusData.prototype, "isCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessOwnerOnboardingStatusData.prototype, "currentStep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], BusinessOwnerOnboardingStatusData.prototype, "completedSteps", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessOwnerOnboardingStatusData.prototype, "progressPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], BusinessOwnerOnboardingStatusData.prototype, "stepData", void 0);
class BusinessOwnerOnboardingStatusResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Business owner onboarding status retrieved successfully', data) {
        super(code, success, message, data);
    }
}
exports.BusinessOwnerOnboardingStatusResponseDto = BusinessOwnerOnboardingStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessOwnerOnboardingStatusResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessOwnerOnboardingStatusResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business owner onboarding status retrieved successfully' }),
    __metadata("design:type", String)
], BusinessOwnerOnboardingStatusResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", BusinessOwnerOnboardingStatusData)
], BusinessOwnerOnboardingStatusResponseDto.prototype, "data", void 0);
class BusinessOwnerProfileResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Business owner profile retrieved successfully', data) {
        super(code, success, message, data);
    }
}
exports.BusinessOwnerProfileResponseDto = BusinessOwnerProfileResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], BusinessOwnerProfileResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], BusinessOwnerProfileResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Business owner profile retrieved successfully' }),
    __metadata("design:type", String)
], BusinessOwnerProfileResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], BusinessOwnerProfileResponseDto.prototype, "data", void 0);
//# sourceMappingURL=business-owner-response.dto.js.map
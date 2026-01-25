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
exports.CustomerProfileResponseDto = exports.OnboardingStatusResponseDto = exports.OnboardingStatusData = exports.OnboardingCompletionResponseDto = exports.OnboardingCompletionData = exports.OnboardingStepResponseDto = exports.OnboardingStepResponseData = void 0;
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class OnboardingStepResponseData {
}
exports.OnboardingStepResponseData = OnboardingStepResponseData;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], OnboardingStepResponseData.prototype, "nextStep", void 0);
class OnboardingStepResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message, data) {
        super(code, success, message, data);
    }
}
exports.OnboardingStepResponseDto = OnboardingStepResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], OnboardingStepResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], OnboardingStepResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Step completed successfully' }),
    __metadata("design:type", String)
], OnboardingStepResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", OnboardingStepResponseData)
], OnboardingStepResponseDto.prototype, "data", void 0);
class OnboardingCompletionData {
}
exports.OnboardingCompletionData = OnboardingCompletionData;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], OnboardingCompletionData.prototype, "completed", void 0);
class OnboardingCompletionResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message, data) {
        super(code, success, message, data);
    }
}
exports.OnboardingCompletionResponseDto = OnboardingCompletionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], OnboardingCompletionResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], OnboardingCompletionResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Onboarding completed successfully!' }),
    __metadata("design:type", String)
], OnboardingCompletionResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", OnboardingCompletionData)
], OnboardingCompletionResponseDto.prototype, "data", void 0);
class OnboardingStatusData {
}
exports.OnboardingStatusData = OnboardingStatusData;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], OnboardingStatusData.prototype, "isCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], OnboardingStatusData.prototype, "currentStep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], OnboardingStatusData.prototype, "completedSteps", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], OnboardingStatusData.prototype, "progressPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], OnboardingStatusData.prototype, "stepData", void 0);
class OnboardingStatusResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Onboarding status retrieved successfully', data) {
        super(code, success, message, data);
    }
}
exports.OnboardingStatusResponseDto = OnboardingStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], OnboardingStatusResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], OnboardingStatusResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Onboarding status retrieved successfully' }),
    __metadata("design:type", String)
], OnboardingStatusResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", OnboardingStatusData)
], OnboardingStatusResponseDto.prototype, "data", void 0);
class CustomerProfileResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Customer profile retrieved successfully', data) {
        super(code, success, message, data);
    }
}
exports.CustomerProfileResponseDto = CustomerProfileResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], CustomerProfileResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], CustomerProfileResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Customer profile retrieved successfully' }),
    __metadata("design:type", String)
], CustomerProfileResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], CustomerProfileResponseDto.prototype, "data", void 0);
//# sourceMappingURL=customer-response.dto.js.map
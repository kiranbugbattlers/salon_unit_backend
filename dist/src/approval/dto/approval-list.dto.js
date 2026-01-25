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
exports.ApprovalListResponseDto = exports.ApprovalListDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const approval_request_dto_1 = require("./approval-request.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
class ApprovalListDataDto {
}
exports.ApprovalListDataDto = ApprovalListDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [approval_request_dto_1.ApprovalRequestDto] }),
    __metadata("design:type", Array)
], ApprovalListDataDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: pagination_dto_1.PaginationMetaDto }),
    __metadata("design:type", pagination_dto_1.PaginationMetaDto)
], ApprovalListDataDto.prototype, "meta", void 0);
class ApprovalListResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Approval requests retrieved successfully', data) {
        super(code, success, message, data);
    }
}
exports.ApprovalListResponseDto = ApprovalListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], ApprovalListResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ApprovalListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Approval requests retrieved successfully' }),
    __metadata("design:type", String)
], ApprovalListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ApprovalListDataDto }),
    __metadata("design:type", ApprovalListDataDto)
], ApprovalListResponseDto.prototype, "data", void 0);
//# sourceMappingURL=approval-list.dto.js.map
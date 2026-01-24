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
exports.UserAddressDeleteResponseDto = exports.UserAddressDeleteData = exports.UserAddressUpdateResponseDto = exports.UserAddressCreateResponseDto = exports.UserAddressSingleResponseDto = exports.UserAddressListResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const user_address_response_dto_1 = require("./user-address-response.dto");
class UserAddressListResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'User addresses retrieved successfully', data) {
        super(code, success, message, data);
    }
}
exports.UserAddressListResponseDto = UserAddressListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], UserAddressListResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], UserAddressListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'User addresses retrieved successfully' }),
    __metadata("design:type", String)
], UserAddressListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [user_address_response_dto_1.UserAddressResponseDto] }),
    __metadata("design:type", Array)
], UserAddressListResponseDto.prototype, "data", void 0);
class UserAddressSingleResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message, data) {
        super(code, success, message, data);
    }
}
exports.UserAddressSingleResponseDto = UserAddressSingleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], UserAddressSingleResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], UserAddressSingleResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'User address retrieved successfully' }),
    __metadata("design:type", String)
], UserAddressSingleResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: user_address_response_dto_1.UserAddressResponseDto }),
    __metadata("design:type", user_address_response_dto_1.UserAddressResponseDto)
], UserAddressSingleResponseDto.prototype, "data", void 0);
class UserAddressCreateResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 201, success = true, message = 'Address created successfully', data) {
        super(code, success, message, data);
    }
}
exports.UserAddressCreateResponseDto = UserAddressCreateResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 201 }),
    __metadata("design:type", Number)
], UserAddressCreateResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], UserAddressCreateResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Address created successfully' }),
    __metadata("design:type", String)
], UserAddressCreateResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: user_address_response_dto_1.UserAddressResponseDto }),
    __metadata("design:type", user_address_response_dto_1.UserAddressResponseDto)
], UserAddressCreateResponseDto.prototype, "data", void 0);
class UserAddressUpdateResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Address updated successfully', data) {
        super(code, success, message, data);
    }
}
exports.UserAddressUpdateResponseDto = UserAddressUpdateResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], UserAddressUpdateResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], UserAddressUpdateResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Address updated successfully' }),
    __metadata("design:type", String)
], UserAddressUpdateResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: user_address_response_dto_1.UserAddressResponseDto }),
    __metadata("design:type", user_address_response_dto_1.UserAddressResponseDto)
], UserAddressUpdateResponseDto.prototype, "data", void 0);
class UserAddressDeleteData {
}
exports.UserAddressDeleteData = UserAddressDeleteData;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Address deleted successfully' }),
    __metadata("design:type", String)
], UserAddressDeleteData.prototype, "message", void 0);
class UserAddressDeleteResponseDto extends api_response_dto_1.ApiResponseDto {
    constructor(code = 200, success = true, message = 'Address deleted successfully', data) {
        super(code, success, message, data);
    }
}
exports.UserAddressDeleteResponseDto = UserAddressDeleteResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], UserAddressDeleteResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], UserAddressDeleteResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Address deleted successfully' }),
    __metadata("design:type", String)
], UserAddressDeleteResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UserAddressDeleteData }),
    __metadata("design:type", UserAddressDeleteData)
], UserAddressDeleteResponseDto.prototype, "data", void 0);
//# sourceMappingURL=user-address-api-response.dto.js.map
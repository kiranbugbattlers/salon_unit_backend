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
exports.GetActiveAdsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../common/enums");
class GetActiveAdsDto {
}
exports.GetActiveAdsDto = GetActiveAdsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: enums_1.AdUserType,
        description: 'User type requesting ads',
        example: enums_1.AdUserType.CUSTOMER,
    }),
    (0, class_validator_1.IsEnum)(enums_1.AdUserType),
    __metadata("design:type", String)
], GetActiveAdsDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current screen name',
        example: 'home',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetActiveAdsDto.prototype, "screen", void 0);
//# sourceMappingURL=get-active-ads.dto.js.map
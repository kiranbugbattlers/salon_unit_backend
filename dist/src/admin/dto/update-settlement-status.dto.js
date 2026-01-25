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
exports.UpdateSettlementStatusDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const daily_settlement_entity_1 = require("../../database/entities/daily-settlement.entity");
class UpdateSettlementStatusDto {
}
exports.UpdateSettlementStatusDto = UpdateSettlementStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business Owner ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSettlementStatusDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date for settlement (YYYY-MM-DD)', example: '2026-01-07' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSettlementStatusDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: daily_settlement_entity_1.SettlementPaidStatus, description: 'New payment status' }),
    (0, class_validator_1.IsEnum)(daily_settlement_entity_1.SettlementPaidStatus),
    __metadata("design:type", String)
], UpdateSettlementStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transaction reference for payment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSettlementStatusDto.prototype, "transactionReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Admin notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSettlementStatusDto.prototype, "adminNotes", void 0);
//# sourceMappingURL=update-settlement-status.dto.js.map
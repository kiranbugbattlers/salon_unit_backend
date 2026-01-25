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
exports.DefaulterHistoryResponseDto = exports.ManualActionResponseDto = exports.CheckDefaultersApiResponseDto = exports.DefaulterDetailsResponseDto = exports.DefaulterListResponseDto = exports.DefaulterHistoryDto = exports.DefaulterHistoryEntryDto = exports.CheckDefaultersResponseDto = exports.ManualDefaulterActionDto = exports.DefaulterSummaryDto = exports.DefaulterDetailsDto = exports.DefaulterBusinessDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class DefaulterBusinessDto {
}
exports.DefaulterBusinessDto = DefaulterBusinessDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID' }),
    __metadata("design:type", String)
], DefaulterBusinessDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shop ID (e.g., SH-123456)' }),
    __metadata("design:type", String)
], DefaulterBusinessDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business name' }),
    __metadata("design:type", String)
], DefaulterBusinessDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current wallet balance (negative)' }),
    __metadata("design:type", Number)
], DefaulterBusinessDto.prototype, "walletBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When they were marked as defaulter' }),
    __metadata("design:type", Date)
], DefaulterBusinessDto.prototype, "defaulterSince", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Days since marked as defaulter' }),
    __metadata("design:type", Number)
], DefaulterBusinessDto.prototype, "daysSinceDefaulter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner user ID' }),
    __metadata("design:type", String)
], DefaulterBusinessDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner phone number' }),
    __metadata("design:type", String)
], DefaulterBusinessDto.prototype, "phone", void 0);
class DefaulterDetailsDto extends DefaulterBusinessDto {
}
exports.DefaulterDetailsDto = DefaulterDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Banking information', required: false }),
    __metadata("design:type", Object)
], DefaulterDetailsDto.prototype, "bankingInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recent wallet transactions' }),
    __metadata("design:type", Array)
], DefaulterDetailsDto.prototype, "recentTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission owed' }),
    __metadata("design:type", Number)
], DefaulterDetailsDto.prototype, "totalCommissionOwed", void 0);
class DefaulterSummaryDto {
}
exports.DefaulterSummaryDto = DefaulterSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of defaulters' }),
    __metadata("design:type", Number)
], DefaulterSummaryDto.prototype, "totalDefaulters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total negative balance across all defaulters' }),
    __metadata("design:type", Number)
], DefaulterSummaryDto.prototype, "totalNegativeBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average days in defaulter status' }),
    __metadata("design:type", Number)
], DefaulterSummaryDto.prototype, "averageDaysDefaulter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of defaulter businesses' }),
    __metadata("design:type", Array)
], DefaulterSummaryDto.prototype, "defaulters", void 0);
class ManualDefaulterActionDto {
}
exports.ManualDefaulterActionDto = ManualDefaulterActionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for manual action' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualDefaulterActionDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin notes (optional)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualDefaulterActionDto.prototype, "notes", void 0);
class CheckDefaultersResponseDto {
}
exports.CheckDefaultersResponseDto = CheckDefaultersResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of admin notifications sent' }),
    __metadata("design:type", Number)
], CheckDefaultersResponseDto.prototype, "notifiedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total negative wallet count' }),
    __metadata("design:type", Number)
], CheckDefaultersResponseDto.prototype, "totalNegativeWallets", void 0);
class DefaulterHistoryEntryDto {
}
exports.DefaulterHistoryEntryDto = DefaulterHistoryEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID' }),
    __metadata("design:type", String)
], DefaulterHistoryEntryDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shop ID' }),
    __metadata("design:type", String)
], DefaulterHistoryEntryDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business name' }),
    __metadata("design:type", String)
], DefaulterHistoryEntryDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action type: marked or restored' }),
    __metadata("design:type", String)
], DefaulterHistoryEntryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the action occurred' }),
    __metadata("design:type", Date)
], DefaulterHistoryEntryDto.prototype, "actionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Wallet balance at time of action' }),
    __metadata("design:type", Number)
], DefaulterHistoryEntryDto.prototype, "balanceAtAction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether it was manual or automatic' }),
    __metadata("design:type", Boolean)
], DefaulterHistoryEntryDto.prototype, "isManual", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin ID if manual action', required: false }),
    __metadata("design:type", String)
], DefaulterHistoryEntryDto.prototype, "adminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for action', required: false }),
    __metadata("design:type", String)
], DefaulterHistoryEntryDto.prototype, "reason", void 0);
class DefaulterHistoryDto {
}
exports.DefaulterHistoryDto = DefaulterHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of defaulter history entries' }),
    __metadata("design:type", Array)
], DefaulterHistoryDto.prototype, "history", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total entries' }),
    __metadata("design:type", Number)
], DefaulterHistoryDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page' }),
    __metadata("design:type", Number)
], DefaulterHistoryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total pages' }),
    __metadata("design:type", Number)
], DefaulterHistoryDto.prototype, "totalPages", void 0);
class DefaulterListResponseDto {
}
exports.DefaulterListResponseDto = DefaulterListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], DefaulterListResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], DefaulterListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Defaulters retrieved successfully' }),
    __metadata("design:type", String)
], DefaulterListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => DefaulterSummaryDto }),
    __metadata("design:type", DefaulterSummaryDto)
], DefaulterListResponseDto.prototype, "data", void 0);
class DefaulterDetailsResponseDto {
}
exports.DefaulterDetailsResponseDto = DefaulterDetailsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], DefaulterDetailsResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], DefaulterDetailsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Defaulter details retrieved successfully' }),
    __metadata("design:type", String)
], DefaulterDetailsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => DefaulterDetailsDto }),
    __metadata("design:type", DefaulterDetailsDto)
], DefaulterDetailsResponseDto.prototype, "data", void 0);
class CheckDefaultersApiResponseDto {
}
exports.CheckDefaultersApiResponseDto = CheckDefaultersApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], CheckDefaultersApiResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], CheckDefaultersApiResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Defaulter check completed' }),
    __metadata("design:type", String)
], CheckDefaultersApiResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => CheckDefaultersResponseDto }),
    __metadata("design:type", CheckDefaultersResponseDto)
], CheckDefaultersApiResponseDto.prototype, "data", void 0);
class ManualActionResponseDto {
}
exports.ManualActionResponseDto = ManualActionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], ManualActionResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ManualActionResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Action completed successfully' }),
    __metadata("design:type", String)
], ManualActionResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ManualActionResponseDto.prototype, "data", void 0);
class DefaulterHistoryResponseDto {
}
exports.DefaulterHistoryResponseDto = DefaulterHistoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    __metadata("design:type", Number)
], DefaulterHistoryResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], DefaulterHistoryResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Defaulter history retrieved successfully' }),
    __metadata("design:type", String)
], DefaulterHistoryResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => DefaulterHistoryDto }),
    __metadata("design:type", DefaulterHistoryDto)
], DefaulterHistoryResponseDto.prototype, "data", void 0);
//# sourceMappingURL=defaulter.dto.js.map
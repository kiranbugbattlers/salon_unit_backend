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
exports.AdminTransactionHistoryResponseDto = exports.DayWiseAdminTransactionHistoryDto = exports.AdminTransactionHistoryItemDto = exports.SettlementType = exports.TransactionStatus = exports.TransactionType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var TransactionType;
(function (TransactionType) {
    TransactionType["CREDIT"] = "CREDIT";
    TransactionType["DEBIT"] = "DEBIT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["SUCCESS"] = "SUCCESS";
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["FAILED"] = "FAILED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var SettlementType;
(function (SettlementType) {
    SettlementType["DAILY"] = "DAILY";
    SettlementType["WEEKLY"] = "WEEKLY";
    SettlementType["MONTHLY"] = "MONTHLY";
})(SettlementType || (exports.SettlementType = SettlementType = {}));
class AdminTransactionHistoryItemDto {
}
exports.AdminTransactionHistoryItemDto = AdminTransactionHistoryItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique transaction ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "businessOwnerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shop ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction date & time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], AdminTransactionHistoryItemDto.prototype, "transactionDateTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Previous balance before transaction' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminTransactionHistoryItemDto.prototype, "previousBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction amount (+ / -)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminTransactionHistoryItemDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current balance after transaction' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminTransactionHistoryItemDto.prototype, "currentBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TransactionType, description: 'Transaction type: Credit/Debit' }),
    (0, class_validator_1.IsEnum)(TransactionType),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TransactionStatus, description: 'Transaction status: Success/Pending/Failed' }),
    (0, class_validator_1.IsEnum)(TransactionStatus),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction remark' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminTransactionHistoryItemDto.prototype, "commissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission percentage' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminTransactionHistoryItemDto.prototype, "commissionPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdminTransactionHistoryItemDto.prototype, "settlementAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SettlementType, description: 'Settlement type: Daily/Weekly/Monthly' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SettlementType),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "settlementType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related booking ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "relatedBookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created by admin ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "createdByAdminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission related booking ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "commissionRelatedBookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TransactionStatus),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "commissionStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission settlement date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], AdminTransactionHistoryItemDto.prototype, "commissionSettlementDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission remarks' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminTransactionHistoryItemDto.prototype, "commissionremarks", void 0);
class DayWiseAdminTransactionHistoryDto {
}
exports.DayWiseAdminTransactionHistoryDto = DayWiseAdminTransactionHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date for which transactions are grouped' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], DayWiseAdminTransactionHistoryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of transactions for the day' }),
    __metadata("design:type", Array)
], DayWiseAdminTransactionHistoryDto.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total credit amount for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseAdminTransactionHistoryDto.prototype, "totalCredit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total debit amount for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseAdminTransactionHistoryDto.prototype, "totalDebit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission amount for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseAdminTransactionHistoryDto.prototype, "totalCommission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total settlement amount for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseAdminTransactionHistoryDto.prototype, "totalSettlement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net amount for the day (Credit - Debit)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseAdminTransactionHistoryDto.prototype, "netAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of transactions for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseAdminTransactionHistoryDto.prototype, "transactionCount", void 0);
class AdminTransactionHistoryResponseDto {
}
exports.AdminTransactionHistoryResponseDto = AdminTransactionHistoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of all business owners with transactions' }),
    __metadata("design:type", Array)
], AdminTransactionHistoryResponseDto.prototype, "businessOwners", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overall totals across all business owners' }),
    __metadata("design:type", Object)
], AdminTransactionHistoryResponseDto.prototype, "overallTotals", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter parameters used' }),
    __metadata("design:type", Object)
], AdminTransactionHistoryResponseDto.prototype, "filters", void 0);
//# sourceMappingURL=admin-transaction-history.dto.js.map
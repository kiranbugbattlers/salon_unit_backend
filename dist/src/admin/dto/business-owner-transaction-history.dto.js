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
exports.TransactionSummaryDto = exports.UpdateTransactionRemarkDto = exports.BusinessOwnerTransactionResponseDto = exports.BusinessOwnerTransactionHistoryQueryDto = exports.SortByEnum = exports.SortOrderEnum = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var SortOrderEnum;
(function (SortOrderEnum) {
    SortOrderEnum["ASC"] = "ASC";
    SortOrderEnum["DESC"] = "DESC";
})(SortOrderEnum || (exports.SortOrderEnum = SortOrderEnum = {}));
var SortByEnum;
(function (SortByEnum) {
    SortByEnum["CREATED_AT"] = "createdAt";
    SortByEnum["AMOUNT"] = "amount";
    SortByEnum["TYPE"] = "type";
    SortByEnum["CATEGORY"] = "category";
})(SortByEnum || (exports.SortByEnum = SortByEnum = {}));
class BusinessOwnerTransactionHistoryQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'DESC';
    }
}
exports.BusinessOwnerTransactionHistoryQueryDto = BusinessOwnerTransactionHistoryQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by transaction type',
        enum: ['credit', 'debit'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['credit', 'debit']),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by transaction category',
        enum: ['booking_payment', 'commission', 'commission_payment', 'settlement', 'reward_points', 'refund', 'adjustment', 'withdrawal'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['booking_payment', 'commission', 'commission_payment', 'settlement', 'reward_points', 'refund', 'adjustment', 'withdrawal']),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by transaction status',
        enum: ['pending', 'completed', 'failed', 'reversed'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['pending', 'completed', 'failed', 'reversed']),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by business owner ID',
        example: 'uuid',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryQueryDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by start date (YYYY-MM-DD)',
        example: '2024-01-01',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by end date (YYYY-MM-DD)',
        example: '2024-12-31',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryQueryDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search by description or remark',
        example: 'booking',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number for pagination',
        example: 1,
        default: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BusinessOwnerTransactionHistoryQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of items per page',
        example: 20,
        default: 20,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], BusinessOwnerTransactionHistoryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort field',
        enum: ['createdAt', 'amount', 'type', 'category'],
        default: 'createdAt',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort order',
        enum: ['ASC', 'DESC'],
        default: 'DESC',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['ASC', 'DESC'], { message: 'sortOrder must be either ASC or DESC' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryQueryDto.prototype, "sortOrder", void 0);
class BusinessOwnerTransactionResponseDto {
}
exports.BusinessOwnerTransactionResponseDto = BusinessOwnerTransactionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction ID' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date & Time of transaction' }),
    __metadata("design:type", Date)
], BusinessOwnerTransactionResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction description' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Previous balance before transaction' }),
    __metadata("design:type", Number)
], BusinessOwnerTransactionResponseDto.prototype, "previousBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction amount (positive for credit, negative for debit)' }),
    __metadata("design:type", Number)
], BusinessOwnerTransactionResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current balance after transaction' }),
    __metadata("design:type", Number)
], BusinessOwnerTransactionResponseDto.prototype, "currentBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique transaction ID' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionResponseDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction type (Credit/Debit)' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionResponseDto.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction status' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction remark' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionResponseDto.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction category' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related booking ID' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionResponseDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related payment ID' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionResponseDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related settlement ID' }),
    __metadata("design:type", String)
], BusinessOwnerTransactionResponseDto.prototype, "settlementId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business Owner Information' }),
    __metadata("design:type", Object)
], BusinessOwnerTransactionResponseDto.prototype, "businessOwner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Wallet Information' }),
    __metadata("design:type", Object)
], BusinessOwnerTransactionResponseDto.prototype, "wallet", void 0);
class UpdateTransactionRemarkDto {
}
exports.UpdateTransactionRemarkDto = UpdateTransactionRemarkDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction remark' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionRemarkDto.prototype, "remark", void 0);
class TransactionSummaryDto {
}
exports.TransactionSummaryDto = TransactionSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total credits amount' }),
    __metadata("design:type", Number)
], TransactionSummaryDto.prototype, "totalCredits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total debits amount' }),
    __metadata("design:type", Number)
], TransactionSummaryDto.prototype, "totalDebits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net balance change' }),
    __metadata("design:type", Number)
], TransactionSummaryDto.prototype, "netBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of transactions' }),
    __metadata("design:type", Number)
], TransactionSummaryDto.prototype, "totalTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Successful transactions count' }),
    __metadata("design:type", Number)
], TransactionSummaryDto.prototype, "successfulTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pending transactions count' }),
    __metadata("design:type", Number)
], TransactionSummaryDto.prototype, "pendingTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failed transactions count' }),
    __metadata("design:type", Number)
], TransactionSummaryDto.prototype, "failedTransactions", void 0);
//# sourceMappingURL=business-owner-transaction-history.dto.js.map
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
exports.CustomerTransactionHistoryResponseDto = exports.DayWiseTransactionHistoryDto = exports.TransactionHistoryItemDto = exports.PaymentMethod = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["ONLINE"] = "ONLINE";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
class TransactionHistoryItemDto {
}
exports.TransactionHistoryItemDto = TransactionHistoryItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique booking ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionHistoryItemDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionHistoryItemDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total booking amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TransactionHistoryItemDto.prototype, "bookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PaymentMethod, description: 'Payment method' }),
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], TransactionHistoryItemDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking date & time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], TransactionHistoryItemDto.prototype, "bookingDateTime", void 0);
class DayWiseTransactionHistoryDto {
}
exports.DayWiseTransactionHistoryDto = DayWiseTransactionHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date for which transactions are grouped' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], DayWiseTransactionHistoryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of transactions for the day' }),
    __metadata("design:type", Array)
], DayWiseTransactionHistoryDto.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseTransactionHistoryDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of transactions for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseTransactionHistoryDto.prototype, "transactionCount", void 0);
class CustomerTransactionHistoryResponseDto {
}
exports.CustomerTransactionHistoryResponseDto = CustomerTransactionHistoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerTransactionHistoryResponseDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Day-wise transaction history' }),
    __metadata("design:type", Array)
], CustomerTransactionHistoryResponseDto.prototype, "dayWiseHistory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount across all periods' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CustomerTransactionHistoryResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of transactions' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CustomerTransactionHistoryResponseDto.prototype, "totalTransactions", void 0);
//# sourceMappingURL=customer-transaction-history.dto.js.map
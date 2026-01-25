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
exports.BusinessOwnerTransactionHistoryResponseDto = exports.SettlementItemDto = exports.BusinessOwnerTransactionItemDto = exports.SettlementStatus = exports.PaymentMethod = exports.BusinessOwnerTransactionStatus = exports.BusinessOwnerTransactionType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var BusinessOwnerTransactionType;
(function (BusinessOwnerTransactionType) {
    BusinessOwnerTransactionType["CREDIT"] = "credit";
    BusinessOwnerTransactionType["DEBIT"] = "debit";
})(BusinessOwnerTransactionType || (exports.BusinessOwnerTransactionType = BusinessOwnerTransactionType = {}));
var BusinessOwnerTransactionStatus;
(function (BusinessOwnerTransactionStatus) {
    BusinessOwnerTransactionStatus["PENDING"] = "pending";
    BusinessOwnerTransactionStatus["COMPLETED"] = "completed";
    BusinessOwnerTransactionStatus["FAILED"] = "failed";
    BusinessOwnerTransactionStatus["CANCELLED"] = "cancelled";
})(BusinessOwnerTransactionStatus || (exports.BusinessOwnerTransactionStatus = BusinessOwnerTransactionStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["ONLINE"] = "online";
    PaymentMethod["UPI"] = "upi";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["PENDING"] = "pending";
    SettlementStatus["PROCESSING"] = "processing";
    SettlementStatus["COMPLETED"] = "completed";
    SettlementStatus["FAILED"] = "failed";
    SettlementStatus["REQUIRES_PAYMENT"] = "requires_payment";
    SettlementStatus["PAYMENT_RECEIVED"] = "payment_received";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
class BusinessOwnerTransactionItemDto {
}
exports.BusinessOwnerTransactionItemDto = BusinessOwnerTransactionItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction date & time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], BusinessOwnerTransactionItemDto.prototype, "transactionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOwnerTransactionItemDto.prototype, "transactionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BusinessOwnerTransactionType, description: 'Transaction type' }),
    (0, class_validator_1.IsEnum)(BusinessOwnerTransactionType),
    __metadata("design:type", String)
], BusinessOwnerTransactionItemDto.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Previous balance before transaction' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOwnerTransactionItemDto.prototype, "previousBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Remaining balance after transaction' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOwnerTransactionItemDto.prototype, "remainingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BusinessOwnerTransactionStatus, description: 'Transaction status' }),
    (0, class_validator_1.IsEnum)(BusinessOwnerTransactionStatus),
    __metadata("design:type", String)
], BusinessOwnerTransactionItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PaymentMethod, description: 'Payment method' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], BusinessOwnerTransactionItemDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction remarks' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionItemDto.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related booking ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionItemDto.prototype, "relatedBookingId", void 0);
class SettlementItemDto {
}
exports.SettlementItemDto = SettlementItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettlementItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement month (YYYY-MM)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettlementItemDto.prototype, "settlementMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total booking amount for the month' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SettlementItemDto.prototype, "totalBookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission amount for the month' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SettlementItemDto.prototype, "totalCommissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net amount payable to business owner' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SettlementItemDto.prototype, "netPayableToBusinessOwner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total COD amount collected by business owner' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SettlementItemDto.prototype, "totalCODAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total online payment amount collected by company' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SettlementItemDto.prototype, "totalOnlineAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of bookings included in settlement' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SettlementItemDto.prototype, "bookingCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SettlementStatus, description: 'Settlement status' }),
    (0, class_validator_1.IsEnum)(SettlementStatus),
    __metadata("design:type", String)
], SettlementItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay payout ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettlementItemDto.prototype, "razorpayPayoutId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When payout was initiated' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], SettlementItemDto.prototype, "payoutInitiatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When payout was completed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], SettlementItemDto.prototype, "payoutCompletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failure reason if payout failed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettlementItemDto.prototype, "failureReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payout status from Razorpay' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettlementItemDto.prototype, "payoutStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payout mode (IMPS, NEFT, etc.)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettlementItemDto.prototype, "payoutMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payout UTR number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettlementItemDto.prototype, "payoutUtr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes from admin' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettlementItemDto.prototype, "adminNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], SettlementItemDto.prototype, "createdAt", void 0);
class BusinessOwnerTransactionHistoryResponseDto {
}
exports.BusinessOwnerTransactionHistoryResponseDto = BusinessOwnerTransactionHistoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "businessOwnerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shop ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction history' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settlement history' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "settlements", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current balance' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "currentBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total credit amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "totalCredit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total debit amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "totalDebit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total settlements received' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "totalSettlementsReceived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total pending settlements' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "totalPendingSettlements", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of transactions' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "totalTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter parameters used' }),
    __metadata("design:type", Object)
], BusinessOwnerTransactionHistoryResponseDto.prototype, "filters", void 0);
//# sourceMappingURL=business-owner-transaction-history.dto.js.map
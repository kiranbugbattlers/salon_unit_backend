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
exports.UserBookingHistoryResponseDto = exports.DayWiseUserBookingHistoryDto = exports.UserBookingHistoryItemDto = exports.PaymentMethod = exports.BookingStatus = exports.VendorPaymentStatus = exports.BookingPaymentStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var BookingPaymentStatus;
(function (BookingPaymentStatus) {
    BookingPaymentStatus["PENDING"] = "pending";
    BookingPaymentStatus["PAID"] = "paid";
    BookingPaymentStatus["REFUNDED"] = "refunded";
    BookingPaymentStatus["PARTIALLY_PAID"] = "partially_paid";
})(BookingPaymentStatus || (exports.BookingPaymentStatus = BookingPaymentStatus = {}));
var VendorPaymentStatus;
(function (VendorPaymentStatus) {
    VendorPaymentStatus["PENDING"] = "pending";
    VendorPaymentStatus["PAID"] = "paid";
    VendorPaymentStatus["OVERDUE"] = "overdue";
    VendorPaymentStatus["PARTIALLY_PAID"] = "partially_paid";
})(VendorPaymentStatus || (exports.VendorPaymentStatus = VendorPaymentStatus = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["COMPLETED"] = "completed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["NO_SHOW"] = "no_show";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["ONLINE"] = "online";
    PaymentMethod["UPI"] = "upi";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
class UserBookingHistoryItemDto {
}
exports.UserBookingHistoryItemDto = UserBookingHistoryItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking history ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserBookingHistoryItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserBookingHistoryItemDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserBookingHistoryItemDto.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User mobile number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserBookingHistoryItemDto.prototype, "userMobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserBookingHistoryItemDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking date and time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], UserBookingHistoryItemDto.prototype, "bookingDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserBookingHistoryItemDto.prototype, "bookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BookingPaymentStatus, description: 'Payment status' }),
    (0, class_validator_1.IsEnum)(BookingPaymentStatus),
    __metadata("design:type", String)
], UserBookingHistoryItemDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PaymentMethod, description: 'Payment method' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], UserBookingHistoryItemDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: VendorPaymentStatus, description: 'Vendor payment status' }),
    (0, class_validator_1.IsEnum)(VendorPaymentStatus),
    __metadata("design:type", String)
], UserBookingHistoryItemDto.prototype, "vendorPaymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount paid to vendor' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserBookingHistoryItemDto.prototype, "vendorPaidAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vendor payment date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], UserBookingHistoryItemDto.prototype, "vendorPaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Commission amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserBookingHistoryItemDto.prototype, "commissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vendor earning amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserBookingHistoryItemDto.prototype, "vendorEarning", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BookingStatus, description: 'Booking status' }),
    (0, class_validator_1.IsEnum)(BookingStatus),
    __metadata("design:type", String)
], UserBookingHistoryItemDto.prototype, "bookingStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking remarks' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserBookingHistoryItemDto.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment details' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserBookingHistoryItemDto.prototype, "paymentDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], UserBookingHistoryItemDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], UserBookingHistoryItemDto.prototype, "updatedAt", void 0);
class DayWiseUserBookingHistoryDto {
}
exports.DayWiseUserBookingHistoryDto = DayWiseUserBookingHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date for which bookings are grouped' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], DayWiseUserBookingHistoryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of bookings for the day' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], DayWiseUserBookingHistoryDto.prototype, "bookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total booking amount for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseUserBookingHistoryDto.prototype, "totalBookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission amount for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseUserBookingHistoryDto.prototype, "totalCommissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total vendor earning for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseUserBookingHistoryDto.prototype, "totalVendorEarning", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total paid bookings for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseUserBookingHistoryDto.prototype, "totalPaidBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total completed bookings for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseUserBookingHistoryDto.prototype, "totalCompletedBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of bookings for the day' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DayWiseUserBookingHistoryDto.prototype, "bookingCount", void 0);
class UserBookingHistoryResponseDto {
}
exports.UserBookingHistoryResponseDto = UserBookingHistoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserBookingHistoryResponseDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserBookingHistoryResponseDto.prototype, "businessOwnerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shop ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserBookingHistoryResponseDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserBookingHistoryResponseDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Day-wise booking history' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UserBookingHistoryResponseDto.prototype, "dayWiseHistory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total booking amount across all periods' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserBookingHistoryResponseDto.prototype, "totalBookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission amount across all periods' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserBookingHistoryResponseDto.prototype, "totalCommissionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total vendor earning across all periods' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserBookingHistoryResponseDto.prototype, "totalVendorEarning", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of bookings' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserBookingHistoryResponseDto.prototype, "totalBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total paid bookings' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserBookingHistoryResponseDto.prototype, "totalPaidBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total completed bookings' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserBookingHistoryResponseDto.prototype, "totalCompletedBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter parameters used' }),
    __metadata("design:type", Object)
], UserBookingHistoryResponseDto.prototype, "filters", void 0);
//# sourceMappingURL=user-booking-history.dto.js.map
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
exports.BusinessPerformanceReportResponseDto = exports.BusinessPerformanceReportDataDto = exports.BusinessReportSummaryDto = exports.BusinessPerformanceDto = exports.BusinessContactDto = exports.BusinessPerformanceMetricsDto = exports.BusinessPerformanceReportQueryDto = exports.AdminAnalyticsQueryDto = exports.BookingAnalyticsResponseDto = exports.BookingAnalyticsDto = exports.AdminBookingRequestResponseDto = exports.AdminBookingResponseDto = exports.AdminBookingRequestListResponseDto = exports.AdminBookingListResponseDto = exports.AdminBookingRequestDetailDto = exports.AdminBookingDetailDto = exports.AdminCommissionInfoDto = exports.AdminPaymentInfoDto = exports.AdminBookingServiceInfoDto = exports.AdminServiceInfoDto = exports.AdminStaffInfoDto = exports.AdminBusinessInfoDto = exports.AdminCustomerInfoDto = exports.ForceCompleteBookingDto = exports.ForceCancelBookingDto = exports.AdminBookingRequestQueryDto = exports.AdminBookingQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../common/enums");
const entities_1 = require("../../database/entities");
const class_transformer_1 = require("class-transformer");
class AdminBookingQueryDto {
}
exports.AdminBookingQueryDto = AdminBookingQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enums_1.BookingStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.BookingStatus),
    __metadata("design:type", String)
], AdminBookingQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminBookingQueryDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminBookingQueryDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminBookingQueryDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminBookingQueryDto.prototype, "dateFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-01-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminBookingQueryDto.prototype, "dateTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enums_1.ServiceLocation }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.ServiceLocation),
    __metadata("design:type", String)
], AdminBookingQueryDto.prototype, "serviceLocation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AdminBookingQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AdminBookingQueryDto.prototype, "limit", void 0);
class AdminBookingRequestQueryDto {
}
exports.AdminBookingRequestQueryDto = AdminBookingRequestQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: entities_1.BookingRequestStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(entities_1.BookingRequestStatus),
    __metadata("design:type", String)
], AdminBookingRequestQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminBookingRequestQueryDto.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminBookingRequestQueryDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminBookingRequestQueryDto.prototype, "dateFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-01-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminBookingRequestQueryDto.prototype, "dateTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AdminBookingRequestQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AdminBookingRequestQueryDto.prototype, "limit", void 0);
class ForceCancelBookingDto {
}
exports.ForceCancelBookingDto = ForceCancelBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Customer complaint - service quality issue' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ForceCancelBookingDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ForceCancelBookingDto.prototype, "refundRequired", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ForceCancelBookingDto.prototype, "notifyCustomer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ForceCancelBookingDto.prototype, "notifyBusinessOwner", void 0);
class ForceCompleteBookingDto {
}
exports.ForceCompleteBookingDto = ForceCompleteBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'OTP system failure - verified offline' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ForceCompleteBookingDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ForceCompleteBookingDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ForceCompleteBookingDto.prototype, "calculateCommission", void 0);
class AdminCustomerInfoDto {
}
exports.AdminCustomerInfoDto = AdminCustomerInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminCustomerInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminCustomerInfoDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminCustomerInfoDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminCustomerInfoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminCustomerInfoDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminCustomerInfoDto.prototype, "profilePic", void 0);
class AdminBusinessInfoDto {
}
exports.AdminBusinessInfoDto = AdminBusinessInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBusinessInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBusinessInfoDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBusinessInfoDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBusinessInfoDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBusinessInfoDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminBusinessInfoDto.prototype, "email", void 0);
class AdminStaffInfoDto {
}
exports.AdminStaffInfoDto = AdminStaffInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminStaffInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminStaffInfoDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminStaffInfoDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminStaffInfoDto.prototype, "profilePic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminStaffInfoDto.prototype, "phone", void 0);
class AdminServiceInfoDto {
}
exports.AdminServiceInfoDto = AdminServiceInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminServiceInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminServiceInfoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminServiceInfoDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AdminServiceInfoDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AdminServiceInfoDto.prototype, "defaultDuration", void 0);
class AdminBookingServiceInfoDto {
}
exports.AdminBookingServiceInfoDto = AdminBookingServiceInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingServiceInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingServiceInfoDto.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AdminBookingServiceInfoDto.prototype, "servicePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AdminBookingServiceInfoDto.prototype, "serviceDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AdminBookingServiceInfoDto.prototype, "isAddOn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AdminBookingServiceInfoDto.prototype, "addedAt", void 0);
class AdminPaymentInfoDto {
}
exports.AdminPaymentInfoDto = AdminPaymentInfoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminPaymentInfoDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminPaymentInfoDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminPaymentInfoDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], AdminPaymentInfoDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminPaymentInfoDto.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminPaymentInfoDto.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AdminPaymentInfoDto.prototype, "paymentCompletedAt", void 0);
class AdminCommissionInfoDto {
}
exports.AdminCommissionInfoDto = AdminCommissionInfoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminCommissionInfoDto.prototype, "commissionTransactionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], AdminCommissionInfoDto.prototype, "businessOwnerCommission", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], AdminCommissionInfoDto.prototype, "customerReward", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], AdminCommissionInfoDto.prototype, "commissionPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], AdminCommissionInfoDto.prototype, "rewardPercent", void 0);
class AdminBookingDetailDto {
}
exports.AdminBookingDetailDto = AdminBookingDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingDetailDto.prototype, "appointmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingDetailDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingDetailDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BookingStatus }),
    __metadata("design:type", String)
], AdminBookingDetailDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.ServiceLocation }),
    __metadata("design:type", String)
], AdminBookingDetailDto.prototype, "serviceLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AdminBookingDetailDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Delivery charge for at-home services' }),
    __metadata("design:type", Number)
], AdminBookingDetailDto.prototype, "deliveryCharge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Delivery distance in kilometers' }),
    __metadata("design:type", Number)
], AdminBookingDetailDto.prototype, "deliveryDistance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total cost of add-on services', default: 0 }),
    __metadata("design:type", Number)
], AdminBookingDetailDto.prototype, "addOnServicesTotal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment completed flag', default: false }),
    __metadata("design:type", Boolean)
], AdminBookingDetailDto.prototype, "paymentCompleted", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminBookingDetailDto.prototype, "specialRequests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service verification OTP' }),
    __metadata("design:type", String)
], AdminBookingDetailDto.prototype, "otpCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AdminBookingDetailDto.prototype, "otpVerifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AdminBookingDetailDto.prototype, "serviceStartedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AdminBookingDetailDto.prototype, "serviceCompletedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminBookingDetailDto.prototype, "cancellationReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AdminBookingDetailDto.prototype, "cancelledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminBookingDetailDto.prototype, "bookingRequestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AdminBookingDetailDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AdminBookingDetailDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", AdminCustomerInfoDto)
], AdminBookingDetailDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", AdminBusinessInfoDto)
], AdminBookingDetailDto.prototype, "business", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", AdminStaffInfoDto)
], AdminBookingDetailDto.prototype, "staff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", AdminServiceInfoDto)
], AdminBookingDetailDto.prototype, "service", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [AdminBookingServiceInfoDto], description: 'List of all services (original + add-ons)' }),
    __metadata("design:type", Array)
], AdminBookingDetailDto.prototype, "bookingServices", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", AdminPaymentInfoDto)
], AdminBookingDetailDto.prototype, "paymentInfo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", AdminCommissionInfoDto)
], AdminBookingDetailDto.prototype, "commissionInfo", void 0);
class AdminBookingRequestDetailDto {
}
exports.AdminBookingRequestDetailDto = AdminBookingRequestDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingRequestDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingRequestDetailDto.prototype, "requestedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingRequestDetailDto.prototype, "requestedStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingRequestDetailDto.prototype, "requestedEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: entities_1.BookingRequestStatus }),
    __metadata("design:type", String)
], AdminBookingRequestDetailDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AdminBookingRequestDetailDto.prototype, "totalEstimatedPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AdminBookingRequestDetailDto.prototype, "totalEstimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminBookingRequestDetailDto.prototype, "approvedStartTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminBookingRequestDetailDto.prototype, "approvedEndTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], AdminBookingRequestDetailDto.prototype, "finalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Arrival verification OTP' }),
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminBookingRequestDetailDto.prototype, "arrivalOtp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AdminBookingRequestDetailDto.prototype, "arrivalOtpGeneratedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AdminBookingRequestDetailDto.prototype, "arrivalOtpVerifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminBookingRequestDetailDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminBookingRequestDetailDto.prototype, "businessNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AdminBookingRequestDetailDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AdminBookingRequestDetailDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", AdminCustomerInfoDto)
], AdminBookingRequestDetailDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", AdminBusinessInfoDto)
], AdminBookingRequestDetailDto.prototype, "business", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", AdminStaffInfoDto)
], AdminBookingRequestDetailDto.prototype, "requestedStaff", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", AdminStaffInfoDto)
], AdminBookingRequestDetailDto.prototype, "assignedStaff", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], AdminBookingRequestDetailDto.prototype, "services", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AdminBookingRequestDetailDto.prototype, "confirmedBookingId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", AdminPaymentInfoDto)
], AdminBookingRequestDetailDto.prototype, "paymentInfo", void 0);
class AdminBookingListResponseDto {
}
exports.AdminBookingListResponseDto = AdminBookingListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AdminBookingListResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AdminBookingListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AdminBookingDetailDto] }),
    __metadata("design:type", Array)
], AdminBookingListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], AdminBookingListResponseDto.prototype, "meta", void 0);
class AdminBookingRequestListResponseDto {
}
exports.AdminBookingRequestListResponseDto = AdminBookingRequestListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AdminBookingRequestListResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AdminBookingRequestListResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingRequestListResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AdminBookingRequestDetailDto] }),
    __metadata("design:type", Array)
], AdminBookingRequestListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], AdminBookingRequestListResponseDto.prototype, "meta", void 0);
class AdminBookingResponseDto {
}
exports.AdminBookingResponseDto = AdminBookingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AdminBookingResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AdminBookingResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", AdminBookingDetailDto)
], AdminBookingResponseDto.prototype, "data", void 0);
class AdminBookingRequestResponseDto {
}
exports.AdminBookingRequestResponseDto = AdminBookingRequestResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AdminBookingRequestResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AdminBookingRequestResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AdminBookingRequestResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", AdminBookingRequestDetailDto)
], AdminBookingRequestResponseDto.prototype, "data", void 0);
class BookingAnalyticsDto {
}
exports.BookingAnalyticsDto = BookingAnalyticsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingAnalyticsDto.prototype, "totalBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], BookingAnalyticsDto.prototype, "byStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], BookingAnalyticsDto.prototype, "byPaymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingAnalyticsDto.prototype, "averageBookingValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingAnalyticsDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingAnalyticsDto.prototype, "totalCommission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingAnalyticsDto.prototype, "completionRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingAnalyticsDto.prototype, "cancellationRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], BookingAnalyticsDto.prototype, "topBusinesses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], BookingAnalyticsDto.prototype, "topCustomers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], BookingAnalyticsDto.prototype, "bookingsByDay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], BookingAnalyticsDto.prototype, "revenueByDay", void 0);
class BookingAnalyticsResponseDto {
}
exports.BookingAnalyticsResponseDto = BookingAnalyticsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BookingAnalyticsResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BookingAnalyticsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BookingAnalyticsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", BookingAnalyticsDto)
], BookingAnalyticsResponseDto.prototype, "data", void 0);
class AdminAnalyticsQueryDto {
}
exports.AdminAnalyticsQueryDto = AdminAnalyticsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminAnalyticsQueryDto.prototype, "dateFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-01-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminAnalyticsQueryDto.prototype, "dateTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminAnalyticsQueryDto.prototype, "businessOwnerId", void 0);
class BusinessPerformanceReportQueryDto {
}
exports.BusinessPerformanceReportQueryDto = BusinessPerformanceReportQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['daily', 'monthly'], example: 'monthly', description: 'Type of report to generate' }),
    (0, class_validator_1.IsEnum)(['daily', 'monthly']),
    __metadata("design:type", String)
], BusinessPerformanceReportQueryDto.prototype, "reportType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-01', description: 'Start date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BusinessPerformanceReportQueryDto.prototype, "dateFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-31', description: 'End date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BusinessPerformanceReportQueryDto.prototype, "dateTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by specific business (shopId or businessId)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BusinessPerformanceReportQueryDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['revenue', 'bookings', 'commission', 'businessName'], default: 'revenue' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['revenue', 'bookings', 'commission', 'businessName']),
    __metadata("design:type", String)
], BusinessPerformanceReportQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['asc', 'desc'], default: 'desc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], BusinessPerformanceReportQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BusinessPerformanceReportQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BusinessPerformanceReportQueryDto.prototype, "limit", void 0);
class BusinessPerformanceMetricsDto {
}
exports.BusinessPerformanceMetricsDto = BusinessPerformanceMetricsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of bookings in period' }),
    __metadata("design:type", Number)
], BusinessPerformanceMetricsDto.prototype, "totalBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of completed bookings' }),
    __metadata("design:type", Number)
], BusinessPerformanceMetricsDto.prototype, "completedBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of cancelled bookings' }),
    __metadata("design:type", Number)
], BusinessPerformanceMetricsDto.prototype, "cancelledBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total revenue from completed bookings' }),
    __metadata("design:type", Number)
], BusinessPerformanceMetricsDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission earned' }),
    __metadata("design:type", Number)
], BusinessPerformanceMetricsDto.prototype, "totalCommission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average value per completed booking' }),
    __metadata("design:type", Number)
], BusinessPerformanceMetricsDto.prototype, "averageBookingValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Percentage of bookings completed (0-1)' }),
    __metadata("design:type", Number)
], BusinessPerformanceMetricsDto.prototype, "completionRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Percentage of bookings cancelled (0-1)' }),
    __metadata("design:type", Number)
], BusinessPerformanceMetricsDto.prototype, "cancellationRate", void 0);
class BusinessContactDto {
}
exports.BusinessContactDto = BusinessContactDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], BusinessContactDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], BusinessContactDto.prototype, "phone", void 0);
class BusinessPerformanceDto {
}
exports.BusinessPerformanceDto = BusinessPerformanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner UUID' }),
    __metadata("design:type", String)
], BusinessPerformanceDto.prototype, "businessId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique shop identifier' }),
    __metadata("design:type", String)
], BusinessPerformanceDto.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business name' }),
    __metadata("design:type", String)
], BusinessPerformanceDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report period (YYYY-MM for monthly, YYYY-MM-DD for daily)' }),
    __metadata("design:type", String)
], BusinessPerformanceDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BusinessPerformanceMetricsDto }),
    __metadata("design:type", BusinessPerformanceMetricsDto)
], BusinessPerformanceDto.prototype, "metrics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BusinessContactDto }),
    __metadata("design:type", BusinessContactDto)
], BusinessPerformanceDto.prototype, "contact", void 0);
class BusinessReportSummaryDto {
}
exports.BusinessReportSummaryDto = BusinessReportSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of unique businesses in report' }),
    __metadata("design:type", Number)
], BusinessReportSummaryDto.prototype, "totalBusinesses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total bookings across all businesses' }),
    __metadata("design:type", Number)
], BusinessReportSummaryDto.prototype, "totalBookings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total revenue across all businesses' }),
    __metadata("design:type", Number)
], BusinessReportSummaryDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission across all businesses' }),
    __metadata("design:type", Number)
], BusinessReportSummaryDto.prototype, "totalCommission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average revenue per business' }),
    __metadata("design:type", Number)
], BusinessReportSummaryDto.prototype, "averageRevenuePerBusiness", void 0);
class BusinessPerformanceReportDataDto {
}
exports.BusinessPerformanceReportDataDto = BusinessPerformanceReportDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['daily', 'monthly'] }),
    __metadata("design:type", String)
], BusinessPerformanceReportDataDto.prototype, "reportType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'object', properties: { dateFrom: { type: 'string' }, dateTo: { type: 'string' } } }),
    __metadata("design:type", Object)
], BusinessPerformanceReportDataDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BusinessReportSummaryDto }),
    __metadata("design:type", BusinessReportSummaryDto)
], BusinessPerformanceReportDataDto.prototype, "summary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BusinessPerformanceDto] }),
    __metadata("design:type", Array)
], BusinessPerformanceReportDataDto.prototype, "businesses", void 0);
class BusinessPerformanceReportResponseDto {
}
exports.BusinessPerformanceReportResponseDto = BusinessPerformanceReportResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], BusinessPerformanceReportResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], BusinessPerformanceReportResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], BusinessPerformanceReportResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: BusinessPerformanceReportDataDto }),
    __metadata("design:type", BusinessPerformanceReportDataDto)
], BusinessPerformanceReportResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], BusinessPerformanceReportResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=admin-booking.dto.js.map
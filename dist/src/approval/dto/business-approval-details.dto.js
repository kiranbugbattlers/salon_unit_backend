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
exports.UpdateBusinessApprovalDto = exports.BusinessApprovalListDto = exports.BusinessApprovalDetailsDto = exports.BusinessInfoDto = exports.BusinessOwnerInfoDto = exports.ReviewDto = exports.BankingInfoDto = exports.BusinessDocumentDto = exports.BusinessOperatingHoursDto = exports.BusinessAddressDto = exports.BusinessMediaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class BusinessMediaDto {
}
exports.BusinessMediaDto = BusinessMediaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Media ID' }),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Media URL' }),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Media type', enum: ['image', 'video', 'document'] }),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Media description' }),
    __metadata("design:type", String)
], BusinessMediaDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is primary media' }),
    __metadata("design:type", Boolean)
], BusinessMediaDto.prototype, "isPrimary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at' }),
    __metadata("design:type", Date)
], BusinessMediaDto.prototype, "createdAt", void 0);
class BusinessAddressDto {
}
exports.BusinessAddressDto = BusinessAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Address ID' }),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Street address' }),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "streetAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'City' }),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State' }),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pincode' }),
    __metadata("design:type", String)
], BusinessAddressDto.prototype, "pincode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Latitude' }),
    __metadata("design:type", Number)
], BusinessAddressDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Longitude' }),
    __metadata("design:type", Number)
], BusinessAddressDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is primary address' }),
    __metadata("design:type", Boolean)
], BusinessAddressDto.prototype, "isPrimary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is active' }),
    __metadata("design:type", Boolean)
], BusinessAddressDto.prototype, "isActive", void 0);
class BusinessOperatingHoursDto {
}
exports.BusinessOperatingHoursDto = BusinessOperatingHoursDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Day of week' }),
    __metadata("design:type", String)
], BusinessOperatingHoursDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Opening time' }),
    __metadata("design:type", String)
], BusinessOperatingHoursDto.prototype, "openingTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Closing time' }),
    __metadata("design:type", String)
], BusinessOperatingHoursDto.prototype, "closingTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is open' }),
    __metadata("design:type", Boolean)
], BusinessOperatingHoursDto.prototype, "isOpen", void 0);
class BusinessDocumentDto {
}
exports.BusinessDocumentDto = BusinessDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document ID' }),
    __metadata("design:type", String)
], BusinessDocumentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document type' }),
    __metadata("design:type", String)
], BusinessDocumentDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document URL' }),
    __metadata("design:type", String)
], BusinessDocumentDto.prototype, "documentUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document status', enum: ['pending', 'verified', 'rejected'] }),
    __metadata("design:type", String)
], BusinessDocumentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rejection reason' }),
    __metadata("design:type", String)
], BusinessDocumentDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Uploaded at' }),
    __metadata("design:type", Date)
], BusinessDocumentDto.prototype, "uploadedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Verified at' }),
    __metadata("design:type", Date)
], BusinessDocumentDto.prototype, "verifiedAt", void 0);
class BankingInfoDto {
}
exports.BankingInfoDto = BankingInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Banking info ID' }),
    __metadata("design:type", String)
], BankingInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank name' }),
    __metadata("design:type", String)
], BankingInfoDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account holder name' }),
    __metadata("design:type", String)
], BankingInfoDto.prototype, "accountHolderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account number (clear)' }),
    __metadata("design:type", String)
], BankingInfoDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'IFSC code' }),
    __metadata("design:type", String)
], BankingInfoDto.prototype, "ifscCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Branch name' }),
    __metadata("design:type", String)
], BankingInfoDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is verified' }),
    __metadata("design:type", Boolean)
], BankingInfoDto.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at' }),
    __metadata("design:type", Date)
], BankingInfoDto.prototype, "createdAt", void 0);
class ReviewDto {
}
exports.ReviewDto = ReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Review ID' }),
    __metadata("design:type", String)
], ReviewDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name' }),
    __metadata("design:type", String)
], ReviewDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rating' }),
    __metadata("design:type", Number)
], ReviewDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Review comment' }),
    __metadata("design:type", String)
], ReviewDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Review date' }),
    __metadata("design:type", Date)
], ReviewDto.prototype, "reviewDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is verified purchase' }),
    __metadata("design:type", Boolean)
], ReviewDto.prototype, "isVerifiedPurchase", void 0);
class BusinessOwnerInfoDto {
}
exports.BusinessOwnerInfoDto = BusinessOwnerInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Owner ID' }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name' }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name' }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email (read-only)' }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mobile number (read-only)' }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business name' }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business description' }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "businessDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is approved' }),
    __metadata("design:type", Boolean)
], BusinessOwnerInfoDto.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approved at' }),
    __metadata("design:type", Date)
], BusinessOwnerInfoDto.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at' }),
    __metadata("design:type", Date)
], BusinessOwnerInfoDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UPI ID of the business owner',
        required: false
    }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "upiId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Credit limit assigned to the vendor',
        required: false
    }),
    __metadata("design:type", Number)
], BusinessOwnerInfoDto.prototype, "creditLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vendor status',
        required: false
    }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "vendorStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Alternate contact number for the business owner',
        required: false
    }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "alternateNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional remarks or notes about the business owner',
        required: false
    }),
    __metadata("design:type", String)
], BusinessOwnerInfoDto.prototype, "remark", void 0);
class BusinessInfoDto {
}
exports.BusinessInfoDto = BusinessInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business ID' }),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business name' }),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business description' }),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business category' }),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business phone' }),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business email' }),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Website' }),
    __metadata("design:type", String)
], BusinessInfoDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is active' }),
    __metadata("design:type", Boolean)
], BusinessInfoDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at' }),
    __metadata("design:type", Date)
], BusinessInfoDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at' }),
    __metadata("design:type", Date)
], BusinessInfoDto.prototype, "updatedAt", void 0);
class BusinessApprovalDetailsDto {
}
exports.BusinessApprovalDetailsDto = BusinessApprovalDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business owner information' }),
    __metadata("design:type", BusinessOwnerInfoDto)
], BusinessApprovalDetailsDto.prototype, "businessOwner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business information' }),
    __metadata("design:type", BusinessInfoDto)
], BusinessApprovalDetailsDto.prototype, "business", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business media' }),
    __metadata("design:type", Array)
], BusinessApprovalDetailsDto.prototype, "media", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business addresses' }),
    __metadata("design:type", Array)
], BusinessApprovalDetailsDto.prototype, "addresses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operating hours' }),
    __metadata("design:type", Array)
], BusinessApprovalDetailsDto.prototype, "operatingHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business documents' }),
    __metadata("design:type", Array)
], BusinessApprovalDetailsDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Banking information' }),
    __metadata("design:type", Array)
], BusinessApprovalDetailsDto.prototype, "bankingInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer reviews' }),
    __metadata("design:type", Array)
], BusinessApprovalDetailsDto.prototype, "reviews", void 0);
class BusinessApprovalListDto {
}
exports.BusinessApprovalListDto = BusinessApprovalListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business approval details' }),
    __metadata("design:type", Array)
], BusinessApprovalListDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pagination metadata' }),
    __metadata("design:type", Object)
], BusinessApprovalListDto.prototype, "meta", void 0);
class UpdateBusinessApprovalDto {
}
exports.UpdateBusinessApprovalDto = UpdateBusinessApprovalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "businessDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business phone', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "businessPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business email', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "businessEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Website', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business category', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "businessCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Street address', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "streetAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'City', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pincode', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "pincode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Latitude', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateBusinessApprovalDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Longitude', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateBusinessApprovalDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account holder name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "accountHolderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'IFSC code', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "ifscCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Branch name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approval status', required: false, enum: ['pending', 'approved', 'rejected'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['pending', 'approved', 'rejected']),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "approvalStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Review notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "reviewNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rejection reason', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UPI ID of the business owner',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "upiId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Credit limit assigned to the vendor',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateBusinessApprovalDto.prototype, "creditLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vendor status',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "vendorStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Alternate contact number for the business owner',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "alternateNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional remarks or notes about the business owner',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessApprovalDto.prototype, "remark", void 0);
//# sourceMappingURL=business-approval-details.dto.js.map
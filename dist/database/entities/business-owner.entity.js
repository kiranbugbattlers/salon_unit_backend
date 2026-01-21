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
exports.BusinessOwner = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("./user.entity");
const shop_id_util_1 = require("../../common/utils/shop-id.util");
const enums_1 = require("../../common/enums");
const vendor_status_enum_1 = require("../../common/enums/vendor-status.enum");
const business_owner_onboarding_entity_1 = require("./business-owner-onboarding.entity");
const business_address_entity_1 = require("./business-address.entity");
const business_approval_entity_1 = require("./business-approval.entity");
const business_service_entity_1 = require("./business-service.entity");
const service_package_entity_1 = require("./service-package.entity");
const staff_entity_1 = require("./staff.entity");
const banking_info_entity_1 = require("./banking-info.entity");
const review_entity_1 = require("./review.entity");
const business_document_entity_1 = require("./business-document.entity");
const business_media_entity_1 = require("./business-media.entity");
const vendor_due_payment_entity_1 = require("./vendor-due-payment.entity");
let BusinessOwner = class BusinessOwner {
    generateShopId() {
        if (!this.shopId) {
            this.shopId = (0, shop_id_util_1.generateShopId)();
        }
    }
    preserveVendorStatus() {
    }
};
exports.BusinessOwner = BusinessOwner;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessOwner.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], BusinessOwner.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique shop identifier with format SH-XXXXXX' }),
    (0, typeorm_1.Column)({ name: 'shop_id', length: 9, unique: true, nullable: true }),
    __metadata("design:type", String)
], BusinessOwner.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'first_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], BusinessOwner.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'last_name', length: 100, nullable: true }),
    __metadata("design:type", String)
], BusinessOwner.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.Gender, required: false }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.Gender,
        nullable: true,
    }),
    __metadata("design:type", String)
], BusinessOwner.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'date_of_birth', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], BusinessOwner.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'business_name', length: 200, nullable: true }),
    __metadata("design:type", String)
], BusinessOwner.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'business_description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessOwner.prototype, "businessDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'operating_years', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], BusinessOwner.prototype, "operatingYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'is_approved', default: false }),
    __metadata("design:type", Boolean)
], BusinessOwner.prototype, "isApproved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'approved_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BusinessOwner.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the business was marked as defaulter', required: false }),
    (0, typeorm_1.Column)({ name: 'is_defaulter', default: false }),
    __metadata("design:type", Boolean)
], BusinessOwner.prototype, "isDefaulter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the business was marked as defaulter', required: false }),
    (0, typeorm_1.Column)({ name: 'defaulter_since', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BusinessOwner.prototype, "defaulterSince", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the business is active' }),
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], BusinessOwner.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UPI ID for payments', required: false }),
    (0, typeorm_1.Column)({ name: 'upi_id', length: 50, nullable: true }),
    __metadata("design:type", String)
], BusinessOwner.prototype, "upiId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Credit limit assigned by admin', required: false }),
    (0, typeorm_1.Column)({ name: 'credit_limit', type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 }),
    __metadata("design:type", Number)
], BusinessOwner.prototype, "creditLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: vendor_status_enum_1.VendorStatus, description: 'Vendor status for service visibility' }),
    (0, typeorm_1.Column)({
        name: 'vendor_status',
        type: 'enum',
        enum: vendor_status_enum_1.VendorStatus,
        default: vendor_status_enum_1.VendorStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], BusinessOwner.prototype, "vendorStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessOwner.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessOwner.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.businessOwner),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], BusinessOwner.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_address_entity_1.BusinessAddress, (address) => address.businessOwner),
    __metadata("design:type", Array)
], BusinessOwner.prototype, "addresses", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => business_owner_onboarding_entity_1.BusinessOwnerOnboarding, (onboarding) => onboarding.businessOwner),
    __metadata("design:type", business_owner_onboarding_entity_1.BusinessOwnerOnboarding)
], BusinessOwner.prototype, "onboarding", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_approval_entity_1.BusinessApproval, (approval) => approval.businessOwner),
    __metadata("design:type", Array)
], BusinessOwner.prototype, "approvals", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_service_entity_1.BusinessService, (businessService) => businessService.businessOwner),
    __metadata("design:type", Array)
], BusinessOwner.prototype, "businessServices", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_package_entity_1.ServicePackage, (servicePackage) => servicePackage.businessOwner),
    __metadata("design:type", Array)
], BusinessOwner.prototype, "servicePackages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => staff_entity_1.Staff, (staff) => staff.businessOwner),
    __metadata("design:type", Array)
], BusinessOwner.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.businessOwner),
    __metadata("design:type", Array)
], BusinessOwner.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_media_entity_1.BusinessMedia, (media) => media.businessOwner),
    __metadata("design:type", Array)
], BusinessOwner.prototype, "media", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => banking_info_entity_1.BankingInfo, (bankingInfo) => bankingInfo.businessOwner),
    __metadata("design:type", banking_info_entity_1.BankingInfo)
], BusinessOwner.prototype, "bankingInfo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_document_entity_1.BusinessDocument, (document) => document.businessOwner),
    __metadata("design:type", Array)
], BusinessOwner.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vendor_due_payment_entity_1.VendorDuePayment, (duePayment) => duePayment.businessOwner),
    __metadata("design:type", Array)
], BusinessOwner.prototype, "duePayments", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessOwner.prototype, "generateShopId", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessOwner.prototype, "preserveVendorStatus", null);
exports.BusinessOwner = BusinessOwner = __decorate([
    (0, typeorm_1.Entity)('business_owner')
], BusinessOwner);
//# sourceMappingURL=business-owner.entity.js.map
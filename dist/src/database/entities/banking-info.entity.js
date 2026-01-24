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
exports.BankingInfo = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const business_owner_entity_1 = require("./business-owner.entity");
let BankingInfo = class BankingInfo {
};
exports.BankingInfo = BankingInfo;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BankingInfo.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_owner_id', unique: true }),
    __metadata("design:type", String)
], BankingInfo.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank account number', required: false }),
    (0, typeorm_1.Column)({ name: 'account_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], BankingInfo.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account holder name as per bank records', required: false }),
    (0, typeorm_1.Column)({ name: 'account_holder_name', length: 200, nullable: true }),
    __metadata("design:type", String)
], BankingInfo.prototype, "accountHolderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'IFSC code of the bank branch', required: false }),
    (0, typeorm_1.Column)({ name: 'ifsc_code', length: 11, nullable: true }),
    __metadata("design:type", String)
], BankingInfo.prototype, "ifscCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank name', required: false }),
    (0, typeorm_1.Column)({ name: 'bank_name', length: 200, nullable: true }),
    __metadata("design:type", String)
], BankingInfo.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bank branch name', required: false }),
    (0, typeorm_1.Column)({ name: 'branch', length: 200, nullable: true }),
    __metadata("design:type", String)
], BankingInfo.prototype, "branch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this banking info is verified' }),
    (0, typeorm_1.Column)({ name: 'is_verified', default: false }),
    __metadata("design:type", Boolean)
], BankingInfo.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the banking info was verified', required: false }),
    (0, typeorm_1.Column)({ name: 'verified_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BankingInfo.prototype, "verifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay contact ID', required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_contact_id', nullable: true }),
    __metadata("design:type", String)
], BankingInfo.prototype, "razorpayContactId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Razorpay fund account ID', required: false }),
    (0, typeorm_1.Column)({ name: 'razorpay_fund_account_id', nullable: true }),
    __metadata("design:type", String)
], BankingInfo.prototype, "razorpayFundAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fund account status', required: false }),
    (0, typeorm_1.Column)({ name: 'fund_account_status', nullable: true }),
    __metadata("design:type", String)
], BankingInfo.prototype, "fundAccountStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When fund account was created', required: false }),
    (0, typeorm_1.Column)({ name: 'fund_account_created_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BankingInfo.prototype, "fundAccountCreatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BankingInfo.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BankingInfo.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.bankingInfo),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], BankingInfo.prototype, "businessOwner", void 0);
exports.BankingInfo = BankingInfo = __decorate([
    (0, typeorm_1.Entity)('banking_info')
], BankingInfo);
//# sourceMappingURL=banking-info.entity.js.map
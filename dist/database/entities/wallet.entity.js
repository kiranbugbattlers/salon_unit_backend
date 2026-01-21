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
exports.Wallet = exports.WalletUserType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("./user.entity");
const wallet_transaction_entity_1 = require("./wallet-transaction.entity");
var WalletUserType;
(function (WalletUserType) {
    WalletUserType["CUSTOMER"] = "customer";
    WalletUserType["BUSINESS_OWNER"] = "business_owner";
})(WalletUserType || (exports.WalletUserType = WalletUserType = {}));
let Wallet = class Wallet {
};
exports.Wallet = Wallet;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Wallet.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID (references users table)' }),
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Wallet.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: WalletUserType, description: 'Type of user (customer or business_owner)' }),
    (0, typeorm_1.Column)({
        name: 'user_type',
        type: 'enum',
        enum: WalletUserType,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Wallet.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current wallet balance in INR' }),
    (0, typeorm_1.Column)({ name: 'balance', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Wallet.prototype, "balance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount earned (lifetime credits)' }),
    (0, typeorm_1.Column)({ name: 'total_earned', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Wallet.prototype, "totalEarned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount spent (lifetime debits)' }),
    (0, typeorm_1.Column)({ name: 'total_spent', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Wallet.prototype, "totalSpent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission paid by business owner to company' }),
    (0, typeorm_1.Column)({ name: 'total_commission_paid', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Wallet.prototype, "totalCommissionPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total commission/rewards received by customer from company' }),
    (0, typeorm_1.Column)({ name: 'total_commission_received', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Wallet.prototype, "totalCommissionReceived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether wallet is active' }),
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Wallet.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of last transaction', required: false }),
    (0, typeorm_1.Column)({ name: 'last_transaction_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Wallet.prototype, "lastTransactionAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Wallet.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Wallet.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Wallet.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => wallet_transaction_entity_1.WalletTransaction, (transaction) => transaction.wallet),
    __metadata("design:type", Array)
], Wallet.prototype, "transactions", void 0);
exports.Wallet = Wallet = __decorate([
    (0, typeorm_1.Entity)('wallets'),
    (0, typeorm_1.Index)(['userId', 'userType'], { unique: true }),
    (0, typeorm_1.Index)(['userType', 'isActive'])
], Wallet);
//# sourceMappingURL=wallet.entity.js.map
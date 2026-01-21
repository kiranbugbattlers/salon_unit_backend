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
exports.AdminActionAudit = exports.AdminActionType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const admin_entity_1 = require("./admin.entity");
var AdminActionType;
(function (AdminActionType) {
    AdminActionType["WALLET_ADJUSTMENT"] = "wallet_adjustment";
    AdminActionType["DEFAULTER_MARK"] = "defaulter_mark";
    AdminActionType["DEFAULTER_RESTORE"] = "defaulter_restore";
    AdminActionType["COMMISSION_CONFIG_CREATE"] = "commission_config_create";
    AdminActionType["SETTLEMENT_MANUAL_GENERATE"] = "settlement_manual_generate";
    AdminActionType["PAYOUT_PROCESS"] = "payout_process";
    AdminActionType["PAYOUT_MARK_PAID"] = "payout_mark_paid";
    AdminActionType["WALLET_FREEZE"] = "wallet_freeze";
    AdminActionType["WALLET_UNFREEZE"] = "wallet_unfreeze";
    AdminActionType["BANKING_INFO_VERIFY"] = "banking_info_verify";
    AdminActionType["TRANSACTION_REVERSE"] = "transaction_reverse";
})(AdminActionType || (exports.AdminActionType = AdminActionType = {}));
let AdminActionAudit = class AdminActionAudit {
};
exports.AdminActionAudit = AdminActionAudit;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AdminActionAudit.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin who performed the action' }),
    (0, typeorm_1.Column)({ name: 'admin_id' }),
    __metadata("design:type", String)
], AdminActionAudit.prototype, "adminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: AdminActionType, description: 'Type of action performed' }),
    (0, typeorm_1.Column)({
        name: 'action_type',
        type: 'enum',
        enum: AdminActionType,
    }),
    __metadata("design:type", String)
], AdminActionAudit.prototype, "actionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity type affected (wallet, business_owner, etc.)' }),
    (0, typeorm_1.Column)({ name: 'entity_type', length: 50 }),
    __metadata("design:type", String)
], AdminActionAudit.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the entity affected' }),
    (0, typeorm_1.Column)({ name: 'entity_id' }),
    __metadata("design:type", String)
], AdminActionAudit.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State before action (JSON)', required: false }),
    (0, typeorm_1.Column)({ name: 'state_before', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AdminActionAudit.prototype, "stateBefore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State after action (JSON)', required: false }),
    (0, typeorm_1.Column)({ name: 'state_after', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AdminActionAudit.prototype, "stateAfter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for action' }),
    (0, typeorm_1.Column)({ name: 'reason', type: 'text' }),
    __metadata("design:type", String)
], AdminActionAudit.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notes', required: false }),
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AdminActionAudit.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'IP address of admin' }),
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45 }),
    __metadata("design:type", String)
], AdminActionAudit.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User agent of admin', required: false }),
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", String)
], AdminActionAudit.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional metadata (JSON)', required: false }),
    (0, typeorm_1.Column)({ name: 'metadata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AdminActionAudit.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AdminActionAudit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'admin_id' }),
    __metadata("design:type", admin_entity_1.Admin)
], AdminActionAudit.prototype, "admin", void 0);
exports.AdminActionAudit = AdminActionAudit = __decorate([
    (0, typeorm_1.Entity)('admin_actions_audit'),
    (0, typeorm_1.Index)(['adminId', 'createdAt']),
    (0, typeorm_1.Index)(['actionType', 'createdAt']),
    (0, typeorm_1.Index)(['entityType', 'entityId'])
], AdminActionAudit);
//# sourceMappingURL=admin-action-audit.entity.js.map
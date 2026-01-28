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
exports.BusinessApproval = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const business_owner_entity_1 = require("./business-owner.entity");
const agent_entity_1 = require("./agent.entity");
const admin_entity_1 = require("./admin.entity");
let BusinessApproval = class BusinessApproval {
    get isCompleted() {
        return this.status === enums_1.ApprovalStatus.APPROVED || this.status === enums_1.ApprovalStatus.REJECTED;
    }
};
exports.BusinessApproval = BusinessApproval;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessApproval.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], BusinessApproval.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'assigned_agent_id' }),
    __metadata("design:type", String)
], BusinessApproval.prototype, "assignedAgentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'assigned_by_admin_id', nullable: true }),
    __metadata("design:type", String)
], BusinessApproval.prototype, "assignedByAdminId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.ApprovalStatus }),
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: enums_1.ApprovalStatus,
        default: enums_1.ApprovalStatus.PENDING,
    }),
    __metadata("design:type", String)
], BusinessApproval.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'review_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessApproval.prototype, "reviewNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'rejection_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessApproval.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UPI ID of the business owner',
        example: 'businessowner@upi',
        required: false
    }),
    (0, swagger_1.ApiProperty)({
        description: 'Credit limit assigned to the vendor',
        example: 50000.00,
        required: false
    }),
    (0, swagger_1.ApiProperty)({
        description: 'Vendor status',
        example: 'active',
        required: false
    }),
    (0, swagger_1.ApiProperty)({
        description: 'remarks when credit limit is added or modified',
        example: 'Initial credit limit set for new vendor',
        required: false
    }),
    (0, typeorm_1.Column)({ name: 'remark', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessApproval.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'is_auto_assigned', default: true }),
    __metadata("design:type", Boolean)
], BusinessApproval.prototype, "isAutoAssigned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'distance_to_agent_km', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], BusinessApproval.prototype, "distanceToAgentKm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'reviewed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BusinessApproval.prototype, "reviewedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessApproval.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessApproval.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.approvals),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], BusinessApproval.prototype, "businessOwner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => agent_entity_1.Agent, (agent) => agent.assignedApprovals),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_agent_id' }),
    __metadata("design:type", agent_entity_1.Agent)
], BusinessApproval.prototype, "assignedAgent", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, (admin) => admin.id, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_by_admin_id' }),
    __metadata("design:type", admin_entity_1.Admin)
], BusinessApproval.prototype, "assignedByAdmin", void 0);
exports.BusinessApproval = BusinessApproval = __decorate([
    (0, typeorm_1.Entity)('business_approvals')
], BusinessApproval);
//# sourceMappingURL=business-approval.entity.js.map
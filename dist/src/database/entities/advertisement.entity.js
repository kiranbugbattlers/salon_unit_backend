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
exports.Advertisement = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const admin_entity_1 = require("./admin.entity");
const enums_1 = require("../../common/enums");
let Advertisement = class Advertisement {
};
exports.Advertisement = Advertisement;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Advertisement.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Advertisement title for admin reference' }),
    (0, typeorm_1.Column)({ name: 'title', length: 200 }),
    __metadata("design:type", String)
], Advertisement.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Optional description', required: false }),
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Advertisement.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.AdMediaType, description: 'Type of media (image or video)' }),
    (0, typeorm_1.Column)({
        name: 'media_type',
        type: 'enum',
        enum: enums_1.AdMediaType,
    }),
    __metadata("design:type", String)
], Advertisement.prototype, "mediaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'S3 URL to the media file' }),
    (0, typeorm_1.Column)({ name: 'media_url', type: 'text' }),
    __metadata("design:type", String)
], Advertisement.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Optional URL to open when ad is clicked', required: false }),
    (0, typeorm_1.Column)({ name: 'link_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Advertisement.prototype, "linkUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of user types that should see this ad',
        example: ['customer', 'business_owner', 'staff'],
    }),
    (0, typeorm_1.Column)({ name: 'target_user_types', type: 'jsonb' }),
    __metadata("design:type", Array)
], Advertisement.prototype, "targetUserTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Screens where ad should appear for each user type',
        example: {
            customer: ['home', 'login'],
            business_owner: ['approval', 'subscription', 'home', 'login'],
            staff: ['home', 'login'],
        },
    }),
    (0, typeorm_1.Column)({ name: 'target_screens', type: 'jsonb' }),
    __metadata("design:type", Object)
], Advertisement.prototype, "targetScreens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display priority (higher = shows first)', default: 0 }),
    (0, typeorm_1.Column)({ name: 'priority', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Advertisement.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether ad is currently active', default: true }),
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Advertisement.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of times ad was viewed', default: 0 }),
    (0, typeorm_1.Column)({ name: 'impression_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Advertisement.prototype, "impressionCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of times ad was clicked', default: 0 }),
    (0, typeorm_1.Column)({ name: 'click_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Advertisement.prototype, "clickCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when ad becomes active', required: false }),
    (0, typeorm_1.Column)({ name: 'start_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Advertisement.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when ad expires', required: false }),
    (0, typeorm_1.Column)({ name: 'end_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Advertisement.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin who created this ad' }),
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], Advertisement.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Advertisement.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Advertisement.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", admin_entity_1.Admin)
], Advertisement.prototype, "admin", void 0);
exports.Advertisement = Advertisement = __decorate([
    (0, typeorm_1.Entity)('advertisements'),
    (0, typeorm_1.Index)(['isActive']),
    (0, typeorm_1.Index)(['priority']),
    (0, typeorm_1.Index)(['isActive', 'startDate', 'endDate'])
], Advertisement);
//# sourceMappingURL=advertisement.entity.js.map
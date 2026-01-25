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
exports.Service = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const service_category_entity_1 = require("./service-category.entity");
const staff_service_entity_1 = require("./staff-service.entity");
const business_service_entity_1 = require("./business-service.entity");
const service_gender_enum_1 = require("../../common/enums/service-gender.enum");
let Service = class Service {
};
exports.Service = Service;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Service.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'category_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Service.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], Service.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Service.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'base_price', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Service.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ name: 'default_duration', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Service.prototype, "defaultDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Service.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_s3_key', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Service.prototype, "imageS3Key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'available_at_home', default: false }),
    __metadata("design:type", Boolean)
], Service.prototype, "availableAtHome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], Service.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: service_gender_enum_1.ServiceGenderEnum }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: service_gender_enum_1.ServiceGenderEnum,
        nullable: true,
        comment: 'Gender this service is available for: male, female, or both'
    }),
    __metadata("design:type", String)
], Service.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Service.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Service.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_category_entity_1.ServiceCategory, (category) => category.services),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", service_category_entity_1.ServiceCategory)
], Service.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => staff_service_entity_1.StaffService, (staffService) => staffService.service),
    __metadata("design:type", Array)
], Service.prototype, "staffServices", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_service_entity_1.BusinessService, (businessService) => businessService.service),
    __metadata("design:type", Array)
], Service.prototype, "businessServices", void 0);
exports.Service = Service = __decorate([
    (0, typeorm_1.Entity)('services'),
    (0, typeorm_1.Index)(['categoryId', 'isActive'])
], Service);
//# sourceMappingURL=service.entity.js.map
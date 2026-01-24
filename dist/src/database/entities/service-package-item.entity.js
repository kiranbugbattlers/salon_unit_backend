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
exports.ServicePackageItem = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const service_package_entity_1 = require("./service-package.entity");
const business_service_entity_1 = require("./business-service.entity");
let ServicePackageItem = class ServicePackageItem {
};
exports.ServicePackageItem = ServicePackageItem;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ServicePackageItem.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'package_id' }),
    __metadata("design:type", String)
], ServicePackageItem.prototype, "packageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_service_id' }),
    __metadata("design:type", String)
], ServicePackageItem.prototype, "businessServiceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ServicePackageItem.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ServicePackageItem.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_package_entity_1.ServicePackage, (servicePackage) => servicePackage.packageItems, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", service_package_entity_1.ServicePackage)
], ServicePackageItem.prototype, "servicePackage", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_service_entity_1.BusinessService, (businessService) => businessService.packageItems),
    (0, typeorm_1.JoinColumn)({ name: 'business_service_id' }),
    __metadata("design:type", business_service_entity_1.BusinessService)
], ServicePackageItem.prototype, "businessService", void 0);
exports.ServicePackageItem = ServicePackageItem = __decorate([
    (0, typeorm_1.Entity)('service_package_items'),
    (0, typeorm_1.Index)(['packageId']),
    (0, typeorm_1.Index)(['businessServiceId']),
    (0, typeorm_1.Unique)(['packageId', 'businessServiceId'])
], ServicePackageItem);
//# sourceMappingURL=service-package-item.entity.js.map
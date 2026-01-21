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
exports.BusinessOperatingHours = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const business_owner_entity_1 = require("./business-owner.entity");
let BusinessOperatingHours = class BusinessOperatingHours {
};
exports.BusinessOperatingHours = BusinessOperatingHours;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessOperatingHours.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_owner_id' }),
    __metadata("design:type", String)
], BusinessOperatingHours.prototype, "businessOwnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)' }),
    (0, typeorm_1.Column)({ name: 'day_of_week', type: 'int' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], BusinessOperatingHours.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Opening time in 24-hour format (HH:MM)' }),
    (0, typeorm_1.Column)({ name: 'open_time', type: 'time' }),
    __metadata("design:type", String)
], BusinessOperatingHours.prototype, "openTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Closing time in 24-hour format (HH:MM)' }),
    (0, typeorm_1.Column)({ name: 'close_time', type: 'time' }),
    __metadata("design:type", String)
], BusinessOperatingHours.prototype, "closeTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether business is closed on this day' }),
    (0, typeorm_1.Column)({ name: 'is_closed', default: false }),
    __metadata("design:type", Boolean)
], BusinessOperatingHours.prototype, "isClosed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessOperatingHours.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessOperatingHours.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_owner_entity_1.BusinessOwner, (businessOwner) => businessOwner.id),
    (0, typeorm_1.JoinColumn)({ name: 'business_owner_id' }),
    __metadata("design:type", business_owner_entity_1.BusinessOwner)
], BusinessOperatingHours.prototype, "businessOwner", void 0);
exports.BusinessOperatingHours = BusinessOperatingHours = __decorate([
    (0, typeorm_1.Entity)('business_operating_hours'),
    (0, typeorm_1.Index)(['businessOwnerId', 'dayOfWeek']),
    (0, typeorm_1.Unique)(['businessOwnerId', 'dayOfWeek'])
], BusinessOperatingHours);
//# sourceMappingURL=business-operating-hours.entity.js.map
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
exports.BookingRequestService = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const booking_request_entity_1 = require("./booking-request.entity");
const business_service_entity_1 = require("./business-service.entity");
let BookingRequestService = class BookingRequestService {
};
exports.BookingRequestService = BookingRequestService;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BookingRequestService.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'booking_request_id', type: 'uuid' }),
    __metadata("design:type", String)
], BookingRequestService.prototype, "bookingRequestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ name: 'business_service_id', type: 'uuid' }),
    __metadata("design:type", String)
], BookingRequestService.prototype, "businessServiceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity of this service requested' }),
    (0, typeorm_1.Column)({ name: 'quantity', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], BookingRequestService.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated price for this service (custom price from business service)' }),
    (0, typeorm_1.Column)({ name: 'estimated_price', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], BookingRequestService.prototype, "estimatedPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated duration for this service in minutes (custom duration from business service)' }),
    (0, typeorm_1.Column)({ name: 'estimated_duration', type: 'int' }),
    __metadata("design:type", Number)
], BookingRequestService.prototype, "estimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BookingRequestService.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BookingRequestService.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => booking_request_entity_1.BookingRequest, (bookingRequest) => bookingRequest.bookingRequestServices),
    (0, typeorm_1.JoinColumn)({ name: 'booking_request_id' }),
    __metadata("design:type", booking_request_entity_1.BookingRequest)
], BookingRequestService.prototype, "bookingRequest", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_service_entity_1.BusinessService, (businessService) => businessService.id),
    (0, typeorm_1.JoinColumn)({ name: 'business_service_id' }),
    __metadata("design:type", business_service_entity_1.BusinessService)
], BookingRequestService.prototype, "businessService", void 0);
exports.BookingRequestService = BookingRequestService = __decorate([
    (0, typeorm_1.Entity)('booking_request_services'),
    (0, typeorm_1.Index)(['bookingRequestId', 'businessServiceId']),
    (0, typeorm_1.Unique)(['bookingRequestId', 'businessServiceId'])
], BookingRequestService);
//# sourceMappingURL=booking-request-service.entity.js.map
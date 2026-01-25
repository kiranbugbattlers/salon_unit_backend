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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryChargeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const distance_calculator_service_1 = require("../common/services/distance-calculator.service");
let DeliveryChargeService = class DeliveryChargeService {
    constructor(businessSettingsRepository, businessOwnerRepository, distanceCalculatorService) {
        this.businessSettingsRepository = businessSettingsRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.distanceCalculatorService = distanceCalculatorService;
    }
    async calculateDeliveryCharge(businessOwnerId, customerLatitude, customerLongitude, orderAmount) {
        let settings = await this.businessSettingsRepository.findOne({
            where: { businessOwnerId }
        });
        if (!settings) {
            settings = this.businessSettingsRepository.create({
                businessOwnerId,
                deliveryChargesEnabled: true,
                baseDeliveryCharge: 0,
                perKmCharge: 10,
                freeDeliveryUptoKm: 5,
                maxDeliveryDistanceKm: 20,
                freeDeliveryAboveAmount: 1000,
            });
            await this.businessSettingsRepository.save(settings);
            console.log(`✅ Created default delivery settings for business: ${businessOwnerId}`);
        }
        if (!settings.deliveryChargesEnabled) {
            return {
                distanceKm: 0,
                baseCharge: 0,
                distanceCharge: 0,
                totalDeliveryCharge: 0,
                isFreeDelivery: true,
                freeDeliveryReason: 'Delivery charges disabled by business',
                breakdown: 'Free delivery (charges disabled)',
            };
        }
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['addresses'],
        });
        if (!businessOwner?.addresses?.[0]) {
            throw new common_1.BadRequestException('Business address not found. Cannot calculate delivery charges.');
        }
        const businessAddress = businessOwner.addresses[0];
        const distanceKm = this.distanceCalculatorService.calculateDistance({ latitude: businessAddress.latitude, longitude: businessAddress.longitude }, { latitude: customerLatitude, longitude: customerLongitude });
        console.log(`📍 Distance calculated: ${distanceKm.toFixed(2)} km from business to customer`);
        const maxDistance = Number(settings.maxDeliveryDistanceKm);
        if (distanceKm > maxDistance) {
            throw new common_1.BadRequestException(`Delivery location is too far (${distanceKm.toFixed(2)} km). Maximum delivery distance is ${maxDistance} km. Please choose a business closer to your location.`);
        }
        const freeAboveAmount = Number(settings.freeDeliveryAboveAmount);
        if (orderAmount >= freeAboveAmount) {
            return {
                distanceKm,
                baseCharge: 0,
                distanceCharge: 0,
                totalDeliveryCharge: 0,
                isFreeDelivery: true,
                freeDeliveryReason: `Order amount ≥ ₹${freeAboveAmount}`,
                breakdown: `Free delivery for orders above ₹${freeAboveAmount}`,
            };
        }
        const freeUptoKm = Number(settings.freeDeliveryUptoKm);
        if (distanceKm <= freeUptoKm) {
            return {
                distanceKm,
                baseCharge: 0,
                distanceCharge: 0,
                totalDeliveryCharge: 0,
                isFreeDelivery: true,
                freeDeliveryReason: `Distance ≤ ${freeUptoKm} km`,
                breakdown: `Free delivery within ${freeUptoKm} km radius`,
            };
        }
        const baseCharge = Number(settings.baseDeliveryCharge);
        const perKmCharge = Number(settings.perKmCharge);
        const chargeableDistance = distanceKm - freeUptoKm;
        const distanceCharge = chargeableDistance * perKmCharge;
        const totalDeliveryCharge = baseCharge + distanceCharge;
        const roundedTotal = Math.round(totalDeliveryCharge * 100) / 100;
        return {
            distanceKm: Math.round(distanceKm * 100) / 100,
            baseCharge,
            distanceCharge: Math.round(distanceCharge * 100) / 100,
            totalDeliveryCharge: roundedTotal,
            isFreeDelivery: false,
            breakdown: [
                `Distance: ${distanceKm.toFixed(2)} km`,
                baseCharge > 0 ? `Base charge: ₹${baseCharge.toFixed(2)}` : null,
                `Chargeable distance: ${chargeableDistance.toFixed(2)} km (after ${freeUptoKm} km free)`,
                `Distance charge: ${chargeableDistance.toFixed(2)} km × ₹${perKmCharge}/km = ₹${distanceCharge.toFixed(2)}`,
                `Total delivery charge: ₹${roundedTotal.toFixed(2)}`,
            ].filter(Boolean).join('\n'),
        };
    }
    async getDeliverySettings(businessOwnerId) {
        let settings = await this.businessSettingsRepository.findOne({
            where: { businessOwnerId }
        });
        if (!settings) {
            settings = this.businessSettingsRepository.create({
                businessOwnerId,
                deliveryChargesEnabled: true,
                baseDeliveryCharge: 0,
                perKmCharge: 10,
                freeDeliveryUptoKm: 5,
                maxDeliveryDistanceKm: 20,
                freeDeliveryAboveAmount: 1000,
            });
            await this.businessSettingsRepository.save(settings);
        }
        return settings;
    }
    async updateDeliverySettings(businessOwnerId, updates) {
        let settings = await this.businessSettingsRepository.findOne({
            where: { businessOwnerId }
        });
        if (!settings) {
            settings = this.businessSettingsRepository.create({
                businessOwnerId,
                ...updates,
            });
        }
        else {
            Object.assign(settings, updates);
        }
        return this.businessSettingsRepository.save(settings);
    }
};
exports.DeliveryChargeService = DeliveryChargeService;
exports.DeliveryChargeService = DeliveryChargeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessSettings)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        distance_calculator_service_1.DistanceCalculatorService])
], DeliveryChargeService);
//# sourceMappingURL=delivery-charge.service.js.map
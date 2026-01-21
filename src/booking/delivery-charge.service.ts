import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessSettings, BusinessOwner } from '../database/entities';
import { DistanceCalculatorService } from '../common/services/distance-calculator.service';

export interface DeliveryChargeCalculation {
  distanceKm: number;
  baseCharge: number;
  distanceCharge: number;
  totalDeliveryCharge: number;
  isFreeDelivery: boolean;
  freeDeliveryReason?: string;
  breakdown: string;
}

@Injectable()
export class DeliveryChargeService {
  constructor(
    @InjectRepository(BusinessSettings)
    private readonly businessSettingsRepository: Repository<BusinessSettings>,
    @InjectRepository(BusinessOwner)
    private readonly businessOwnerRepository: Repository<BusinessOwner>,
    private readonly distanceCalculatorService: DistanceCalculatorService,
  ) {}

  /**
   * Calculate delivery charges based on distance and business settings
   * @param businessOwnerId Business owner ID
   * @param customerLatitude Customer's latitude
   * @param customerLongitude Customer's longitude
   * @param orderAmount Total order amount (for free delivery threshold)
   * @returns Delivery charge calculation details
   */
  async calculateDeliveryCharge(
    businessOwnerId: string,
    customerLatitude: number,
    customerLongitude: number,
    orderAmount: number,
  ): Promise<DeliveryChargeCalculation> {
    // Get or create business settings
    let settings = await this.businessSettingsRepository.findOne({
      where: { businessOwnerId }
    });

    if (!settings) {
      // Create default settings if not exists
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

    // If delivery charges disabled, return zero
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

    // Get business location
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { id: businessOwnerId },
      relations: ['addresses'],
    });

    if (!businessOwner?.addresses?.[0]) {
      throw new BadRequestException('Business address not found. Cannot calculate delivery charges.');
    }

    const businessAddress = businessOwner.addresses[0];

    // Calculate distance using Haversine formula
    const distanceKm = this.distanceCalculatorService.calculateDistance(
      { latitude: businessAddress.latitude, longitude: businessAddress.longitude },
      { latitude: customerLatitude, longitude: customerLongitude },
    );

    console.log(`📍 Distance calculated: ${distanceKm.toFixed(2)} km from business to customer`);

    // Check if distance exceeds maximum allowed
    const maxDistance = Number(settings.maxDeliveryDistanceKm);
    if (distanceKm > maxDistance) {
      throw new BadRequestException(
        `Delivery location is too far (${distanceKm.toFixed(2)} km). Maximum delivery distance is ${maxDistance} km. Please choose a business closer to your location.`
      );
    }

    // Check for free delivery based on order amount
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

    // Check for free delivery based on distance
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

    // Calculate charges
    const baseCharge = Number(settings.baseDeliveryCharge);
    const perKmCharge = Number(settings.perKmCharge);
    const chargeableDistance = distanceKm - freeUptoKm;
    const distanceCharge = chargeableDistance * perKmCharge;
    const totalDeliveryCharge = baseCharge + distanceCharge;

    // Round to 2 decimal places
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

  /**
   * Get business delivery settings
   * @param businessOwnerId Business owner ID
   * @returns Business delivery settings or default settings
   */
  async getDeliverySettings(businessOwnerId: string): Promise<BusinessSettings> {
    let settings = await this.businessSettingsRepository.findOne({
      where: { businessOwnerId }
    });

    if (!settings) {
      // Create and return default settings
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

  /**
   * Update business delivery settings
   * @param businessOwnerId Business owner ID
   * @param updates Partial updates to settings
   * @returns Updated settings
   */
  async updateDeliverySettings(
    businessOwnerId: string,
    updates: Partial<BusinessSettings>,
  ): Promise<BusinessSettings> {
    let settings = await this.businessSettingsRepository.findOne({
      where: { businessOwnerId }
    });

    if (!settings) {
      // Create new settings with updates
      settings = this.businessSettingsRepository.create({
        businessOwnerId,
        ...updates,
      });
    } else {
      // Update existing settings
      Object.assign(settings, updates);
    }

    return this.businessSettingsRepository.save(settings);
  }
}

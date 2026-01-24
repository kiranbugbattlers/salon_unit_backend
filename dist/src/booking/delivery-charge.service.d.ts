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
export declare class DeliveryChargeService {
    private readonly businessSettingsRepository;
    private readonly businessOwnerRepository;
    private readonly distanceCalculatorService;
    constructor(businessSettingsRepository: Repository<BusinessSettings>, businessOwnerRepository: Repository<BusinessOwner>, distanceCalculatorService: DistanceCalculatorService);
    calculateDeliveryCharge(businessOwnerId: string, customerLatitude: number, customerLongitude: number, orderAmount: number): Promise<DeliveryChargeCalculation>;
    getDeliverySettings(businessOwnerId: string): Promise<BusinessSettings>;
    updateDeliverySettings(businessOwnerId: string, updates: Partial<BusinessSettings>): Promise<BusinessSettings>;
}

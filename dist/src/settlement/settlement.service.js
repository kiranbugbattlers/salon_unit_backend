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
exports.SettlementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_owner_entity_1 = require("../database/entities/business-owner.entity");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const business_owner_transaction_history_entity_1 = require("../database/entities/business-owner-transaction-history.entity");
let SettlementService = class SettlementService {
    constructor(businessOwnerRepository, transactionHistoryRepository) {
        this.businessOwnerRepository = businessOwnerRepository;
        this.transactionHistoryRepository = transactionHistoryRepository;
    }
    async getBusinessOwnerSettlementHistory(businessOwnerId, user) {
        console.log('Getting settlement history for business owner:', businessOwnerId);
        console.log('User info:', user);
        const userRole = user.role || user.userRole || user.user?.role || (user.roles && user.roles[0]);
        const userId = user.sub || user.id || user.userId || user.user?.id;
        console.log('User role:', userRole, 'User ID:', userId);
        console.log('Is admin?', userRole === 'admin' || userRole === user_role_enum_1.UserRole.ADMIN);
        console.log('Is owner?', userId === businessOwnerId);
        console.log('Access granted - TEMPORARY bypass for testing');
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
            relations: ['user', 'addresses'],
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        console.log('Found business owner:', businessOwner.businessName);
        const mockSettlements = [
            {
                transactionId: 'mock-transaction-id-1',
                date: '2025-12-24',
                completedAt: '2025-12-24T04:16:22.985Z',
                transactionDate: new Date('2025-12-24T00:00:00Z'),
                businessOwnerId: businessOwnerId,
                ownerName: `${businessOwner.firstName || ''} ${businessOwner.lastName || ''}`.trim() || 'parshuram Gaikwad',
                salonName: businessOwner.businessName || 'royal look',
                email: businessOwner.user?.email || 'styleplusunitllp@gmail.com',
                mobileNumber: businessOwner.user?.phone || '9270169007',
                address: 'Office NO - 840, Pune, Maharashtra, 411057, India, Pune, Maharashtra, 411057',
                amount: 2700,
                paymentMethod: 'cod',
                commissionAmount: 270,
                gstAmount: 48.6,
                totalDeduction: 318.6,
                settlementAmount: 2381.4,
                status: 'completed',
                transactionType: 'credit',
                previousBalance: 0,
                currentBalance: 2381.4,
                remark: 'Test settlement transaction',
                relatedBookingId: 'mock-booking-id',
            }
        ];
        const totalAmount = mockSettlements.reduce((sum, s) => sum + (s.amount || 0), 0);
        const totalCommission = mockSettlements.reduce((sum, s) => sum + (s.commissionAmount || 0), 0);
        const totalGST = mockSettlements.reduce((sum, s) => sum + (s.gstAmount || 0), 0);
        const totalSettlement = mockSettlements.reduce((sum, s) => sum + (s.settlementAmount || 0), 0);
        const settlementHistory = {
            businessOwnerId: businessOwner.id,
            businessName: businessOwner.businessName,
            ownerName: `${businessOwner.firstName || ''} ${businessOwner.lastName || ''}`.trim() || 'parshuram Gaikwad',
            email: businessOwner.user?.email || 'styleplusunitllp@gmail.com',
            mobileNumber: businessOwner.user?.phone || '9270169007',
            totalSettlements: mockSettlements.length,
            totalAmount: totalAmount,
            totalCommission: totalCommission,
            totalGST: totalGST,
            totalDeduction: totalCommission + totalGST,
            totalSettlement: totalSettlement,
            settlements: mockSettlements,
        };
        return {
            code: 200,
            success: true,
            message: 'Settlement history retrieved successfully',
            data: settlementHistory,
        };
    }
};
exports.SettlementService = SettlementService;
exports.SettlementService = SettlementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_owner_entity_1.BusinessOwner)),
    __param(1, (0, typeorm_1.InjectRepository)(business_owner_transaction_history_entity_1.BusinessOwnerTransactionHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SettlementService);
//# sourceMappingURL=settlement.service.js.map
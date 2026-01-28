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
var AdminDuePaymentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDuePaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
const vendor_status_service_1 = require("../services/vendor-status.service");
const common_2 = require("@nestjs/common");
let AdminDuePaymentsController = AdminDuePaymentsController_1 = class AdminDuePaymentsController {
    constructor(vendorDuePaymentRepository, businessOwnerRepository, vendorStatusService) {
        this.vendorDuePaymentRepository = vendorDuePaymentRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.vendorStatusService = vendorStatusService;
        this.logger = new common_2.Logger(AdminDuePaymentsController_1.name);
    }
    async getAllDuePayments(status, businessOwnerId, fromDate, toDate, page = 1, limit = 20, sortBy = 'dueDate', sortOrder = 'ASC') {
        const whereConditions = {};
        if (status)
            whereConditions.status = status;
        if (businessOwnerId)
            whereConditions.businessOwnerId = businessOwnerId;
        if (fromDate && toDate) {
            whereConditions.dueDate = (0, typeorm_2.Between)(new Date(fromDate), new Date(toDate));
        }
        else if (fromDate) {
            whereConditions.dueDate = (0, typeorm_2.MoreThanOrEqual)(new Date(fromDate));
        }
        else if (toDate) {
            whereConditions.dueDate = (0, typeorm_2.LessThanOrEqual)(new Date(toDate));
        }
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [duePayments, total] = await this.vendorDuePaymentRepository.findAndCount({
            where: whereConditions,
            relations: ['businessOwner', 'businessOwner.user'],
            order: orderBy,
            skip: (page - 1) * limit,
            take: limit,
        });
        const enrichedPayments = duePayments.map(payment => ({
            ...payment,
            businessName: payment.businessOwner?.businessName || 'N/A',
            ownerName: payment.businessOwner?.firstName && payment.businessOwner?.lastName
                ? `${payment.businessOwner.firstName} ${payment.businessOwner.lastName}`.trim()
                : payment.businessOwner?.businessName || 'N/A',
            mobileNumber: payment.businessOwner?.user?.phone || 'N/A',
        }));
        const summary = await this.getDuePaymentsSummary(whereConditions);
        return {
            code: 200,
            success: true,
            message: 'Due payments retrieved successfully',
            data: {
                duePayments: enrichedPayments,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
                summary,
            },
        };
    }
    async getDuePaymentsSummaryEndpoint(businessOwnerId, fromDate, toDate) {
        const whereConditions = {};
        if (businessOwnerId)
            whereConditions.businessOwnerId = businessOwnerId;
        if (fromDate && toDate) {
            whereConditions.dueDate = (0, typeorm_2.Between)(new Date(fromDate), new Date(toDate));
        }
        else if (fromDate) {
            whereConditions.dueDate = (0, typeorm_2.MoreThanOrEqual)(new Date(fromDate));
        }
        else if (toDate) {
            whereConditions.dueDate = (0, typeorm_2.LessThanOrEqual)(new Date(toDate));
        }
        const summary = await this.getDuePaymentsSummary(whereConditions);
        return {
            code: 200,
            success: true,
            message: 'Summary retrieved successfully',
            data: summary,
        };
    }
    async getCreditUsage(businessOwnerId) {
        try {
            const creditUsage = await this.vendorStatusService.calculateCreditUsage(businessOwnerId);
            return {
                code: 200,
                success: true,
                message: 'Credit usage retrieved successfully',
                data: creditUsage,
            };
        }
        catch (error) {
            if (error.message === 'Business owner not found') {
                throw new common_1.NotFoundException('Business owner not found');
            }
            throw error;
        }
    }
    async getDuePaymentById(id) {
        const duePayment = await this.vendorDuePaymentRepository.findOne({
            where: { id },
            relations: ['businessOwner', 'businessOwner.user', 'createdByAdmin', 'updatedByAdmin'],
        });
        if (!duePayment) {
            throw new common_1.NotFoundException('Due payment not found');
        }
        const enrichedPayment = {
            ...duePayment,
            businessName: duePayment.businessOwner?.businessName || 'N/A',
            ownerName: duePayment.businessOwner?.firstName && duePayment.businessOwner?.lastName
                ? `${duePayment.businessOwner.firstName} ${duePayment.businessOwner.lastName}`.trim()
                : duePayment.businessOwner?.businessName || 'N/A',
            mobileNumber: duePayment.businessOwner?.user?.phone || 'N/A',
            email: duePayment.businessOwner?.user?.email || 'N/A',
        };
        return {
            code: 200,
            success: true,
            message: 'Due payment details retrieved successfully',
            data: enrichedPayment,
        };
    }
    async checkCreditStatus(businessOwnerId) {
        try {
            const creditUsage = await this.vendorStatusService.calculateCreditUsage(businessOwnerId);
            return {
                code: 200,
                success: true,
                message: 'Credit status check completed',
                data: {
                    businessOwnerId,
                    creditUsage,
                    note: 'Vendor status remains unchanged - only admin can modify vendor status'
                }
            };
        }
        catch (error) {
            if (error.message === 'Business owner not found') {
                throw new common_1.NotFoundException('Business owner not found');
            }
            throw error;
        }
    }
    async setCreditLimit(businessOwnerId, setCreditDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: businessOwnerId },
        });
        if (!businessOwner) {
            throw new common_1.NotFoundException('Business owner not found');
        }
        const previousCreditLimit = businessOwner.creditLimit || 0;
        await this.businessOwnerRepository.update({ id: businessOwnerId }, {
            creditLimit: parseFloat(setCreditDto.creditLimit.toString()),
        });
        this.logger.log(`Credit limit set for business owner ${businessOwnerId}: ` +
            `₹${previousCreditLimit} → ₹${setCreditDto.creditLimit} ${setCreditDto.remarks ? `(${setCreditDto.remarks})` : ''}`);
        return {
            code: 200,
            success: true,
            message: `Credit limit set to ₹${parseFloat(setCreditDto.creditLimit.toString()).toFixed(2)} successfully`,
            data: {
                businessOwnerId,
                previousCreditLimit,
                newCreditLimit: parseFloat(setCreditDto.creditLimit.toString()),
                remarks: setCreditDto.remarks,
            },
        };
    }
    async createDuePayment(createDto) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { id: createDto.businessOwnerId },
            relations: ['user'],
        });
        if (!businessOwner) {
            throw new common_1.BadRequestException('Business owner not found');
        }
        const duePayment = this.vendorDuePaymentRepository.create({
            businessOwnerId: createDto.businessOwnerId,
            dueAmount: createDto.dueAmount,
            paidAmount: 0,
            remainingAmount: createDto.dueAmount,
            dueDate: new Date(createDto.dueDate),
            description: createDto.description,
            salonName: businessOwner.businessName,
            ownerName: businessOwner?.firstName && businessOwner?.lastName
                ? `${businessOwner.firstName} ${businessOwner.lastName}`.trim()
                : businessOwner?.businessName || 'N/A',
            mobileNumber: businessOwner.user?.phone || 'N/A',
            isBusinessEnabled: businessOwner?.isActive || true,
            status: entities_1.DuePaymentStatus.PENDING,
        });
        const savedPayment = await this.vendorDuePaymentRepository.save(duePayment);
        const currentCreditLimit = businessOwner.creditLimit || 0;
        const newCreditLimit = currentCreditLimit + parseFloat(createDto.dueAmount);
        await this.businessOwnerRepository.update({ id: createDto.businessOwnerId }, {
            creditLimit: newCreditLimit,
        });
        await this.vendorStatusService.preserveVendorStatusOnPayment(createDto.businessOwnerId);
        return {
            code: 201,
            success: true,
            message: `Due payment created successfully. Vendor credit points increased by ₹${parseFloat(createDto.dueAmount).toFixed(2)}`,
            data: {
                ...savedPayment,
                previousCreditPoints: currentCreditLimit,
                newCreditPoints: newCreditLimit,
                creditPointsIncrease: parseFloat(createDto.dueAmount),
            },
        };
    }
    async updateDuePayment(id, updateDto) {
        this.logger.log(`Updating due payment with ID: ${id}`);
        this.logger.log(`Update data: ${JSON.stringify(updateDto)}`);
        if (!id || typeof id !== 'string') {
            throw new common_1.BadRequestException('Invalid due payment ID format');
        }
        const duePayment = await this.vendorDuePaymentRepository.findOne({
            where: { id },
        });
        if (!duePayment) {
            this.logger.warn(`Due payment not found with ID: ${id}`);
            throw new common_1.NotFoundException('Due payment not found');
        }
        this.logger.log(`Found due payment: ${JSON.stringify({
            id: duePayment.id,
            dueAmount: duePayment.dueAmount,
            paidAmount: duePayment.paidAmount,
            status: duePayment.status
        })}`);
        if (updateDto.paidAmount !== undefined) {
            if (typeof updateDto.paidAmount !== 'number' || updateDto.paidAmount < 0) {
                throw new common_1.BadRequestException('Paid amount must be a non-negative number');
            }
            if (updateDto.paidAmount > duePayment.dueAmount) {
                throw new common_1.BadRequestException('Paid amount cannot exceed due amount');
            }
            duePayment.paidAmount = updateDto.paidAmount;
            duePayment.remainingAmount = duePayment.dueAmount - updateDto.paidAmount;
            this.logger.log(`Updated amounts - Paid: ${duePayment.paidAmount}, Remaining: ${duePayment.remainingAmount}`);
        }
        if (updateDto.status) {
            const validStatuses = Object.values(entities_1.DuePaymentStatus);
            if (!validStatuses.includes(updateDto.status)) {
                throw new common_1.BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
            }
            duePayment.status = updateDto.status;
            if (updateDto.status === entities_1.DuePaymentStatus.OVERDUE && !duePayment.markedOverdueAt) {
                duePayment.markedOverdueAt = new Date();
            }
            this.logger.log(`Updated status to: ${duePayment.status}`);
        }
        if (updateDto.isBusinessEnabled !== undefined) {
            duePayment.isBusinessEnabled = updateDto.isBusinessEnabled;
            this.logger.log(`Updated business enabled: ${duePayment.isBusinessEnabled}`);
        }
        try {
            const updatedPayment = await this.vendorDuePaymentRepository.save(duePayment);
            this.logger.log(`Successfully updated due payment: ${updatedPayment.id}`);
            if (duePayment.businessOwnerId) {
                await this.vendorStatusService.preserveVendorStatusOnPayment(duePayment.businessOwnerId);
            }
            return {
                code: 200,
                success: true,
                message: 'Due payment updated successfully',
                data: {
                    ...updatedPayment,
                    businessName: duePayment.businessOwner?.businessName || 'N/A',
                    ownerName: duePayment.businessOwner?.firstName && duePayment.businessOwner?.lastName
                        ? `${duePayment.businessOwner.firstName} ${duePayment.businessOwner.lastName}`.trim()
                        : duePayment.businessOwner?.businessName || 'N/A',
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to update due payment: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to update due payment: ${error.message}`);
        }
    }
    async getDuePaymentsSummary(whereConditions = {}) {
        const summary = await this.vendorDuePaymentRepository
            .createQueryBuilder('payment')
            .select('payment.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(payment.dueAmount)', 'totalDueAmount')
            .addSelect('SUM(payment.paidAmount)', 'totalPaidAmount')
            .addSelect('SUM(payment.remainingAmount)', 'totalRemainingAmount')
            .where(whereConditions)
            .groupBy('payment.status')
            .getRawMany();
        const totals = await this.vendorDuePaymentRepository
            .createQueryBuilder('payment')
            .select('COUNT(*)', 'totalCount')
            .addSelect('SUM(payment.dueAmount)', 'totalDueAmount')
            .addSelect('SUM(payment.paidAmount)', 'totalPaidAmount')
            .addSelect('SUM(payment.remainingAmount)', 'totalRemainingAmount')
            .where(whereConditions)
            .getRawOne();
        return {
            byStatus: summary,
            totals: totals || {
                totalCount: 0,
                totalDueAmount: 0,
                totalPaidAmount: 0,
                totalRemainingAmount: 0,
            },
        };
    }
};
exports.AdminDuePaymentsController = AdminDuePaymentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all due payments with filtering options',
        description: 'Retrieve all vendor due payments with comprehensive filtering and pagination.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: ['pending', 'overdue', 'paid', 'partially_paid'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'businessOwnerId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', enum: ['dueDate', 'dueAmount', 'createdAt'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', enum: ['ASC', 'DESC'], required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Due payments retrieved successfully' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('businessOwnerId')),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], AdminDuePaymentsController.prototype, "getAllDuePayments", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get due payments summary statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Summary retrieved successfully' }),
    __param(0, (0, common_1.Query)('businessOwnerId')),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminDuePaymentsController.prototype, "getDuePaymentsSummaryEndpoint", null);
__decorate([
    (0, common_1.Get)('credit-usage/:businessOwnerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get credit usage details for a vendor' }),
    (0, swagger_1.ApiParam)({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Credit usage retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Business owner not found' }),
    __param(0, (0, common_1.Param)('businessOwnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDuePaymentsController.prototype, "getCreditUsage", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific due payment details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Due payment ID (UUID)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Due payment details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Due payment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDuePaymentsController.prototype, "getDuePaymentById", null);
__decorate([
    (0, common_1.Post)('check-credit-status/:businessOwnerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Check and update vendor status based on credit usage' }),
    (0, swagger_1.ApiParam)({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Credit status check completed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Business owner not found' }),
    __param(0, (0, common_1.Param)('businessOwnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDuePaymentsController.prototype, "checkCreditStatus", null);
__decorate([
    (0, common_1.Post)('set-credit-limit/:businessOwnerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Set credit limit and remarks for vendor before approval' }),
    (0, swagger_1.ApiParam)({ name: 'businessOwnerId', description: 'Business owner ID (UUID)' }),
    (0, swagger_1.ApiBody)({
        description: 'Credit limit and remarks for vendor',
        schema: {
            example: {
                creditLimit: 10000.00,
                remarks: 'Initial credit limit assigned before approval',
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Credit limit set successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Business owner not found' }),
    __param(0, (0, common_1.Param)('businessOwnerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminDuePaymentsController.prototype, "setCreditLimit", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new due payment' }),
    (0, swagger_1.ApiBody)({
        description: 'Due payment creation data. Note: Creating a due payment will automatically increase the vendor\'s credit limit by the due amount.',
        schema: {
            example: {
                businessOwnerId: '456e7890-e12b-34c5-d678-901234567890',
                dueAmount: 1500.00,
                dueDate: '2024-01-15',
                description: 'Monthly commission payment for December 2023',
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Due payment created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid data or business owner not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminDuePaymentsController.prototype, "createDuePayment", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update due payment status and amounts' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Due payment ID (UUID)' }),
    (0, swagger_1.ApiBody)({
        description: 'Due payment update data',
        schema: {
            example: {
                paidAmount: 750.00,
                status: 'partially_paid',
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Due payment updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Due payment not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid data provided' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminDuePaymentsController.prototype, "updateDuePayment", null);
exports.AdminDuePaymentsController = AdminDuePaymentsController = AdminDuePaymentsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Admin - Due Payments'),
    (0, common_1.Controller)('admin/due-payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.VendorDuePayment)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        vendor_status_service_1.VendorStatusService])
], AdminDuePaymentsController);
//# sourceMappingURL=admin-due-payments.controller.js.map
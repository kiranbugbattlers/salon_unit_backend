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
var BusinessOwnerTransactionHistoryController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessOwnerTransactionHistoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const business_owner_transaction_history_service_1 = require("../services/business-owner-transaction-history.service");
const business_owner_transaction_history_dto_1 = require("../dto/business-owner-transaction-history.dto");
const common_2 = require("@nestjs/common");
const vendor_transaction_query_validation_pipe_1 = require("../../common/pipes/vendor-transaction-query-validation.pipe");
let BusinessOwnerTransactionHistoryController = BusinessOwnerTransactionHistoryController_1 = class BusinessOwnerTransactionHistoryController {
    constructor(businessOwnerTransactionHistoryService) {
        this.businessOwnerTransactionHistoryService = businessOwnerTransactionHistoryService;
        this.logger = new common_2.Logger(BusinessOwnerTransactionHistoryController_1.name);
    }
    async getAllBusinessOwnerTransactions(queryDto) {
        try {
            this.logger.log('Getting all business owner transactions');
            const result = await this.businessOwnerTransactionHistoryService.getAllBusinessOwnerTransactions(queryDto);
            this.logger.log('Successfully retrieved all business owner transactions');
            return result;
        }
        catch (error) {
            this.logger.error('Failed to get all business owner transactions:', error);
            throw {
                code: 500,
                success: false,
                message: 'Failed to retrieve business owner transactions',
                error: error.message,
            };
        }
    }
    async getTransactionDayWise(query) {
        try {
            this.logger.log('Getting day-wise business owner transactions');
            const result = await this.businessOwnerTransactionHistoryService.getTransactionDayWise(query);
            this.logger.log('Successfully retrieved day-wise business owner transactions');
            return result;
        }
        catch (error) {
            this.logger.error('Failed to get day-wise business owner transactions:', error);
            throw {
                code: 500,
                success: false,
                message: 'Failed to retrieve day-wise transactions',
                error: error.message,
            };
        }
    }
    async getTransactionById(transactionId) {
        try {
            this.logger.log(`Getting transaction by ID: ${transactionId}`);
            const result = await this.businessOwnerTransactionHistoryService.getTransactionById(transactionId);
            this.logger.log(`Successfully retrieved transaction: ${transactionId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to get transaction ${transactionId}:`, error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw {
                code: 500,
                success: false,
                message: 'Failed to retrieve transaction',
                error: error.message,
            };
        }
    }
    async updateTransactionRemark(transactionId, updateDto) {
        try {
            this.logger.log(`Updating remark for transaction: ${transactionId}`);
            const result = await this.businessOwnerTransactionHistoryService.updateTransactionRemark(transactionId, updateDto);
            this.logger.log(`Successfully updated remark for transaction: ${transactionId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to update remark for transaction ${transactionId}:`, error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw {
                code: 500,
                success: false,
                message: 'Failed to update transaction remark',
                error: error.message,
            };
        }
    }
    async deleteTransaction(transactionId) {
        try {
            this.logger.log(`Deleting transaction: ${transactionId}`);
            const result = await this.businessOwnerTransactionHistoryService.deleteTransaction(transactionId);
            this.logger.log(`Successfully deleted transaction: ${transactionId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to delete transaction ${transactionId}:`, error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw {
                code: 500,
                success: false,
                message: 'Failed to delete transaction',
                error: error.message,
            };
        }
    }
};
exports.BusinessOwnerTransactionHistoryController = BusinessOwnerTransactionHistoryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all business owner transactions',
        description: 'Retrieve all business owner transactions with filtering and pagination options.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: ['credit', 'debit'], required: false, description: 'Filter by transaction type' }),
    (0, swagger_1.ApiQuery)({
        name: 'category',
        enum: ['booking_payment', 'commission', 'commission_payment', 'settlement', 'reward_points', 'refund', 'adjustment', 'withdrawal'],
        required: false,
        description: 'Filter by transaction category'
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: ['pending', 'completed', 'failed', 'reversed'], required: false, description: 'Filter by transaction status' }),
    (0, swagger_1.ApiQuery)({ name: 'businessOwnerId', required: false, description: 'Filter by business owner ID' }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by description or remark' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number for pagination', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of items per page', example: 20 }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', enum: ['createdAt', 'amount', 'type', 'category'], required: false, description: 'Sort field' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', enum: ['ASC', 'DESC'], required: false, description: 'Sort order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All business owner transactions retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Query)(vendor_transaction_query_validation_pipe_1.VendorTransactionQueryValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [business_owner_transaction_history_dto_1.BusinessOwnerTransactionHistoryQueryDto]),
    __metadata("design:returntype", Promise)
], BusinessOwnerTransactionHistoryController.prototype, "getAllBusinessOwnerTransactions", null);
__decorate([
    (0, common_1.Get)('day-wise'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get business owner transactions grouped by day',
        description: 'Retrieve business owner transactions aggregated by date with daily summaries.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, description: 'Filter by specific date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'businessOwnerId', required: false, description: 'Filter by business owner ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Day-wise transactions retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessOwnerTransactionHistoryController.prototype, "getTransactionDayWise", null);
__decorate([
    (0, common_1.Get)(':transactionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transaction by ID',
        description: 'Retrieve detailed information for a specific business owner transaction.',
    }),
    (0, swagger_1.ApiParam)({ name: 'transactionId', description: 'Transaction ID (UUID)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Not a business owner transaction' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerTransactionHistoryController.prototype, "getTransactionById", null);
__decorate([
    (0, common_1.Put)(':transactionId/remark'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update transaction remark',
        description: 'Update the remark for a specific business owner transaction.',
    }),
    (0, swagger_1.ApiParam)({ name: 'transactionId', description: 'Transaction ID (UUID)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction remark updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Not a business owner transaction' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, business_owner_transaction_history_dto_1.UpdateTransactionRemarkDto]),
    __metadata("design:returntype", Promise)
], BusinessOwnerTransactionHistoryController.prototype, "updateTransactionRemark", null);
__decorate([
    (0, common_1.Delete)(':transactionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete transaction',
        description: 'Delete a business owner transaction (only pending or failed transactions can be deleted).',
    }),
    (0, swagger_1.ApiParam)({ name: 'transactionId', description: 'Transaction ID (UUID)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete completed transactions or not a business owner transaction' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessOwnerTransactionHistoryController.prototype, "deleteTransaction", null);
exports.BusinessOwnerTransactionHistoryController = BusinessOwnerTransactionHistoryController = BusinessOwnerTransactionHistoryController_1 = __decorate([
    (0, swagger_1.ApiTags)('Admin - Business Owner Transaction History'),
    (0, common_1.Controller)('admin/business-owner-transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    __metadata("design:paramtypes", [business_owner_transaction_history_service_1.BusinessOwnerTransactionHistoryService])
], BusinessOwnerTransactionHistoryController);
//# sourceMappingURL=business-owner-transaction-history.controller.js.map
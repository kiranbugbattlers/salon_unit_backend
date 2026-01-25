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
exports.UserAddressController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const user_address_service_1 = require("./user-address.service");
const dto_1 = require("./dto");
let UserAddressController = class UserAddressController {
    constructor(userAddressService) {
        this.userAddressService = userAddressService;
    }
    async getUserAddresses(req) {
        return this.userAddressService.getUserAddresses(req.user.userId);
    }
    async getAddressById(req, addressId) {
        return this.userAddressService.getAddressById(req.user.userId, addressId);
    }
    async createAddress(req, createAddressDto) {
        return this.userAddressService.createAddress(req.user.userId, createAddressDto);
    }
    async updateAddress(req, addressId, updateAddressDto) {
        return this.userAddressService.updateAddress(req.user.userId, addressId, updateAddressDto);
    }
    async deleteAddress(req, addressId) {
        return this.userAddressService.deleteAddress(req.user.userId, addressId);
    }
};
exports.UserAddressController = UserAddressController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all addresses for the current user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of user addresses',
        type: dto_1.UserAddressListResponseDto
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserAddressController.prototype, "getUserAddresses", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific address by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User address details',
        type: dto_1.UserAddressSingleResponseDto
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserAddressController.prototype, "getAddressById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new address' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Address created successfully',
        type: dto_1.UserAddressCreateResponseDto
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateUserAddressDto]),
    __metadata("design:returntype", Promise)
], UserAddressController.prototype, "createAddress", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an existing address' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Address updated successfully',
        type: dto_1.UserAddressUpdateResponseDto
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateUserAddressDto]),
    __metadata("design:returntype", Promise)
], UserAddressController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an address' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Address deleted successfully',
        type: dto_1.UserAddressDeleteResponseDto
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserAddressController.prototype, "deleteAddress", null);
exports.UserAddressController = UserAddressController = __decorate([
    (0, swagger_1.ApiTags)('User Addresses'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('user/addresses'),
    __metadata("design:paramtypes", [user_address_service_1.UserAddressService])
], UserAddressController);
//# sourceMappingURL=user-address.controller.js.map
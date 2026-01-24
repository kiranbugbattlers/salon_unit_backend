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
exports.UserAddressService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
const dto_1 = require("./dto");
let UserAddressService = class UserAddressService {
    constructor(userAddressRepository, userRepository) {
        this.userAddressRepository = userAddressRepository;
        this.userRepository = userRepository;
    }
    async getUserAddresses(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const addresses = await this.userAddressRepository.find({
            where: { userId, isActive: true },
            order: { isPrimary: 'DESC', createdAt: 'DESC' },
        });
        return new dto_1.UserAddressListResponseDto(200, true, 'User addresses retrieved successfully', addresses);
    }
    async getAddressById(userId, addressId) {
        const address = await this.userAddressRepository.findOne({
            where: { id: addressId, userId, isActive: true },
        });
        if (!address) {
            throw new common_1.NotFoundException('Address not found');
        }
        return new dto_1.UserAddressSingleResponseDto(200, true, 'User address retrieved successfully', address);
    }
    async createAddress(userId, createAddressDto) {
        try {
            console.log('Creating address for user:', userId, 'with data:', createAddressDto);
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (createAddressDto.isPrimary) {
                await this.userAddressRepository.update({ userId, isPrimary: true }, { isPrimary: false });
            }
            const address = this.userAddressRepository.create({
                userId,
                ...createAddressDto,
            });
            console.log('Created address entity:', address);
            const savedAddress = await this.userAddressRepository.save(address);
            console.log('Saved address:', savedAddress);
            const responseData = {
                id: savedAddress.id,
                userId: savedAddress.userId,
                addressType: savedAddress.addressType,
                latitude: savedAddress.latitude,
                longitude: savedAddress.longitude,
                streetAddress: savedAddress.streetAddress,
                addressLine1: savedAddress.addressLine1,
                addressLine2: savedAddress.addressLine2,
                landmark: savedAddress.landmark,
                city: savedAddress.city,
                state: savedAddress.state,
                postalCode: savedAddress.postalCode,
                country: savedAddress.country,
                isPrimary: savedAddress.isPrimary,
                isActive: savedAddress.isActive,
                createdAt: savedAddress.createdAt,
                updatedAt: savedAddress.updatedAt,
            };
            return new dto_1.UserAddressCreateResponseDto(201, true, 'Address created successfully', responseData);
        }
        catch (error) {
            console.error('Error creating address:', error);
            throw error;
        }
    }
    async updateAddress(userId, addressId, updateAddressDto) {
        const address = await this.userAddressRepository.findOne({
            where: { id: addressId, userId, isActive: true },
        });
        if (!address) {
            throw new common_1.NotFoundException('Address not found');
        }
        if (updateAddressDto.isPrimary) {
            await this.userAddressRepository.update({ userId, isPrimary: true }, { isPrimary: false });
        }
        Object.assign(address, updateAddressDto);
        const updatedAddress = await this.userAddressRepository.save(address);
        return new dto_1.UserAddressUpdateResponseDto(200, true, 'Address updated successfully', updatedAddress);
    }
    async deleteAddress(userId, addressId) {
        const address = await this.userAddressRepository.findOne({
            where: { id: addressId, userId, isActive: true },
        });
        if (!address) {
            throw new common_1.NotFoundException('Address not found');
        }
        address.isActive = false;
        await this.userAddressRepository.save(address);
        return new dto_1.UserAddressDeleteResponseDto(200, true, 'Address deleted successfully', { message: 'Address deleted successfully' });
    }
};
exports.UserAddressService = UserAddressService;
exports.UserAddressService = UserAddressService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.UserAddress)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserAddressService);
//# sourceMappingURL=user-address.service.js.map
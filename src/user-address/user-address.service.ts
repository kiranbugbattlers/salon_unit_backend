import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddress, User } from '../database/entities';
import {
  CreateUserAddressDto,
  UpdateUserAddressDto,
  UserAddressResponseDto,
  UserAddressListResponseDto,
  UserAddressSingleResponseDto,
  UserAddressCreateResponseDto,
  UserAddressUpdateResponseDto,
  UserAddressDeleteResponseDto,
} from './dto';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserAddresses(userId: string): Promise<UserAddressListResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const addresses = await this.userAddressRepository.find({
      where: { userId, isActive: true },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });

    return new UserAddressListResponseDto(
      200,
      true,
      'User addresses retrieved successfully',
      addresses
    );
  }

  async getAddressById(userId: string, addressId: string): Promise<UserAddressSingleResponseDto> {
    const address = await this.userAddressRepository.findOne({
      where: { id: addressId, userId, isActive: true },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return new UserAddressSingleResponseDto(
      200,
      true,
      'User address retrieved successfully',
      address
    );
  }

  async createAddress(userId: string, createAddressDto: CreateUserAddressDto): Promise<UserAddressCreateResponseDto> {
    try {
      console.log('Creating address for user:', userId, 'with data:', createAddressDto);

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // If this is marked as primary, make all other addresses non-primary
      if (createAddressDto.isPrimary) {
        await this.userAddressRepository.update(
          { userId, isPrimary: true },
          { isPrimary: false }
        );
      }

      const address = this.userAddressRepository.create({
        userId,
        ...createAddressDto,
      });

      console.log('Created address entity:', address);

      const savedAddress = await this.userAddressRepository.save(address);
      console.log('Saved address:', savedAddress);

      // Map entity to response DTO
      const responseData: UserAddressResponseDto = {
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

      return new UserAddressCreateResponseDto(
        201,
        true,
        'Address created successfully',
        responseData
      );
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }

  async updateAddress(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateUserAddressDto,
  ): Promise<UserAddressUpdateResponseDto> {
    const address = await this.userAddressRepository.findOne({
      where: { id: addressId, userId, isActive: true },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // If this is being marked as primary, make all other addresses non-primary
    if (updateAddressDto.isPrimary) {
      await this.userAddressRepository.update(
        { userId, isPrimary: true },
        { isPrimary: false }
      );
    }

    Object.assign(address, updateAddressDto);
    const updatedAddress = await this.userAddressRepository.save(address);
    
    return new UserAddressUpdateResponseDto(
      200,
      true,
      'Address updated successfully',
      updatedAddress
    );
  }

  async deleteAddress(userId: string, addressId: string): Promise<UserAddressDeleteResponseDto> {
    const address = await this.userAddressRepository.findOne({
      where: { id: addressId, userId, isActive: true },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Soft delete - mark as inactive
    address.isActive = false;
    await this.userAddressRepository.save(address);

    return new UserAddressDeleteResponseDto(
      200,
      true,
      'Address deleted successfully',
      { message: 'Address deleted successfully' }
    );
  }
}
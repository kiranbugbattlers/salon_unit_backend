import { Repository } from 'typeorm';
import { UserAddress, User } from '../database/entities';
import { CreateUserAddressDto, UpdateUserAddressDto, UserAddressListResponseDto, UserAddressSingleResponseDto, UserAddressCreateResponseDto, UserAddressUpdateResponseDto, UserAddressDeleteResponseDto } from './dto';
export declare class UserAddressService {
    private userAddressRepository;
    private userRepository;
    constructor(userAddressRepository: Repository<UserAddress>, userRepository: Repository<User>);
    getUserAddresses(userId: string): Promise<UserAddressListResponseDto>;
    getAddressById(userId: string, addressId: string): Promise<UserAddressSingleResponseDto>;
    createAddress(userId: string, createAddressDto: CreateUserAddressDto): Promise<UserAddressCreateResponseDto>;
    updateAddress(userId: string, addressId: string, updateAddressDto: UpdateUserAddressDto): Promise<UserAddressUpdateResponseDto>;
    deleteAddress(userId: string, addressId: string): Promise<UserAddressDeleteResponseDto>;
}

import { UserAddressService } from './user-address.service';
import { CreateUserAddressDto, UpdateUserAddressDto, UserAddressListResponseDto, UserAddressSingleResponseDto, UserAddressCreateResponseDto, UserAddressUpdateResponseDto, UserAddressDeleteResponseDto } from './dto';
export declare class UserAddressController {
    private readonly userAddressService;
    constructor(userAddressService: UserAddressService);
    getUserAddresses(req: any): Promise<UserAddressListResponseDto>;
    getAddressById(req: any, addressId: string): Promise<UserAddressSingleResponseDto>;
    createAddress(req: any, createAddressDto: CreateUserAddressDto): Promise<UserAddressCreateResponseDto>;
    updateAddress(req: any, addressId: string, updateAddressDto: UpdateUserAddressDto): Promise<UserAddressUpdateResponseDto>;
    deleteAddress(req: any, addressId: string): Promise<UserAddressDeleteResponseDto>;
}

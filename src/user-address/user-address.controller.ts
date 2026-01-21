import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserAddressService } from './user-address.service';
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

@ApiTags('User Addresses')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('user/addresses')
export class UserAddressController {
  constructor(private readonly userAddressService: UserAddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for the current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user addresses',
    type: UserAddressListResponseDto 
  })
  async getUserAddresses(@Request() req: any): Promise<UserAddressListResponseDto> {
    return this.userAddressService.getUserAddresses(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific address by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User address details',
    type: UserAddressSingleResponseDto 
  })
  async getAddressById(
    @Request() req: any,
    @Param('id') addressId: string,
  ): Promise<UserAddressSingleResponseDto> {
    return this.userAddressService.getAddressById(req.user.userId, addressId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ 
    status: 201, 
    description: 'Address created successfully',
    type: UserAddressCreateResponseDto 
  })
  async createAddress(
    @Request() req: any,
    @Body() createAddressDto: CreateUserAddressDto,
  ): Promise<UserAddressCreateResponseDto> {
    return this.userAddressService.createAddress(req.user.userId, createAddressDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing address' })
  @ApiResponse({ 
    status: 200, 
    description: 'Address updated successfully',
    type: UserAddressUpdateResponseDto 
  })
  async updateAddress(
    @Request() req: any,
    @Param('id') addressId: string,
    @Body() updateAddressDto: UpdateUserAddressDto,
  ): Promise<UserAddressUpdateResponseDto> {
    return this.userAddressService.updateAddress(req.user.userId, addressId, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ 
    status: 200, 
    description: 'Address deleted successfully',
    type: UserAddressDeleteResponseDto 
  })
  async deleteAddress(
    @Request() req: any,
    @Param('id') addressId: string,
  ): Promise<UserAddressDeleteResponseDto> {
    return this.userAddressService.deleteAddress(req.user.userId, addressId);
  }
}
import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { UserAddressResponseDto } from './user-address-response.dto';

export class UserAddressListResponseDto extends ApiResponseDto<UserAddressResponseDto[]> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'User addresses retrieved successfully' })
  message: string;

  @ApiProperty({ type: [UserAddressResponseDto] })
  data: UserAddressResponseDto[];

  constructor(code: number = 200, success: boolean = true, message: string = 'User addresses retrieved successfully', data: UserAddressResponseDto[]) {
    super(code, success, message, data);
  }
}

export class UserAddressSingleResponseDto extends ApiResponseDto<UserAddressResponseDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'User address retrieved successfully' })
  message: string;

  @ApiProperty({ type: UserAddressResponseDto })
  data: UserAddressResponseDto;

  constructor(code: number = 200, success: boolean = true, message: string, data: UserAddressResponseDto) {
    super(code, success, message, data);
  }
}

export class UserAddressCreateResponseDto extends ApiResponseDto<UserAddressResponseDto> {
  @ApiProperty({ example: 201 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Address created successfully' })
  message: string;

  @ApiProperty({ type: UserAddressResponseDto })
  data: UserAddressResponseDto;

  constructor(code: number = 201, success: boolean = true, message: string = 'Address created successfully', data: UserAddressResponseDto) {
    super(code, success, message, data);
  }
}

export class UserAddressUpdateResponseDto extends ApiResponseDto<UserAddressResponseDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Address updated successfully' })
  message: string;

  @ApiProperty({ type: UserAddressResponseDto })
  data: UserAddressResponseDto;

  constructor(code: number = 200, success: boolean = true, message: string = 'Address updated successfully', data: UserAddressResponseDto) {
    super(code, success, message, data);
  }
}

export class UserAddressDeleteData {
  @ApiProperty({ example: 'Address deleted successfully' })
  message: string;
}

export class UserAddressDeleteResponseDto extends ApiResponseDto<UserAddressDeleteData> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Address deleted successfully' })
  message: string;

  @ApiProperty({ type: UserAddressDeleteData })
  data: UserAddressDeleteData;

  constructor(code: number = 200, success: boolean = true, message: string = 'Address deleted successfully', data: UserAddressDeleteData) {
    super(code, success, message, data);
  }
}
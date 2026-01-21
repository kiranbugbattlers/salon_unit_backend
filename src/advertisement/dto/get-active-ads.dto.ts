import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { AdUserType } from '../../common/enums';

export class GetActiveAdsDto {
  @ApiProperty({
    enum: AdUserType,
    description: 'User type requesting ads',
    example: AdUserType.CUSTOMER,
  })
  @IsEnum(AdUserType)
  userType: AdUserType;

  @ApiProperty({
    description: 'Current screen name',
    example: 'home',
  })
  @IsString()
  screen: string;
}

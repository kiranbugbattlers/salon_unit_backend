import { ApiProperty } from '@nestjs/swagger';
import { Gender, ServiceLocationType } from '../../common/enums';
import { VendorStatus } from '../../common/enums/vendor-status.enum';
import { BusinessOwnerOnboardingStatusDto } from './business-owner-onboarding-status.dto';

export class BusinessAddressDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  addressType: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  streetAddress: string;

  @ApiProperty({ required: false })
  addressLine1?: string;

  @ApiProperty({ required: false })
  addressLine2?: string;

  @ApiProperty({ required: false })
  landmark?: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  isActive: boolean;
}

export class BusinessOwnerProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({
    description: 'Unique shop identifier with format SH-XXXXXX',
    example: 'SH-A1B2C3'
  })
  shopId: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ enum: Gender, required: false })
  gender?: Gender;

  @ApiProperty({ required: false })
  dateOfBirth?: Date;

  @ApiProperty({ required: false })
  businessName?: string;

  @ApiProperty({ required: false })
  businessDescription?: string;

  @ApiProperty({ required: false })
  operatingYears?: number;

  @ApiProperty()
  phone: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  profilePic?: string;

  @ApiProperty({ required: false })
  profilePicCdnUrl?: string;

  @ApiProperty({ required: false })
  profilePicS3Key?: string;

  @ApiProperty()
  isPhoneVerified: boolean;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty({ required: false })
  address?: BusinessAddressDto;

  @ApiProperty()
  onboarding: BusinessOwnerOnboardingStatusDto;

  @ApiProperty({ required: false, nullable: true })
  averageRating?: number;

  @ApiProperty({ example: 0 })
  reviewCount: number;

  @ApiProperty({ description: 'UPI ID for payments', required: false })
  upiId?: string;

  @ApiProperty({ description: 'Credit limit assigned by admin', required: false })
  creditLimit?: number;

  @ApiProperty({ enum: VendorStatus, description: 'Vendor status for service visibility' })
  vendorStatus?: VendorStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}


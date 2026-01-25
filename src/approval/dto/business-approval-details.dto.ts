import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { BankingInfo } from '../../database/entities/banking-info.entity';

export class BusinessMediaDto {
  @ApiProperty({ description: 'Media ID' })
  id: string;

  @ApiProperty({ description: 'Media URL' })
  mediaUrl: string;

  @ApiProperty({ description: 'Media type', enum: ['image', 'video', 'document'] })
  mediaType: string;

  @ApiProperty({ description: 'Media description' })
  description?: string;

  @ApiProperty({ description: 'Is primary media' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;
}

export class BusinessAddressDto {
  @ApiProperty({ description: 'Address ID' })
  id: string;

  @ApiProperty({ description: 'Street address' })
  streetAddress: string;

  @ApiProperty({ description: 'City' })
  city: string;

  @ApiProperty({ description: 'State' })
  state: string;

  @ApiProperty({ description: 'Pincode' })
  pincode: string;

  @ApiProperty({ description: 'Latitude' })
  latitude?: number;

  @ApiProperty({ description: 'Longitude' })
  longitude?: number;

  @ApiProperty({ description: 'Is primary address' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;
}

export class BusinessOperatingHoursDto {
  @ApiProperty({ description: 'Day of week' })
  dayOfWeek: string;

  @ApiProperty({ description: 'Opening time' })
  openingTime: string;

  @ApiProperty({ description: 'Closing time' })
  closingTime: string;

  @ApiProperty({ description: 'Is open' })
  isOpen: boolean;
}

export class BusinessDocumentDto {
  @ApiProperty({ description: 'Document ID' })
  id: string;

  @ApiProperty({ description: 'Document type' })
  documentType: string;

  @ApiProperty({ description: 'Document URL' })
  documentUrl: string;

  @ApiProperty({ description: 'Document status', enum: ['pending', 'verified', 'rejected'] })
  status: string;

  @ApiProperty({ description: 'Rejection reason' })
  rejectionReason?: string;

  @ApiProperty({ description: 'Uploaded at' })
  uploadedAt: Date;

  @ApiProperty({ description: 'Verified at' })
  verifiedAt?: Date;
}

export class BankingInfoDto {
  @ApiProperty({ description: 'Banking info ID' })
  id: string;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Account holder name' })
  accountHolderName: string;

  @ApiProperty({ description: 'Account number (clear)' })
  accountNumber?: string;

  @ApiProperty({ description: 'IFSC code' })
  ifscCode?: string;

  @ApiProperty({ description: 'Branch name' })
  branchName?: string;

  @ApiProperty({ description: 'Is verified' })
  isVerified: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;
}

export class ReviewDto {
  @ApiProperty({ description: 'Review ID' })
  id: string;

  @ApiProperty({ description: 'Customer name' })
  customerName: string;

  @ApiProperty({ description: 'Rating' })
  rating: number;

  @ApiProperty({ description: 'Review comment' })
  comment?: string;

  @ApiProperty({ description: 'Review date' })
  reviewDate: Date;

  @ApiProperty({ description: 'Is verified purchase' })
  isVerifiedPurchase: boolean;
}

export class BusinessOwnerInfoDto {
  @ApiProperty({ description: 'Owner ID' })
  id: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'Email (read-only)' })
  email: string;

  @ApiProperty({ description: 'Mobile number (read-only)' })
  mobileNumber: string;

  @ApiProperty({ description: 'Business name' })
  businessName: string;

  @ApiProperty({ description: 'Business description' })
  businessDescription?: string;

  @ApiProperty({ description: 'Is approved' })
  isApproved: boolean;

  @ApiProperty({ description: 'Approved at' })
  approvedAt?: Date;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ 
    description: 'UPI ID of the business owner',
    required: false
  })
  upiId?: string;

  @ApiProperty({ 
    description: 'Credit limit assigned to the vendor',
    required: false
  })
  creditLimit?: number;

  @ApiProperty({ 
    description: 'Vendor status',
    required: false
  })
  vendorStatus?: string;
}

export class BusinessInfoDto {
  @ApiProperty({ description: 'Business ID' })
  id: string;

  @ApiProperty({ description: 'Business name' })
  name: string;

  @ApiProperty({ description: 'Business description' })
  description?: string;

  @ApiProperty({ description: 'Business category' })
  category?: string;

  @ApiProperty({ description: 'Business phone' })
  phone?: string;

  @ApiProperty({ description: 'Business email' })
  email?: string;

  @ApiProperty({ description: 'Website' })
  website?: string;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

export class BusinessApprovalDetailsDto {
  @ApiProperty({ description: 'Business owner information' })
  businessOwner: BusinessOwnerInfoDto;

  @ApiProperty({ description: 'Business information' })
  business: BusinessInfoDto;

  @ApiProperty({ description: 'Business media' })
  media: BusinessMediaDto[];

  @ApiProperty({ description: 'Business addresses' })
  addresses: BusinessAddressDto[];

  @ApiProperty({ description: 'Operating hours' })
  operatingHours: BusinessOperatingHoursDto[];

  @ApiProperty({ description: 'Business documents' })
  documents: BusinessDocumentDto[];

  @ApiProperty({ description: 'Banking information' })
  bankingInfo: BankingInfo[];

  @ApiProperty({ description: 'Customer reviews' })
  reviews: ReviewDto[];
}

export class BusinessApprovalListDto {
  @ApiProperty({ description: 'Business approval details' })
  data: BusinessApprovalDetailsDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class UpdateBusinessApprovalDto {
  @ApiProperty({ description: 'Business name', required: false })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({ description: 'Business description', required: false })
  @IsOptional()
  @IsString()
  businessDescription?: string;

  @ApiProperty({ description: 'Business phone', required: false })
  @IsOptional()
  @IsString()
  businessPhone?: string;

  @ApiProperty({ description: 'Business email', required: false })
  @IsOptional()
  @IsString()
  businessEmail?: string;

  @ApiProperty({ description: 'Website', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ description: 'Business category', required: false })
  @IsOptional()
  @IsString()
  businessCategory?: string;

  @ApiProperty({ description: 'Street address', required: false })
  @IsOptional()
  @IsString()
  streetAddress?: string;

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'State', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Pincode', required: false })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiProperty({ description: 'Latitude', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiProperty({ description: 'Longitude', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({ description: 'Bank name', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ description: 'Account holder name', required: false })
  @IsOptional()
  @IsString()
  accountHolderName?: string;

  @ApiProperty({ description: 'IFSC code', required: false })
  @IsOptional()
  @IsString()
  ifscCode?: string;

  @ApiProperty({ description: 'Branch name', required: false })
  @IsOptional()
  @IsString()
  branchName?: string;

  @ApiProperty({ description: 'Approval status', required: false, enum: ['pending', 'approved', 'rejected'] })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'])
  approvalStatus?: string;

  @ApiProperty({ description: 'Review notes', required: false })
  @IsOptional()
  @IsString()
  reviewNotes?: string;

  @ApiProperty({ description: 'Rejection reason', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty({ 
    description: 'UPI ID of the business owner',
    required: false
  })
  @IsOptional()
  @IsString()
  upiId?: string;

  @ApiProperty({ 
    description: 'Credit limit assigned to the vendor',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  creditLimit?: number;

  @ApiProperty({ 
    description: 'Vendor status',
    required: false
  })
  @IsOptional()
  @IsString()
  vendorStatus?: string;
}

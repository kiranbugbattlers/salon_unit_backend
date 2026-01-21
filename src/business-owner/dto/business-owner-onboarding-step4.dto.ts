import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, Max, IsString, Length, Matches, IsOptional } from 'class-validator';

export class BusinessOwnerOnboardingStep4Dto {
  @ApiProperty({
    description: 'Years of operating experience',
    example: 8,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(50)
  operatingYears: number;

  @ApiProperty({
    description: 'Bank account number for settlement payouts',
    example: '1234567890123456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(9, 18)
  accountNumber: string;

  @ApiProperty({
    description: 'Account holder name as per bank records',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  accountHolderName: string;

  @ApiProperty({
    description: 'IFSC code of the bank branch (11 characters)',
    example: 'SBIN0001234',
  })
  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message: 'IFSC code must be in valid format (e.g., SBIN0001234)',
  })
  ifscCode: string;

  @ApiProperty({
    description: 'Bank name',
    example: 'State Bank of India',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  bankName: string;

  @ApiProperty({
    description: 'Bank branch name (optional)',
    example: 'Bangalore Main Branch',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  branch?: string;
}
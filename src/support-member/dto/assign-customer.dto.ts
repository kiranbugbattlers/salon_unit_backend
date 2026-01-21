import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class AssignCustomerDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'Support member ID', required: false })
  @IsOptional()
  @IsUUID()
  supportMemberId?: string;

  @ApiProperty({ description: 'Notes about the assignment', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ReassignCustomerDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'New support member ID (leave empty for auto-assignment)' })
  @IsOptional()
  @IsUUID()
  newSupportMemberId?: string;

  @ApiProperty({ description: 'Reason for reassignment', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

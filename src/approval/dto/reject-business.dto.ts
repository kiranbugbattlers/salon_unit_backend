import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class RejectBusinessDto {
  @ApiProperty({
    description: 'Reason for rejecting the business',
    example: 'Incomplete documentation or business does not meet quality standards.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  rejectionReason: string;

  @ApiProperty({
    description: 'Optional additional review notes',
    example: 'Business can reapply after addressing the mentioned issues.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNotes?: string;
}
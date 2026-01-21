import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelSubscriptionDto {
  @ApiProperty({
    description: 'Reason for cancellation',
    example: 'No longer need the service',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancellationReason?: string;
}
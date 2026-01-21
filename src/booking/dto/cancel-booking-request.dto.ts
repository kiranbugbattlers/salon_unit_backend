import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CancelBookingRequestDto {
  @ApiProperty({
    description: 'Optional reason for cancellation',
    example: 'Schedule conflict - need to reschedule',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Cancellation reason cannot exceed 500 characters',
  })
  cancellationReason?: string;
}

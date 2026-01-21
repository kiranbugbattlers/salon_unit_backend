import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';

export class OnboardingStep4Dto {
  @ApiProperty({
    description: 'Preferred time slot IDs',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsUUID(4, { each: true })
  preferredTimeSlotIds: string[];

  @ApiProperty({
    description: 'Preferred days of week (1=Monday, 7=Sunday)',
    example: [1, 2, 3, 4, 5],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  preferredDays?: number[];
}
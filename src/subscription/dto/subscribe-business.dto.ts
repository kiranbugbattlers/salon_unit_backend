import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class SubscribeBusinessDto {
  @ApiProperty({
    description: 'ID of the subscription plan to subscribe to (get this from GET /subscription/plans)',
    example: 'b8c4f2e1-3a5b-4d6c-9e7f-1a2b3c4d5e6f',
  })
  @IsNotEmpty()
  @IsUUID()
  subscriptionPlanId: string;

  @ApiProperty({
    description: 'Enable automatic renewal when subscription expires (only applies to monthly/yearly plans, ignored for one-time plans)',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}
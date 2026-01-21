import { ApiProperty } from '@nestjs/swagger';

export class BusinessOwnerOnboardingStatusDto {
  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  currentStep: number;

  @ApiProperty({ type: [Number] })
  completedSteps: number[];

  @ApiProperty()
  progressPercentage: number;

  @ApiProperty()
  stepData: {
    step1: any;
    step2: any;
    step3: any;
    step4: any;
  };
}
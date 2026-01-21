import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class OnboardingStepResponseData {
  @ApiProperty({ example: 2 })
  nextStep: number;
}

export class OnboardingStepResponseDto extends ApiResponseDto<OnboardingStepResponseData> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Step completed successfully' })
  message: string;

  @ApiProperty()
  data: OnboardingStepResponseData;

  constructor(code: number = 200, success: boolean = true, message: string, data: OnboardingStepResponseData) {
    super(code, success, message, data);
  }
}

export class OnboardingCompletionData {
  @ApiProperty({ example: true })
  completed: boolean;
}

export class OnboardingCompletionResponseDto extends ApiResponseDto<OnboardingCompletionData> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Onboarding completed successfully!' })
  message: string;

  @ApiProperty()
  data: OnboardingCompletionData;

  constructor(code: number = 200, success: boolean = true, message: string, data: OnboardingCompletionData) {
    super(code, success, message, data);
  }
}

export class OnboardingStatusData {
  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  currentStep: number;

  @ApiProperty()
  completedSteps: number[];

  @ApiProperty()
  progressPercentage: number;

  @ApiProperty()
  stepData: Record<string, any>;
}

export class OnboardingStatusResponseDto extends ApiResponseDto<OnboardingStatusData> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Onboarding status retrieved successfully' })
  message: string;

  @ApiProperty()
  data: OnboardingStatusData;

  constructor(code: number = 200, success: boolean = true, message: string = 'Onboarding status retrieved successfully', data: OnboardingStatusData) {
    super(code, success, message, data);
  }
}

export class CustomerProfileResponseDto extends ApiResponseDto<any> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Customer profile retrieved successfully' })
  message: string;

  @ApiProperty()
  data: any;

  constructor(code: number = 200, success: boolean = true, message: string = 'Customer profile retrieved successfully', data: any) {
    super(code, success, message, data);
  }
}
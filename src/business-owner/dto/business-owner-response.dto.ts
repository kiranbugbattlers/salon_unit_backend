import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class BusinessOwnerOnboardingStepResponseData {
  @ApiProperty({ example: 2 })
  nextStep: number;

  @ApiProperty({ example: false, required: false })
  skipStep1?: boolean;
}

export class BusinessOwnerOnboardingStepResponseDto extends ApiResponseDto<BusinessOwnerOnboardingStepResponseData> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Step completed successfully' })
  message: string;

  @ApiProperty()
  data: BusinessOwnerOnboardingStepResponseData;

  constructor(code: number = 200, success: boolean = true, message: string, data: BusinessOwnerOnboardingStepResponseData) {
    super(code, success, message, data);
  }
}

export class BusinessOwnerOnboardingCompletionData {
  @ApiProperty({ example: true })
  completed: boolean;
}

export class BusinessOwnerOnboardingCompletionResponseDto extends ApiResponseDto<BusinessOwnerOnboardingCompletionData> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business owner onboarding completed successfully! Your business registration is now being reviewed by our team. You will be notified once approved.' })
  message: string;

  @ApiProperty()
  data: BusinessOwnerOnboardingCompletionData;

  constructor(code: number = 200, success: boolean = true, message: string, data: BusinessOwnerOnboardingCompletionData) {
    super(code, success, message, data);
  }
}

export class BusinessOwnerOnboardingStatusData {
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

export class BusinessOwnerOnboardingStatusResponseDto extends ApiResponseDto<BusinessOwnerOnboardingStatusData> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business owner onboarding status retrieved successfully' })
  message: string;

  @ApiProperty()
  data: BusinessOwnerOnboardingStatusData;

  constructor(code: number = 200, success: boolean = true, message: string = 'Business owner onboarding status retrieved successfully', data: BusinessOwnerOnboardingStatusData) {
    super(code, success, message, data);
  }
}

export class BusinessOwnerProfileResponseDto extends ApiResponseDto<any> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business owner profile retrieved successfully' })
  message: string;

  @ApiProperty()
  data: any;

  constructor(code: number = 200, success: boolean = true, message: string = 'Business owner profile retrieved successfully', data: any) {
    super(code, success, message, data);
  }
}
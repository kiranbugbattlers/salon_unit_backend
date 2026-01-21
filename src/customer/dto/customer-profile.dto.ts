import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../common/enums';

export class OnboardingProgressDto {
  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  currentStep: number;

  @ApiProperty()
  completedSteps: number[];

  @ApiProperty()
  progressPercentage: number;

  @ApiProperty()
  stepData: {
    step1?: any;
    step2?: any;
    step3?: any;
    step4?: any;
  };
}

export class CustomerProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  gender?: Gender;

  @ApiProperty()
  dateOfBirth?: Date;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  profilePic?: string;

  @ApiProperty()
  profilePicCdnUrl?: string;

  @ApiProperty()
  profilePicS3Key?: string;

  @ApiProperty()
  isPhoneVerified: boolean;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  onboarding: OnboardingProgressDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
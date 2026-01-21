import { ApiProperty } from '@nestjs/swagger';

export class RoleOnboardingDto {
  @ApiProperty()
  isRequired: boolean;

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

export class OnboardingStatusDto {
  @ApiProperty({ required: false })
  customer?: RoleOnboardingDto;

  @ApiProperty({ required: false })
  businessOwner?: RoleOnboardingDto;
}

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  profilePic?: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ type: [String] })
  roles: string[];

  @ApiProperty()
  isPhoneVerified: boolean;

  @ApiProperty()
  isEmailVerified: boolean;
}

export class TokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty()
  user: UserDto;

  @ApiProperty()
  onboarding: OnboardingStatusDto;

  @ApiProperty()
  tokens: TokensDto;

  @ApiProperty()
  isNewUser: boolean;
}
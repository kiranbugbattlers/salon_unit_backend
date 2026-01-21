import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { CustomerService } from './customer.service';
import { AssignmentService } from '../support-member/assignment.service';
import {
  OnboardingStep1Dto,
  OnboardingStep2Dto,
  OnboardingStep3Dto,
  OnboardingStep4Dto,
  OnboardingStepResponseDto,
  OnboardingCompletionResponseDto,
  OnboardingStatusResponseDto,
  CustomerProfileResponseDto,
  UpdateCustomerProfileDto,
  UpdateProfileResponseDto,
  FavoritesResponseDto,
  FavoritesPaginationDto,
  FavoriteActionResponseDto,
} from './dto';

@ApiTags('Customer')
@Controller('customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@ApiBearerAuth('JWT')
export class CustomerController {
  constructor(
    private customerService: CustomerService,
    private assignmentService: AssignmentService,
  ) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Get customer profile',
    description: 'Returns the full customer profile with onboarding status and addresses',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer profile retrieved successfully',
    type: CustomerProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a customer',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer profile not found',
  })
  async getProfile(@CurrentUser() user: CurrentUserData): Promise<CustomerProfileResponseDto> {
    return this.customerService.getCustomerProfile(user.userId);
  }

  @Get('onboarding/status')
  @ApiOperation({
    summary: 'Get onboarding status',
    description: 'Returns the current onboarding progress and step data',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding status retrieved successfully',
    type: OnboardingStatusResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getOnboardingStatus(@CurrentUser() user: CurrentUserData): Promise<OnboardingStatusResponseDto> {
    return this.customerService.getOnboardingStatus(user.userId);
  }

  @Post('onboarding/step1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete onboarding step 1 - Basic Information',
    description: 'Complete the first step of onboarding with basic customer information (name, email, gender)',
  })
  @ApiResponse({
    status: 200,
    description: 'Step 1 completed successfully',
    type: OnboardingStepResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async completeStep1(
    @CurrentUser() user: CurrentUserData,
    @Body() step1Data: OnboardingStep1Dto,
  ): Promise<OnboardingStepResponseDto> {
    return this.customerService.completeOnboardingStep1(user.userId, step1Data);
  }

  @Post('onboarding/step2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete onboarding step 2 - Address Information',
    description: 'Complete the second step of onboarding with address and location data',
  })
  @ApiResponse({
    status: 200,
    description: 'Step 2 completed successfully',
    type: OnboardingStepResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async completeStep2(
    @CurrentUser() user: CurrentUserData,
    @Body() step2Data: OnboardingStep2Dto,
  ): Promise<OnboardingStepResponseDto> {
    return this.customerService.completeOnboardingStep2(user.userId, step2Data);
  }

  @Post('onboarding/step3')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete onboarding step 3 - Service Preferences',
    description: 'Complete the third step of onboarding with hair type and service preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Step 3 completed successfully',
    type: OnboardingStepResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async completeStep3(
    @CurrentUser() user: CurrentUserData,
    @Body() step3Data: OnboardingStep3Dto,
  ): Promise<OnboardingStepResponseDto> {
    return this.customerService.completeOnboardingStep3(user.userId, step3Data);
  }

  @Post('onboarding/step4')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete onboarding step 4 - Timing Preferences',
    description: 'Complete the final step of onboarding with timing preferences and finish the onboarding process',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completed successfully',
    type: OnboardingCompletionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async completeStep4(
    @CurrentUser() user: CurrentUserData,
    @Body() step4Data: OnboardingStep4Dto,
  ): Promise<OnboardingCompletionResponseDto> {
    return this.customerService.completeOnboardingStep4(user.userId, step4Data);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update customer profile',
    description: 'Update customer profile information. Note: Phone number, email, and profilePic cannot be changed via this endpoint to maintain signup method integrity. Use dedicated endpoints for profile picture management.',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer profile updated successfully',
    type: UpdateProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a customer',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer profile not found',
  })
  async updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() updateData: UpdateCustomerProfileDto,
  ): Promise<UpdateProfileResponseDto> {
    return this.customerService.updateCustomerProfile(user.userId, updateData);
  }

  @Post('profile-picture')
  @ApiOperation({
    summary: 'Upload customer profile picture',
    description: 'Upload a profile picture for the customer. Replaces existing profile picture if one exists.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Profile picture file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, png, webp, gif)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Profile picture uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        profilePic: { type: 'string', description: 'Direct S3 URL' },
        profilePicCdnUrl: { type: 'string', description: 'CDN URL (recommended for faster loading)' },
        profilePicS3Key: { type: 'string', description: 'S3 key for management' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file or no file provided',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @UploadedFile() file: any,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ profilePic: string; profilePicCdnUrl: string; profilePicS3Key: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.customerService.uploadProfilePicture(user.userId, file);
  }

  @Delete('profile-picture')
  @ApiOperation({
    summary: 'Delete customer profile picture',
    description: 'Delete the current profile picture for the customer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile picture deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Profile picture deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - No profile picture to delete',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteProfilePicture(
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    await this.customerService.deleteProfilePicture(user.userId);
    return { message: 'Profile picture deleted successfully' };
  }

  @Get('my-support')
  @ApiOperation({
    summary: 'Get my assigned support member',
    description: 'Returns the support member assigned to the current customer, or admin if no support member is assigned',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns assigned support member or admin details',
  })
  @ApiResponse({
    status: 404,
    description: 'No support assignment found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getMySupportMember(@CurrentUser() user: CurrentUserData) {
    // Get customer profile which contains the customer data
    const profileResponse = await this.customerService.getCustomerProfile(user.userId);
    const customerId = profileResponse.data?.id;

    if (!customerId) {
      return {
        message: 'Customer profile not found',
        assignment: null,
      };
    }

    // Get active assignment, or auto-assign if none exists
    let assignment = await this.assignmentService.findActiveAssignment(customerId);

    if (!assignment) {
      // Auto-assign the customer
      assignment = await this.assignmentService.autoAssignCustomer(customerId);
    }

    if (assignment.supportMember) {
      return {
        type: 'support_member',
        supportMember: {
          id: assignment.supportMember.id,
          name: assignment.supportMember.fullName,
          firstName: assignment.supportMember.firstName,
          lastName: assignment.supportMember.lastName,
          email: assignment.supportMember.email,
          phone: assignment.supportMember.phone,
          profilePic: assignment.supportMember.profilePic,
        },
        assignedAt: assignment.assignedAt,
      };
    } else if (assignment.admin) {
      return {
        type: 'admin',
        admin: {
          id: assignment.admin.id,
          name: assignment.admin.fullName,
          email: assignment.admin.email,
        },
        assignedAt: assignment.assignedAt,
        note: 'Currently assigned to admin. A support member will be assigned soon.',
      };
    }
  }

  @Post('favorites/:businessOwnerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Toggle favorite status for a business',
    description: `Toggle a business in the customer's favorites list. If the business is already favorited, it will be removed. If not favorited, it will be added. This is a smart toggle endpoint that handles both add and remove operations.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite status toggled successfully. Check data.isFavorite to see current state (true = favorited, false = unfavorited)',
    type: FavoriteActionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found or not approved',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async toggleFavorite(
    @CurrentUser() user: CurrentUserData,
    @Param('businessOwnerId') businessOwnerId: string,
  ): Promise<FavoriteActionResponseDto> {
    // Get customer ID from user profile
    const profileResponse = await this.customerService.getCustomerProfile(user.userId);
    const customerId = profileResponse.data?.id;

    if (!customerId) {
      throw new BadRequestException('Customer profile not found');
    }

    return this.customerService.toggleFavorite(customerId, businessOwnerId);
  }

  @Get('favorites')
  @ApiOperation({
    summary: 'Get all favorite businesses',
    description: 'Returns a paginated list of all businesses favorited by the customer, ordered by most recently added first.',
  })
  @ApiResponse({
    status: 200,
    description: 'Favorites retrieved successfully',
    type: FavoritesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getFavorites(
    @CurrentUser() user: CurrentUserData,
    @Query() paginationDto: FavoritesPaginationDto,
  ): Promise<FavoritesResponseDto> {
    // Get customer ID from user profile
    const profileResponse = await this.customerService.getCustomerProfile(user.userId);
    const customerId = profileResponse.data?.id;

    if (!customerId) {
      throw new BadRequestException('Customer profile not found');
    }

    return this.customerService.getFavorites(customerId, paginationDto);
  }
}
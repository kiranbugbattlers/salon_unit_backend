import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Patch,
  Delete,
  Req,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '../common/decorators/public.decorator';
import { BusinessOwnerService } from './business-owner.service';
import {
  BusinessOwnerOnboardingStep1Dto,
  BusinessOwnerOnboardingStep2Dto,
  BusinessOwnerOnboardingStep3Dto,
  BusinessOwnerOnboardingStep4Dto,
  BusinessOwnerOnboardingStepResponseDto,
  BusinessOwnerOnboardingCompletionResponseDto,
  BusinessOwnerOnboardingStatusResponseDto,
  BusinessOwnerProfileResponseDto,
  BusinessOwnerProfileUpdateDto,
  BusinessInfoResponseDto,
  UpdateBusinessInfoDto,
  BusinessServicesResponseDto,
  UpdateBusinessServicesDto,
  BusinessMediaUploadResponseDto,
  BusinessMediaListResponseDto,
  BusinessMediaDeleteResponseDto,
  BusinessOwnerServicesGroupedByCategoryResponseDto,
  CreateServicePackageDto,
  UpdateServicePackageDto,
  ServicePackageListResponseDto,
  ServicePackageResponseWrapperDto,
  ServicePackageDeleteResponseDto,
  DeleteBusinessServicesDto,
  DeleteBusinessServicesResponseDto,
  UpdateDeliverySettingsDto,
  BusinessDocumentResponseDto,
  BusinessDocumentListResponseDto,
} from './dto';
import { BusinessSettings } from '../database/entities';
import { DocumentType } from '../common/enums/business-document.enum';

@ApiTags('Business Owner')
@Controller('business-owner')
export class BusinessOwnerController {
  constructor(private businessOwnerService: BusinessOwnerService) {}

  @Get('profile')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get business owner profile',
    description: 'Retrieves the complete business owner profile including business information and onboarding status',
  })
  @ApiResponse({
    status: 200,
    description: 'Business owner profile retrieved successfully',
    type: BusinessOwnerProfileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner profile not found',
  })
  async getProfile(@Req() req: any): Promise<BusinessOwnerProfileResponseDto> {
    return this.businessOwnerService.getBusinessOwnerProfile(req.user.userId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update business owner profile',
    description: 'Update business owner profile information. Profile picture fields are ignored if provided - use separate profile-picture endpoints for profile picture management.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business owner profile updated successfully',
    type: BusinessOwnerProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner profile not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Business name or referral code already exists',
  })
  async updateProfile(
    @Body() updateData: BusinessOwnerProfileUpdateDto,
    @Req() req: any,
  ): Promise<BusinessOwnerProfileResponseDto> {
    return this.businessOwnerService.updateBusinessOwnerProfile(req.user.userId, updateData);
  }

  @Get('onboarding/status')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get business owner onboarding status',
    description: 'Retrieves the current onboarding progress and step data for the business owner',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding status retrieved successfully',
    type: BusinessOwnerOnboardingStatusResponseDto,
  })
  async getOnboardingStatus(@Req() req: any): Promise<BusinessOwnerOnboardingStatusResponseDto> {
    return this.businessOwnerService.getOnboardingStatus(req.user.userId);
  }

  @Post('onboarding/step1')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Complete business owner onboarding step 1',
    description: 'Complete step 1 of business owner onboarding (personal information). This step may be automatically skipped if user already has complete profile information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Step 1 completed successfully',
    type: BusinessOwnerOnboardingStepResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or phone/email conflicts',
  })
  async completeStep1(
    @Body() step1Data: BusinessOwnerOnboardingStep1Dto,
    @Req() req: any,
  ): Promise<BusinessOwnerOnboardingStepResponseDto> {
    return this.businessOwnerService.completeOnboardingStep1(req.user.userId, step1Data);
  }

  @Post('onboarding/step2')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Complete business owner onboarding step 2',
    description: 'Complete step 2 of business owner onboarding (business information, address, and media files)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Step 2 onboarding data with media files',
    schema: {
      type: 'object',
      properties: {
        businessName: { type: 'string', example: 'Elite Hair Studio' },
        businessDescription: { type: 'string', example: 'Professional hair styling and grooming services' },
        latitude: { type: 'number', example: 28.7041 },
        longitude: { type: 'number', example: 77.1025 },
        streetAddress: { type: 'string', example: '123, MG Road, Near Metro Station' },
        addressLine1: { type: 'string', example: 'Shop No. 15, Ground Floor' },
        addressLine2: { type: 'string', example: 'Connaught Place' },
        landmark: { type: 'string', example: 'Opposite City Mall' },
        city: { type: 'string', example: 'New Delhi' },
        state: { type: 'string', example: 'Delhi' },
        postalCode: { type: 'string', example: '110001' },
        country: { type: 'string', example: 'India' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Business media files (images/videos, max 14 files)',
        },
      },
      required: ['businessName', 'businessDescription', 'latitude', 'longitude', 'streetAddress', 'city', 'state', 'postalCode'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Step 2 completed successfully',
    type: BusinessOwnerOnboardingStepResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or files',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Business name already exists',
  })
  @UseInterceptors(FilesInterceptor('files', 14))
  async completeStep2(
    @Body() step2Data: BusinessOwnerOnboardingStep2Dto,
    @UploadedFiles() files: any[],
    @Req() req: any,
  ): Promise<BusinessOwnerOnboardingStepResponseDto> {
    return this.businessOwnerService.completeOnboardingStep2(req.user.userId, step2Data, files);
  }

  @Post('onboarding/step3')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Complete business owner onboarding step 3',
    description: 'Complete step 3 of business owner onboarding (services offered, business hours, and service location type)',
  })
  @ApiResponse({
    status: 200,
    description: 'Step 3 completed successfully',
    type: BusinessOwnerOnboardingStepResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  async completeStep3(
    @Body() step3Data: BusinessOwnerOnboardingStep3Dto,
    @Req() req: any,
  ): Promise<BusinessOwnerOnboardingStepResponseDto> {
    return this.businessOwnerService.completeOnboardingStep3(req.user.userId, step3Data);
  }

  @Post('onboarding/step4')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Complete business owner onboarding step 4',
    description: 'Complete step 4 of business owner onboarding (operating experience). This completes the entire onboarding process.',
  })
  @ApiResponse({
    status: 200,
    description: 'Step 4 completed successfully - onboarding finished',
    type: BusinessOwnerOnboardingCompletionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  async completeStep4(
    @Body() step4Data: BusinessOwnerOnboardingStep4Dto,
    @Req() req: any,
  ): Promise<BusinessOwnerOnboardingCompletionResponseDto> {
    return this.businessOwnerService.completeOnboardingStep4(req.user.userId, step4Data);
  }

  @Post('profile-picture')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Upload business owner profile picture',
    description: 'Upload a profile picture for the business owner. Replaces existing profile picture if one exists.',
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
    @Req() req: any,
  ): Promise<{ profilePic: string; profilePicCdnUrl: string; profilePicS3Key: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.businessOwnerService.uploadProfilePicture(req.user.userId, file);
  }

  @Delete('profile-picture')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Delete business owner profile picture',
    description: 'Delete the current profile picture for the business owner.',
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
    @Req() req: any,
  ): Promise<{ message: string }> {
    await this.businessOwnerService.deleteProfilePicture(req.user.userId);
    return { message: 'Profile picture deleted successfully' };
  }

  @Post('business-media')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Upload business media files',
    description: 'Upload multiple images or videos for the business portfolio/gallery. Supports up to 10 files at once.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Business media files',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Multiple media files (images/videos)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Business media uploaded successfully',
    type: BusinessMediaUploadResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadBusinessMedia(
    @UploadedFiles() files: any[],
    @Req() req: any,
  ): Promise<BusinessMediaUploadResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    return this.businessOwnerService.uploadBusinessMedia(req.user.userId, files);
  }

  @Get('business-media')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get business media files',
    description: 'Retrieve all business media files (portfolio/gallery) for business owner.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business media retrieved successfully',
    type: BusinessMediaListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async getBusinessMedia(
    @Req() req: any,
  ): Promise<BusinessMediaListResponseDto> {
    return this.businessOwnerService.getBusinessMedia(req.user.userId);
  }

  @Get('business-media/:mediaId')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get business media by ID',
    description: 'Retrieve a specific business media file by ID',
  })
  @ApiParam({
    name: 'mediaId',
    description: 'ID of the media file to retrieve',
    example: 'uuid-media-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Business media retrieved successfully',
    type: BusinessMediaListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner or media not found',
  })
  async getBusinessMediaById(
    @Param('mediaId') mediaId: string,
    @Req() req: any,
  ): Promise<BusinessMediaListResponseDto> {
    return this.businessOwnerService.getBusinessMediaById(req.user.userId, mediaId);
  }

  @Put('business-media/:mediaId')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update business media',
    description: 'Update a specific business media file',
  })
  @ApiParam({
    name: 'mediaId',
    description: 'ID of the media file to update',
    example: 'uuid-media-id',
  })
  @ApiBody({
    description: 'Business media update data',
    type: 'object',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Business media updated successfully',
    type: BusinessMediaListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner or media not found',
  })
  async updateBusinessMedia(
    @Param('mediaId') mediaId: string,
    @Body() updateData: any,
    @Req() req: any,
  ): Promise<BusinessMediaListResponseDto> {
    return this.businessOwnerService.updateBusinessMedia(req.user.userId, mediaId, updateData);
  }

  @Delete('business-media/:mediaId')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Delete business media file',
    description: 'Delete a specific business media file from the portfolio/gallery.',
  })
  @ApiParam({
    name: 'mediaId',
    description: 'ID of the media file to delete',
    example: 'uuid-media-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Business media deleted successfully',
    type: BusinessMediaDeleteResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner or media not found',
  })
  async deleteBusinessMedia(
    @Param('mediaId') mediaId: string,
    @Req() req: any,
  ): Promise<BusinessMediaDeleteResponseDto> {
    return this.businessOwnerService.deleteBusinessMedia(req.user.userId, mediaId);
  }

  @Get('business-info')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get business information',
    description: 'Retrieve business information including business details and addresses for the authenticated business owner. Use /business-owner/services endpoint to get service information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business information retrieved successfully',
    type: BusinessInfoResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async getBusinessInfo(@Req() req: any): Promise<BusinessInfoResponseDto> {
    return this.businessOwnerService.getBusinessInfo(req.user.userId);
  }

  @Put('business-info')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update business information',
    description: 'Update business information such as business name, description, and operating years for the authenticated business owner',
  })
  @ApiResponse({
    status: 200,
    description: 'Business information updated successfully',
    type: BusinessInfoResponseDto,
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
    status: 404,
    description: 'Business owner not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Business name already exists',
  })
  async updateBusinessInfo(
    @Body() updateData: UpdateBusinessInfoDto,
    @Req() req: any,
  ): Promise<BusinessInfoResponseDto> {
    return this.businessOwnerService.updateBusinessInfo(req.user.userId, updateData);
  }

  @Get('services')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get business services',
    description: 'Retrieve all services offered by the business owner with custom pricing and duration settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Business services retrieved successfully',
    type: BusinessServicesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async getBusinessServices(@Req() req: any): Promise<BusinessServicesResponseDto> {
    return this.businessOwnerService.getBusinessServices(req.user.userId);
  }

  @Put('services')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update business services',
    description: 'Update services offered by the business owner including custom pricing, duration, and active status',
  })
  @ApiResponse({
    status: 200,
    description: 'Business services updated successfully',
    type: BusinessServicesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or service IDs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async updateBusinessServices(
    @Body() updateData: UpdateBusinessServicesDto,
    @Req() req: any,
  ): Promise<BusinessServicesResponseDto> {
    return this.businessOwnerService.updateBusinessServices(req.user.userId, updateData);
  }

  @Delete('services')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Delete business services',
    description: 'Permanently delete one or multiple business services. Services used in active packages cannot be deleted.',
  })
  @ApiResponse({
    status: 200,
    description: 'All services deleted successfully',
    type: DeleteBusinessServicesResponseDto,
  })
  @ApiResponse({
    status: 207,
    description: 'Partial success - some services deleted, some failed',
    type: DeleteBusinessServicesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or business service IDs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async deleteBusinessServices(
    @Body() deleteData: DeleteBusinessServicesDto,
    @Req() req: any,
  ): Promise<DeleteBusinessServicesResponseDto> {
    return this.businessOwnerService.deleteBusinessServices(req.user.userId, deleteData);
  }

  @Get('services/grouped-by-category')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get business services grouped by categories',
    description: 'Retrieve business services offered by the authenticated business owner grouped by service categories with custom pricing and duration settings',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of categories per page' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status of business services' })
  @ApiResponse({
    status: 200,
    description: 'Business services grouped by categories retrieved successfully',
    type: BusinessOwnerServicesGroupedByCategoryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async getBusinessServicesGroupedByCategory(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: boolean,
  ): Promise<BusinessOwnerServicesGroupedByCategoryResponseDto> {
    return this.businessOwnerService.getBusinessServicesGroupedByCategory(
      req.user.userId,
      page ? +page : 1,
      limit ? +limit : 10,
      isActive,
    );
  }

  @Post('service-packages')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create a new service package',
    description: 'Create a service package containing multiple business services with variable discounts',
  })
  @ApiResponse({
    status: 201,
    description: 'Service package created successfully',
    type: ServicePackageResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or business service IDs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async createServicePackage(
    @Body() createDto: CreateServicePackageDto,
    @Req() req: any,
  ): Promise<ServicePackageResponseWrapperDto> {
    return this.businessOwnerService.createServicePackage(req.user.userId, createDto);
  }


  @Put('service-packages/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update service package',
    description: 'Update service package details and services list',
  })
  @ApiParam({ name: 'id', description: 'Service package UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service package updated successfully',
    type: ServicePackageResponseWrapperDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or business service IDs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Service package not found',
  })
  async updateServicePackage(
    @Param('id') packageId: string,
    @Body() updateDto: UpdateServicePackageDto,
    @Req() req: any,
  ): Promise<ServicePackageResponseWrapperDto> {
    return this.businessOwnerService.updateServicePackage(req.user.userId, packageId, updateDto);
  }

  @Delete('service-packages/:id')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Delete service package',
    description: 'Soft delete a service package by setting it as inactive',
  })
  @ApiParam({ name: 'id', description: 'Service package UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service package deleted successfully',
    type: ServicePackageDeleteResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Service package not found',
  })
  async deleteServicePackage(
    @Param('id') packageId: string,
    @Req() req: any,
  ): Promise<ServicePackageDeleteResponseDto> {
    return this.businessOwnerService.deleteServicePackage(req.user.userId, packageId);
  }

  @Patch('service-packages/:id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Toggle service package active status',
    description: 'Toggle the active status of a service package',
  })
  @ApiParam({ name: 'id', description: 'Service package UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service package status toggled successfully',
    type: ServicePackageResponseWrapperDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Service package not found',
  })
  async toggleServicePackageActive(
    @Param('id') packageId: string,
    @Req() req: any,
  ): Promise<ServicePackageResponseWrapperDto> {
    return this.businessOwnerService.toggleServicePackageActive(req.user.userId, packageId);
  }

  @Get('delivery-settings')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get delivery settings for at-home services',
    description: `
      Retrieve current delivery charge settings for the business owner's at-home services.

      **Authentication Required - Business Owner**

      Delivery Settings Include:
      - deliveryChargesEnabled: Enable/disable delivery charges
      - baseDeliveryCharge: Fixed base charge for all deliveries
      - perKmCharge: Additional charge per kilometer
      - freeDeliveryUptoKm: Distance up to which delivery is free
      - maxDeliveryDistanceKm: Maximum delivery distance allowed
      - freeDeliveryAboveAmount: Order amount above which delivery is free

      Default Settings (if not configured):
      - deliveryChargesEnabled: true
      - baseDeliveryCharge: ₹0
      - perKmCharge: ₹10/km
      - freeDeliveryUptoKm: 5 km
      - maxDeliveryDistanceKm: 20 km
      - freeDeliveryAboveAmount: ₹1000

      Use Cases:
      - Display current delivery pricing to business owner
      - Show delivery radius on business profile
      - Calculate estimated delivery charges for customers
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery settings retrieved successfully',
    type: BusinessSettings,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async getDeliverySettings(@Req() req: any): Promise<BusinessSettings> {
    return this.businessOwnerService.getDeliverySettings(req.user.businessOwnerId);
  }

  @Patch('delivery-settings')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update delivery settings for at-home services',
    description: `
      Update delivery charge configuration for the business owner's at-home services.

      **Authentication Required - Business Owner**

      Configurable Settings:
      - **deliveryChargesEnabled**: Enable/disable delivery charges (default: true)
      - **baseDeliveryCharge**: Fixed charge added to all deliveries (default: ₹0)
      - **perKmCharge**: Charge per kilometer beyond free distance (default: ₹10)
      - **freeDeliveryUptoKm**: Free delivery within this radius (default: 5 km)
      - **maxDeliveryDistanceKm**: Maximum service radius (default: 20 km)
      - **freeDeliveryAboveAmount**: Free delivery for orders above this amount (default: ₹1000)

      Delivery Charge Calculation:
      1. If deliveryChargesEnabled = false → No charge
      2. If distance ≤ freeDeliveryUptoKm → No charge
      3. If totalAmount ≥ freeDeliveryAboveAmount → No charge
      4. Otherwise: baseDeliveryCharge + (distance - freeDeliveryUptoKm) × perKmCharge

      Examples:
      - 3 km distance, ₹500 order → Free (within free radius)
      - 10 km distance, ₹1200 order → Free (above free amount)
      - 10 km distance, ₹500 order → ₹0 + (10-5) × ₹10 = ₹50
      - 15 km distance, ₹800 order → ₹0 + (15-5) × ₹10 = ₹100

      Use Cases:
      - Configure competitive delivery pricing
      - Expand or limit service area
      - Offer free delivery promotions
      - Adjust per-km rates for fuel costs
    `,
  })
  @ApiBody({
    type: UpdateDeliverySettingsDto,
    description: 'Delivery settings to update (all fields optional)',
    examples: {
      'Enable with basic pricing': {
        value: {
          deliveryChargesEnabled: true,
          baseDeliveryCharge: 20,
          perKmCharge: 8,
          freeDeliveryUptoKm: 3,
          maxDeliveryDistanceKm: 15
        }
      },
      'Free delivery promotion': {
        value: {
          freeDeliveryAboveAmount: 500,
          freeDeliveryUptoKm: 10
        }
      },
      'Disable delivery charges': {
        value: {
          deliveryChargesEnabled: false
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery settings updated successfully',
    type: BusinessSettings,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid delivery settings values',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async updateDeliverySettings(
    @Req() req: any,
    @Body() updateDto: UpdateDeliverySettingsDto,
  ): Promise<BusinessSettings> {
    return this.businessOwnerService.updateDeliverySettings(req.user.businessOwnerId, updateDto);
  }

  @Get('documents')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get business documents',
    description: 'Retrieve all uploaded KYC documents (Aadhar, PAN, etc.) for the business owner.',
  })
  @ApiResponse({
    status: 200,
    description: 'Business documents retrieved successfully',
    type: BusinessDocumentListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async getBusinessDocuments(@Req() req: any): Promise<BusinessDocumentListResponseDto> {
    return this.businessOwnerService.getBusinessDocuments(req.user.userId);
  }

  @Post('documents')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Upload business document',
    description: 'Upload a KYC document (Aadhar, PAN, etc.) for the business owner.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document file and type',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file (jpg, png, webp, pdf)',
        },
        documentType: {
          type: 'string',
          enum: Object.values(DocumentType),
          description: 'Type of document being uploaded',
        },
      },
      required: ['file', 'documentType'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    type: BusinessDocumentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file or document type',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadBusinessDocument(
    @UploadedFile() file: any,
    @Body('documentType') documentType: DocumentType,
    @Req() req: any,
  ): Promise<BusinessDocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!documentType) {
      throw new BadRequestException('Document type is required');
    }
    return this.businessOwnerService.uploadBusinessDocument(req.user.userId, documentType, file);
  }
}
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { AdvertisementQueryDto } from './dto/advertisement-query.dto';
import { GetActiveAdsDto } from './dto/get-active-ads.dto';
import { TrackAdDto } from './dto/track-ad.dto';
import { AdminOnly } from '../common/decorators/admin-only.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Advertisements Management System')
@Controller('advertisements')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @Post()
  @AdminOnly()
  @UseInterceptors(FileInterceptor('media'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create new advertisement (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'mediaType', 'targetUserTypes', 'targetScreens', 'media'],
      properties: {
        title: { type: 'string', example: 'Summer Sale' },
        description: { type: 'string', example: 'Get 50% off' },
        mediaType: { type: 'string', enum: ['image', 'video'] },
        linkUrl: { type: 'string', example: 'https://example.com' },
        targetUserTypes: {
          type: 'array',
          items: { type: 'string', enum: ['customer', 'business_owner', 'staff'] },
        },
        targetScreens: {
          type: 'object',
          example: { customer: ['home', 'login'] },
        },
        priority: { type: 'integer', example: 10 },
        isActive: { type: 'boolean', example: true },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        media: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Advertisement created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(
    @Body() createDto: CreateAdvertisementDto,
    @UploadedFile() media: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!media) {
      throw new BadRequestException('Media file is required');
    }

    // Validate file type based on mediaType
    const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideoMimes = ['video/mp4', 'video/webm'];

    if (createDto.mediaType === 'image' && !allowedImageMimes.includes(media.mimetype)) {
      throw new BadRequestException('Invalid image format. Allowed: JPG, PNG, WEBP');
    }

    if (createDto.mediaType === 'video' && !allowedVideoMimes.includes(media.mimetype)) {
      throw new BadRequestException('Invalid video format. Allowed: MP4, WEBM');
    }

    // Validate file size (10MB for images, 50MB for videos)
    const maxSize = createDto.mediaType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (media.size > maxSize) {
      throw new BadRequestException(
        `File too large. Max size: ${createDto.mediaType === 'image' ? '10MB' : '50MB'}`,
      );
    }

    const adminId = req.admin?.id || req.user?.sub;
    return await this.advertisementService.create(createDto, media, adminId);
  }

  @Get()
  @AdminOnly()
  @ApiOperation({ summary: 'Get all advertisements with filters (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of advertisements' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async findAll(@Query() queryDto: AdvertisementQueryDto) {
    return await this.advertisementService.findAll(queryDto);
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get active advertisements for specific user type and screen' })
  @ApiResponse({
    status: 200,
    description: 'Returns active advertisements wrapped in standard response structure',
    type: ApiResponseDto
  })
  async getActiveAds(@Query() queryDto: GetActiveAdsDto): Promise<ApiResponseDto> {
    const advertisements = await this.advertisementService.findActiveAds(queryDto.userType, queryDto.screen);
    return new ApiResponseDto(
      200,
      true,
      'Active advertisements retrieved successfully',
      advertisements
    );
  }

  @Get('analytics')
  @AdminOnly()
  @ApiOperation({ summary: 'Get advertisement analytics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns advertisement performance metrics' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAnalytics() {
    return await this.advertisementService.getAnalytics();
  }

  @Get(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Get single advertisement by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns advertisement details' })
  @ApiResponse({ status: 404, description: 'Advertisement not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async findOne(@Param('id') id: string) {
    return await this.advertisementService.findOne(id);
  }

  @Patch(':id')
  @AdminOnly()
  @UseInterceptors(FileInterceptor('media'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update advertisement (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        mediaType: { type: 'string', enum: ['image', 'video'] },
        linkUrl: { type: 'string' },
        targetUserTypes: {
          type: 'array',
          items: { type: 'string', enum: ['customer', 'business_owner', 'staff'] },
        },
        targetScreens: { type: 'object' },
        priority: { type: 'integer' },
        isActive: { type: 'boolean' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        media: { type: 'string', format: 'binary', description: 'Optional: New media file' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Advertisement updated successfully' })
  @ApiResponse({ status: 404, description: 'Advertisement not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdvertisementDto,
    @UploadedFile() media?: Express.Multer.File,
  ) {
    // Clean up empty strings, empty objects, and empty arrays from multipart form-data
    const cleanedDto: any = {};
    for (const [key, value] of Object.entries(updateDto)) {
      // Skip empty strings, null, undefined
      if (value === '' || value === null || value === undefined) {
        continue;
      }
      // Skip empty objects
      if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
        continue;
      }
      // Skip empty arrays
      if (Array.isArray(value) && value.length === 0) {
        continue;
      }
      cleanedDto[key] = value;
    }

    // Validate new media file if provided
    if (media) {
      const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp'];
      const allowedVideoMimes = ['video/mp4', 'video/webm'];

      if (cleanedDto.mediaType === 'image' && !allowedImageMimes.includes(media.mimetype)) {
        throw new BadRequestException('Invalid image format. Allowed: JPG, PNG, WEBP');
      }

      if (cleanedDto.mediaType === 'video' && !allowedVideoMimes.includes(media.mimetype)) {
        throw new BadRequestException('Invalid video format. Allowed: MP4, WEBM');
      }

      const maxSize = cleanedDto.mediaType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
      if (media.size > maxSize) {
        throw new BadRequestException(
          `File too large. Max size: ${cleanedDto.mediaType === 'image' ? '10MB' : '50MB'}`,
        );
      }
    }

    return await this.advertisementService.update(id, cleanedDto, media);
  }

  @Delete(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Delete advertisement (Admin only)' })
  @ApiResponse({ status: 200, description: 'Advertisement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Advertisement not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async remove(@Param('id') id: string) {
    await this.advertisementService.remove(id);
    return { message: 'Advertisement deleted successfully' };
  }

  @Patch(':id/toggle-active')
  @AdminOnly()
  @ApiOperation({ summary: 'Toggle advertisement active status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Advertisement status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Advertisement not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async toggleActive(@Param('id') id: string) {
    return await this.advertisementService.toggleActive(id);
  }

  @Post(':id/impression')
  @Public()
  @ApiOperation({ summary: 'Track advertisement impression (view)' })
  @ApiResponse({ status: 200, description: 'Impression tracked successfully' })
  async trackImpression(@Param('id') id: string, @Body() trackDto: TrackAdDto) {
    await this.advertisementService.trackImpression(id, trackDto.count || 1);
    return { message: `Impression tracked: +${trackDto.count || 1}` };
  }

  @Post(':id/click')
  @Public()
  @ApiOperation({ summary: 'Track advertisement click' })
  @ApiResponse({ status: 200, description: 'Click tracked successfully' })
  async trackClick(@Param('id') id: string, @Body() trackDto: TrackAdDto) {
    await this.advertisementService.trackClick(id, trackDto.count || 1);
    return { message: `Click tracked: +${trackDto.count || 1}` };
  }
}

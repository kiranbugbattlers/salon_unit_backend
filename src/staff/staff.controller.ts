import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { StaffService } from './staff.service';
import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffResponseDto,
  StaffListResponseDto,
  StaffQueryDto,
  ProfilePictureResponseDto,
  MessageResponseDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../common/enums';

@ApiTags('Staff Management')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUSINESS_OWNER)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Staff creation data with optional profile picture',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'John', description: 'First name of the staff member' },
        lastName: { type: 'string', example: 'Doe', description: 'Last name of the staff member' },
        phone: { type: 'string', example: '+919876543210', description: 'Phone number in Indian format' },
        email: { type: 'string', example: 'john.doe@example.com', description: 'Email address (optional)' },
        dateOfBirth: { type: 'string', format: 'date', example: '1990-05-15', description: 'Date of birth in YYYY-MM-DD format' },
        gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male', description: 'Gender of the staff member' },
        lunchStartTime: { type: 'string', example: '13:00', description: 'Lunch break start time in HH:MM format' },
        lunchEndTime: { type: 'string', example: '14:00', description: 'Lunch break end time in HH:MM format' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (optional - jpg, png, webp, gif)',
        },
      },
      required: ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'lunchStartTime', 'lunchEndTime'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Staff member created successfully',
    type: StaffResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Staff member already exists' })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Req() req: any,
    @Body() createStaffDto: CreateStaffDto,
    @UploadedFile() file?: any,
  ): Promise<StaffResponseDto> {
    return this.staffService.create(req.user.userId, createStaffDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all staff members for the business' })
  @ApiResponse({
    status: 200,
    description: 'Staff members retrieved successfully',
    type: StaffListResponseDto,
  })
  async findAll(
    @Req() req: any,
    @Query() query: StaffQueryDto,
  ): Promise<StaffListResponseDto> {
    return this.staffService.findAll(req.user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific staff member' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff member retrieved successfully',
    type: StaffResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async findOne(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StaffResponseDto> {
    return this.staffService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a staff member' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff member updated successfully',
    type: StaffResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  @ApiResponse({ status: 409, description: 'Phone or email already exists' })
  async update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ): Promise<StaffResponseDto> {
    return this.staffService.update(req.user.userId, id, updateStaffDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a staff member permanently',
    description: 'Permanently delete a staff member from the database. This action cannot be undone. The staff record and associated profile picture will be completely removed.',
  })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @ApiResponse({ status: 204, description: 'Staff member deleted permanently' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.staffService.remove(req.user.userId, id);
  }

  @Post(':id/profile-picture')
  @ApiOperation({
    summary: 'Upload staff profile picture',
    description: 'Upload a profile picture for a staff member. Replaces existing profile picture if one exists.',
  })
  @ApiParam({ name: 'id', description: 'Staff ID' })
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
    type: ProfilePictureResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file or no file provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: any,
  ): Promise<ProfilePictureResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.staffService.uploadProfilePicture(req.user.userId, id, file);
  }

  @Delete(':id/profile-picture')
  @ApiOperation({
    summary: 'Delete staff profile picture',
    description: 'Delete the current profile picture for a staff member.',
  })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @ApiResponse({
    status: 200,
    description: 'Profile picture deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - No profile picture to delete' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async deleteProfilePicture(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto> {
    return this.staffService.deleteProfilePicture(req.user.userId, id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate a staff member',
    description: 'Deactivate a staff member without permanently deleting their record. This is a soft delete operation.',
  })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff member deactivated successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Staff member already deactivated' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async deactivate(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto> {
    return this.staffService.deactivate(req.user.userId, id);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate a staff member',
    description: 'Reactivate a previously deactivated staff member.',
  })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff member activated successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Staff member already active' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async activate(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto> {
    return this.staffService.activate(req.user.userId, id);
  }
}
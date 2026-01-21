import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../common/enums';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class StaffData {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessOwnerId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty({ required: false })
  profilePic?: string;

  @ApiProperty({ required: false })
  profilePicCdnUrl?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false, description: 'Lunch break start time in HH:MM format', nullable: true })
  lunchStartTime?: string | null;

  @ApiProperty({ required: false, description: 'Lunch break end time in HH:MM format', nullable: true })
  lunchEndTime?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class StaffResponseDto extends ApiResponseDto<StaffData> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Staff member retrieved successfully' })
  message: string;

  @ApiProperty()
  data: StaffData;

  constructor(code: number = 200, success: boolean = true, message: string, data: StaffData) {
    super(code, success, message, data);
  }
}

export class StaffListData {
  @ApiProperty({ type: [StaffData] })
  data: StaffData[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class StaffListResponseDto extends ApiResponseDto<StaffListData> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Staff members retrieved successfully' })
  message: string;

  @ApiProperty()
  data: StaffListData;

  constructor(code: number = 200, success: boolean = true, message: string, data: StaffListData) {
    super(code, success, message, data);
  }
}

export class ProfilePictureData {
  @ApiProperty({ description: 'Direct S3 URL' })
  profilePic: string;

  @ApiProperty({ description: 'CDN URL (recommended for faster loading)' })
  profilePicCdnUrl: string;

  @ApiProperty({ description: 'S3 key for management' })
  profilePicS3Key: string;
}

export class ProfilePictureResponseDto extends ApiResponseDto<ProfilePictureData> {
  @ApiProperty({ example: 201 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Profile picture uploaded successfully' })
  message: string;

  @ApiProperty()
  data: ProfilePictureData;

  constructor(code: number = 201, success: boolean = true, message: string, data: ProfilePictureData) {
    super(code, success, message, data);
  }
}

export class MessageData {
  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;
}

export class MessageResponseDto extends ApiResponseDto<MessageData> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiProperty()
  data: MessageData;

  constructor(code: number = 200, success: boolean = true, message: string, data: MessageData) {
    super(code, success, message, data);
  }
}
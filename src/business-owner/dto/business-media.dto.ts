import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class BusinessMediaDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['image', 'video'] })
  mediaType: string;

  @ApiProperty()
  mediaUrl: string;

  @ApiProperty({ required: false })
  cdnUrl?: string;

  @ApiProperty({ required: false })
  thumbnailUrl?: string;

  @ApiProperty({ required: false })
  fileName?: string;

  @ApiProperty({ required: false })
  fileSize?: number;

  @ApiProperty({ required: false })
  mimeType?: string;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  createdAt: Date;
}

export class BusinessMediaUploadDto {
  @ApiProperty()
  mediaId: string;

  @ApiProperty()
  mediaUrl: string;

  @ApiProperty()
  cdnUrl: string;

  @ApiProperty()
  s3Key: string;
}

export class BusinessMediaListDataDto {
  @ApiProperty({ type: [BusinessMediaDto] })
  media: BusinessMediaDto[];

  @ApiProperty()
  count: number;
}

export class BusinessMediaUploadDataDto {
  @ApiProperty({ type: [BusinessMediaUploadDto] })
  media: BusinessMediaUploadDto[];

  @ApiProperty()
  count: number;
}

export class BusinessMediaUploadResponseDto extends ApiResponseDto<BusinessMediaUploadDataDto> {
  @ApiProperty({ example: 201 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business media uploaded successfully' })
  message: string;

  @ApiProperty({ type: BusinessMediaUploadDataDto })
  data: BusinessMediaUploadDataDto;

  constructor(code: number, success: boolean, message: string, data: BusinessMediaUploadDataDto) {
    super(code, success, message, data);
  }
}

export class BusinessMediaListResponseDto extends ApiResponseDto<BusinessMediaListDataDto> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business media retrieved successfully' })
  message: string;

  @ApiProperty({ type: BusinessMediaListDataDto })
  data: BusinessMediaListDataDto;

  constructor(code: number, success: boolean, message: string, data: BusinessMediaListDataDto) {
    super(code, success, message, data);
  }
}

export class BusinessMediaDeleteResponseDto extends ApiResponseDto<null> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Business media deleted successfully' })
  message: string;

  @ApiProperty({ example: null })
  data: null;

  constructor(code: number = 200, success: boolean = true, message: string = 'Business media deleted successfully') {
    super(code, success, message, null);
  }
}
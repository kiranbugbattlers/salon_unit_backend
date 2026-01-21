import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
  cdnUrl: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface FileUploadOptions {
  folder?: string;
  prefix?: string;
  customFileName?: string;
  publicRead?: boolean;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cdnEndpoint: string;
  private readonly region: string;
  private readonly publicRead: boolean;

  // Supported file types
  private readonly SUPPORTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ];

  private readonly SUPPORTED_VIDEO_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];

  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');

    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME');
    this.cdnEndpoint = this.configService.get<string>('S3_CDN_ENDPOINT');
    this.region = region;
    this.publicRead = this.configService.get<boolean>('S3_PUBLIC_READ', true);

    if (!endpoint || !region || !accessKeyId || !secretAccessKey || !this.bucketName) {
      throw new Error('S3 configuration is incomplete. Please check environment variables.');
    }

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false, // DigitalOcean Spaces uses virtual hosted-style
    });

    this.logger.log('S3Service initialized with DigitalOcean Spaces');
  }

  /**
   * Upload a single file to S3
   */
  async uploadFile(
    file: any,
    options: FileUploadOptions = {}
  ): Promise<UploadResult> {
    try {
      this.validateFile(file);

      const key = this.generateFileKey(file, options);
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: options.publicRead ?? this.publicRead ? ObjectCannedACL.public_read : ObjectCannedACL.private,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      };

      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      const result: UploadResult = {
        key,
        url: this.getPublicUrl(key),
        cdnUrl: this.getCdnUrl(key),
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      };

      this.logger.log(`File uploaded successfully: ${key}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload multiple files to S3
   */
  async uploadFiles(
    files: any[],
    options: FileUploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key,
      };

      const command = new DeleteObjectCommand(deleteParams);
      await this.s3Client.send(command);

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Delete multiple files from S3
   */
  async deleteFiles(keys: string[]): Promise<void> {
    const deletePromises = keys.map(key => this.deleteFile(key));
    await Promise.all(deletePromises);
  }

  /**
   * Generate a presigned URL for temporary access
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return presignedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    return `${this.configService.get<string>('S3_ENDPOINT')}/${this.bucketName}/${key}`;
  }

  /**
   * Get CDN URL for a file (faster delivery)
   */
  getCdnUrl(key: string): string {
    return `${this.cdnEndpoint}/${key}`;
  }

  /**
   * Extract key from URL
   */
  extractKeyFromUrl(url: string): string {
    if (url.includes(this.cdnEndpoint)) {
      return url.replace(`${this.cdnEndpoint}/`, '');
    }
    
    const bucketUrl = `${this.configService.get<string>('S3_ENDPOINT')}/${this.bucketName}/`;
    if (url.includes(bucketUrl)) {
      return url.replace(bucketUrl, '');
    }
    
    throw new BadRequestException('Invalid S3 URL format');
  }

  /**
   * Check if file is an image
   */
  isImage(mimeType: string): boolean {
    return this.SUPPORTED_IMAGE_TYPES.includes(mimeType);
  }

  /**
   * Check if file is a video
   */
  isVideo(mimeType: string): boolean {
    return this.SUPPORTED_VIDEO_TYPES.includes(mimeType);
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: any): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('File size too large (max 50MB)');
    }

    if (this.isImage(file.mimetype) && file.size > this.MAX_IMAGE_SIZE) {
      throw new BadRequestException('Image size too large (max 10MB)');
    }

    if (this.isVideo(file.mimetype) && file.size > this.MAX_VIDEO_SIZE) {
      throw new BadRequestException('Video size too large (max 50MB)');
    }

    const allSupportedTypes = [...this.SUPPORTED_IMAGE_TYPES, ...this.SUPPORTED_VIDEO_TYPES];
    if (!allSupportedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type. Supported types: ${allSupportedTypes.join(', ')}`
      );
    }
  }

  /**
   * Generate unique file key
   */
  private generateFileKey(file: any, options: FileUploadOptions): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const uniqueId = uuidv4();
    const extension = this.getFileExtension(file.originalname);
    
    let fileName = options.customFileName || `${uniqueId}${extension}`;
    
    // Add prefix if provided
    if (options.prefix) {
      fileName = `${options.prefix}-${fileName}`;
    }

    // Determine folder structure
    let folder = options.folder || this.getDefaultFolder(file.mimetype);
    
    // Add date-based subfolder for better organization
    folder = `${folder}/${timestamp}`;

    return `${folder}/${fileName}`;
  }

  /**
   * Get default folder based on file type
   */
  private getDefaultFolder(mimeType: string): string {
    if (this.isImage(mimeType)) {
      return 'images';
    } else if (this.isVideo(mimeType)) {
      return 'videos';
    }
    return 'files';
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  }
}
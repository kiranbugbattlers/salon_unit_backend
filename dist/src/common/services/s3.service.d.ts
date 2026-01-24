import { ConfigService } from '@nestjs/config';
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
export declare class S3Service {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucketName;
    private readonly cdnEndpoint;
    private readonly region;
    private readonly publicRead;
    private readonly SUPPORTED_IMAGE_TYPES;
    private readonly SUPPORTED_VIDEO_TYPES;
    private readonly MAX_FILE_SIZE;
    private readonly MAX_IMAGE_SIZE;
    private readonly MAX_VIDEO_SIZE;
    constructor(configService: ConfigService);
    uploadFile(file: any, options?: FileUploadOptions): Promise<UploadResult>;
    uploadFiles(files: any[], options?: FileUploadOptions): Promise<UploadResult[]>;
    deleteFile(key: string): Promise<void>;
    deleteFiles(keys: string[]): Promise<void>;
    getPresignedUrl(key: string, expiresIn?: number): Promise<string>;
    getPublicUrl(key: string): string;
    getCdnUrl(key: string): string;
    extractKeyFromUrl(url: string): string;
    isImage(mimeType: string): boolean;
    isVideo(mimeType: string): boolean;
    private validateFile;
    private generateFileKey;
    private getDefaultFolder;
    private getFileExtension;
}

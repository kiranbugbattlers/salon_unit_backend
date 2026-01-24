"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
let S3Service = S3Service_1 = class S3Service {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(S3Service_1.name);
        this.SUPPORTED_IMAGE_TYPES = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg+xml'
        ];
        this.SUPPORTED_VIDEO_TYPES = [
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'video/x-msvideo',
            'video/webm'
        ];
        this.MAX_FILE_SIZE = 50 * 1024 * 1024;
        this.MAX_IMAGE_SIZE = 10 * 1024 * 1024;
        this.MAX_VIDEO_SIZE = 50 * 1024 * 1024;
        const endpoint = this.configService.get('S3_ENDPOINT');
        const region = this.configService.get('S3_REGION');
        const accessKeyId = this.configService.get('S3_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('S3_SECRET_ACCESS_KEY');
        this.bucketName = this.configService.get('S3_BUCKET_NAME');
        this.cdnEndpoint = this.configService.get('S3_CDN_ENDPOINT');
        this.region = region;
        this.publicRead = this.configService.get('S3_PUBLIC_READ', true);
        if (!endpoint || !region || !accessKeyId || !secretAccessKey || !this.bucketName) {
            throw new Error('S3 configuration is incomplete. Please check environment variables.');
        }
        this.s3Client = new client_s3_1.S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            forcePathStyle: false,
        });
        this.logger.log('S3Service initialized with DigitalOcean Spaces');
    }
    async uploadFile(file, options = {}) {
        try {
            this.validateFile(file);
            const key = this.generateFileKey(file, options);
            const uploadParams = {
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: options.publicRead ?? this.publicRead ? client_s3_1.ObjectCannedACL.public_read : client_s3_1.ObjectCannedACL.private,
                Metadata: {
                    originalName: file.originalname,
                    uploadedAt: new Date().toISOString(),
                },
            };
            const command = new client_s3_1.PutObjectCommand(uploadParams);
            await this.s3Client.send(command);
            const result = {
                key,
                url: this.getPublicUrl(key),
                cdnUrl: this.getCdnUrl(key),
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
            };
            this.logger.log(`File uploaded successfully: ${key}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to upload file: ${error.message}`);
        }
    }
    async uploadFiles(files, options = {}) {
        const uploadPromises = files.map(file => this.uploadFile(file, options));
        return Promise.all(uploadPromises);
    }
    async deleteFile(key) {
        try {
            const deleteParams = {
                Bucket: this.bucketName,
                Key: key,
            };
            const command = new client_s3_1.DeleteObjectCommand(deleteParams);
            await this.s3Client.send(command);
            this.logger.log(`File deleted successfully: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to delete file: ${error.message}`);
        }
    }
    async deleteFiles(keys) {
        const deletePromises = keys.map(key => this.deleteFile(key));
        await Promise.all(deletePromises);
    }
    async getPresignedUrl(key, expiresIn = 3600) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
            return presignedUrl;
        }
        catch (error) {
            this.logger.error(`Failed to generate presigned URL: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to generate presigned URL: ${error.message}`);
        }
    }
    getPublicUrl(key) {
        return `${this.configService.get('S3_ENDPOINT')}/${this.bucketName}/${key}`;
    }
    getCdnUrl(key) {
        return `${this.cdnEndpoint}/${key}`;
    }
    extractKeyFromUrl(url) {
        if (url.includes(this.cdnEndpoint)) {
            return url.replace(`${this.cdnEndpoint}/`, '');
        }
        const bucketUrl = `${this.configService.get('S3_ENDPOINT')}/${this.bucketName}/`;
        if (url.includes(bucketUrl)) {
            return url.replace(bucketUrl, '');
        }
        throw new common_1.BadRequestException('Invalid S3 URL format');
    }
    isImage(mimeType) {
        return this.SUPPORTED_IMAGE_TYPES.includes(mimeType);
    }
    isVideo(mimeType) {
        return this.SUPPORTED_VIDEO_TYPES.includes(mimeType);
    }
    validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (file.size > this.MAX_FILE_SIZE) {
            throw new common_1.BadRequestException('File size too large (max 50MB)');
        }
        if (this.isImage(file.mimetype) && file.size > this.MAX_IMAGE_SIZE) {
            throw new common_1.BadRequestException('Image size too large (max 10MB)');
        }
        if (this.isVideo(file.mimetype) && file.size > this.MAX_VIDEO_SIZE) {
            throw new common_1.BadRequestException('Video size too large (max 50MB)');
        }
        const allSupportedTypes = [...this.SUPPORTED_IMAGE_TYPES, ...this.SUPPORTED_VIDEO_TYPES];
        if (!allSupportedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Unsupported file type. Supported types: ${allSupportedTypes.join(', ')}`);
        }
    }
    generateFileKey(file, options) {
        const timestamp = new Date().toISOString().split('T')[0];
        const uniqueId = (0, uuid_1.v4)();
        const extension = this.getFileExtension(file.originalname);
        let fileName = options.customFileName || `${uniqueId}${extension}`;
        if (options.prefix) {
            fileName = `${options.prefix}-${fileName}`;
        }
        let folder = options.folder || this.getDefaultFolder(file.mimetype);
        folder = `${folder}/${timestamp}`;
        return `${folder}/${fileName}`;
    }
    getDefaultFolder(mimeType) {
        if (this.isImage(mimeType)) {
            return 'images';
        }
        else if (this.isVideo(mimeType)) {
            return 'videos';
        }
        return 'files';
    }
    getFileExtension(filename) {
        const lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map
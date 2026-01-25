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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const staff_service_1 = require("./staff.service");
const dto_1 = require("./dto");
const guards_1 = require("../common/guards");
const decorators_1 = require("../common/decorators");
const enums_1 = require("../common/enums");
let StaffController = class StaffController {
    constructor(staffService) {
        this.staffService = staffService;
    }
    async create(req, createStaffDto, file) {
        return this.staffService.create(req.user.userId, createStaffDto, file);
    }
    async findAll(req, query) {
        return this.staffService.findAll(req.user.userId, query);
    }
    async findOne(req, id) {
        return this.staffService.findOne(req.user.userId, id);
    }
    async update(req, id, updateStaffDto) {
        return this.staffService.update(req.user.userId, id, updateStaffDto);
    }
    async remove(req, id) {
        return this.staffService.remove(req.user.userId, id);
    }
    async uploadProfilePicture(req, id, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        return this.staffService.uploadProfilePicture(req.user.userId, id, file);
    }
    async deleteProfilePicture(req, id) {
        return this.staffService.deleteProfilePicture(req.user.userId, id);
    }
    async deactivate(req, id) {
        return this.staffService.deactivate(req.user.userId, id);
    }
    async activate(req, id) {
        return this.staffService.activate(req.user.userId, id);
    }
};
exports.StaffController = StaffController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new staff member' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Staff member created successfully',
        type: dto_1.StaffResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Staff member already exists' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateStaffDto, Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all staff members for the business' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff members retrieved successfully',
        type: dto_1.StaffListResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.StaffQueryDto]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific staff member' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff member retrieved successfully',
        type: dto_1.StaffResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff member not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a staff member' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff member updated successfully',
        type: dto_1.StaffResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff member not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Phone or email already exists' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateStaffDto]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a staff member permanently',
        description: 'Permanently delete a staff member from the database. This action cannot be undone. The staff record and associated profile picture will be completely removed.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Staff member deleted permanently' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff member not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/profile-picture'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload staff profile picture',
        description: 'Upload a profile picture for a staff member. Replaces existing profile picture if one exists.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff ID' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Profile picture uploaded successfully',
        type: dto_1.ProfilePictureResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Invalid file or no file provided' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff member not found' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "uploadProfilePicture", null);
__decorate([
    (0, common_1.Delete)(':id/profile-picture'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete staff profile picture',
        description: 'Delete the current profile picture for a staff member.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile picture deleted successfully',
        type: dto_1.MessageResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - No profile picture to delete' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff member not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "deleteProfilePicture", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Deactivate a staff member',
        description: 'Deactivate a staff member without permanently deleting their record. This is a soft delete operation.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff member deactivated successfully',
        type: dto_1.MessageResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Staff member already deactivated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff member not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Activate a staff member',
        description: 'Reactivate a previously deactivated staff member.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff member activated successfully',
        type: dto_1.MessageResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Staff member already active' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Staff member not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "activate", null);
exports.StaffController = StaffController = __decorate([
    (0, swagger_1.ApiTags)('Staff Management'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, decorators_1.Roles)(enums_1.UserRole.BUSINESS_OWNER),
    (0, common_1.Controller)('staff'),
    __metadata("design:paramtypes", [staff_service_1.StaffService])
], StaffController);
//# sourceMappingURL=staff.controller.js.map
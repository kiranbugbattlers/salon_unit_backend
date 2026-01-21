"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOnly = AdminOnly;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const admin_guard_1 = require("../guards/admin.guard");
function AdminOnly() {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)('JWT'), (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }));
}
//# sourceMappingURL=admin-only.decorator.js.map
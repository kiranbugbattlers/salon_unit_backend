"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportMemberModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../database/entities");
const support_member_controller_1 = require("./support-member.controller");
const support_member_service_1 = require("./support-member.service");
const assignment_service_1 = require("./assignment.service");
const s3_service_1 = require("../common/services/s3.service");
let SupportMemberModule = class SupportMemberModule {
};
exports.SupportMemberModule = SupportMemberModule;
exports.SupportMemberModule = SupportMemberModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.SupportMember,
                entities_1.CustomerSupportMapping,
                entities_1.Admin,
                entities_1.Customer,
            ]),
        ],
        controllers: [support_member_controller_1.SupportMemberController],
        providers: [support_member_service_1.SupportMemberService, assignment_service_1.AssignmentService, s3_service_1.S3Service],
        exports: [support_member_service_1.SupportMemberService, assignment_service_1.AssignmentService],
    })
], SupportMemberModule);
//# sourceMappingURL=support-member.module.js.map
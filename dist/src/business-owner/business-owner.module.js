"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessOwnerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const business_owner_controller_1 = require("./business-owner.controller");
const business_owner_service_1 = require("./business-owner.service");
const approval_module_1 = require("../approval/approval.module");
const common_module_1 = require("../common/common.module");
const business_owner_entity_1 = require("../database/entities/business-owner.entity");
const business_owner_onboarding_entity_1 = require("../database/entities/business-owner-onboarding.entity");
const business_address_entity_1 = require("../database/entities/business-address.entity");
const business_media_entity_1 = require("../database/entities/business-media.entity");
const business_operating_hours_entity_1 = require("../database/entities/business-operating-hours.entity");
const business_service_entity_1 = require("../database/entities/business-service.entity");
const service_package_entity_1 = require("../database/entities/service-package.entity");
const service_package_item_entity_1 = require("../database/entities/service-package-item.entity");
const service_entity_1 = require("../database/entities/service.entity");
const service_category_entity_1 = require("../database/entities/service-category.entity");
const user_entity_1 = require("../database/entities/user.entity");
const customer_entity_1 = require("../database/entities/customer.entity");
const banking_info_entity_1 = require("../database/entities/banking-info.entity");
const business_settings_entity_1 = require("../database/entities/business-settings.entity");
const review_entity_1 = require("../database/entities/review.entity");
const business_document_entity_1 = require("../database/entities/business-document.entity");
let BusinessOwnerModule = class BusinessOwnerModule {
};
exports.BusinessOwnerModule = BusinessOwnerModule;
exports.BusinessOwnerModule = BusinessOwnerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                business_owner_entity_1.BusinessOwner,
                business_owner_onboarding_entity_1.BusinessOwnerOnboarding,
                business_address_entity_1.BusinessAddress,
                business_media_entity_1.BusinessMedia,
                business_operating_hours_entity_1.BusinessOperatingHours,
                business_service_entity_1.BusinessService,
                service_package_entity_1.ServicePackage,
                service_package_item_entity_1.ServicePackageItem,
                service_entity_1.Service,
                service_category_entity_1.ServiceCategory,
                user_entity_1.User,
                customer_entity_1.Customer,
                banking_info_entity_1.BankingInfo,
                business_settings_entity_1.BusinessSettings,
                review_entity_1.Review,
                business_document_entity_1.BusinessDocument,
            ]),
            (0, common_1.forwardRef)(() => approval_module_1.ApprovalModule),
            common_module_1.CommonModule,
        ],
        controllers: [business_owner_controller_1.BusinessOwnerController],
        providers: [business_owner_service_1.BusinessOwnerService],
        exports: [business_owner_service_1.BusinessOwnerService],
    })
], BusinessOwnerModule);
//# sourceMappingURL=business-owner.module.js.map
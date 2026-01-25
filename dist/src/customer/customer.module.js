"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_entity_1 = require("../database/entities/customer.entity");
const customer_onboarding_entity_1 = require("../database/entities/customer-onboarding.entity");
const user_entity_1 = require("../database/entities/user.entity");
const user_address_entity_1 = require("../database/entities/user-address.entity");
const customer_favorite_entity_1 = require("../database/entities/customer-favorite.entity");
const business_owner_entity_1 = require("../database/entities/business-owner.entity");
const business_address_entity_1 = require("../database/entities/business-address.entity");
const business_media_entity_1 = require("../database/entities/business-media.entity");
const customer_controller_1 = require("./customer.controller");
const customer_service_1 = require("./customer.service");
const common_module_1 = require("../common/common.module");
const support_member_module_1 = require("../support-member/support-member.module");
let CustomerModule = class CustomerModule {
};
exports.CustomerModule = CustomerModule;
exports.CustomerModule = CustomerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                customer_entity_1.Customer,
                customer_onboarding_entity_1.CustomerOnboarding,
                user_entity_1.User,
                user_address_entity_1.UserAddress,
                customer_favorite_entity_1.CustomerFavorite,
                business_owner_entity_1.BusinessOwner,
                business_address_entity_1.BusinessAddress,
                business_media_entity_1.BusinessMedia,
            ]),
            common_module_1.CommonModule,
            support_member_module_1.SupportMemberModule,
        ],
        controllers: [customer_controller_1.CustomerController],
        providers: [customer_service_1.CustomerService],
        exports: [customer_service_1.CustomerService],
    })
], CustomerModule);
//# sourceMappingURL=customer.module.js.map
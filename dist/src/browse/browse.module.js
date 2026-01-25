"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const browse_controller_1 = require("./browse.controller");
const browse_service_1 = require("./browse.service");
const business_owner_entity_1 = require("../database/entities/business-owner.entity");
const service_package_entity_1 = require("../database/entities/service-package.entity");
let BrowseModule = class BrowseModule {
};
exports.BrowseModule = BrowseModule;
exports.BrowseModule = BrowseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                business_owner_entity_1.BusinessOwner,
                service_package_entity_1.ServicePackage,
            ]),
        ],
        controllers: [browse_controller_1.BrowseController],
        providers: [browse_service_1.BrowseService],
        exports: [browse_service_1.BrowseService],
    })
], BrowseModule);
//# sourceMappingURL=browse.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvertisementModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../database/entities");
const advertisement_controller_1 = require("./advertisement.controller");
const advertisement_service_1 = require("./advertisement.service");
const s3_service_1 = require("../common/services/s3.service");
let AdvertisementModule = class AdvertisementModule {
};
exports.AdvertisementModule = AdvertisementModule;
exports.AdvertisementModule = AdvertisementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.Advertisement, entities_1.Admin]),
        ],
        controllers: [advertisement_controller_1.AdvertisementController],
        providers: [advertisement_service_1.AdvertisementService, s3_service_1.S3Service],
        exports: [advertisement_service_1.AdvertisementService],
    })
], AdvertisementModule);
//# sourceMappingURL=advertisement.module.js.map
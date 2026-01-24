"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const s3_service_1 = require("./services/s3.service");
const distance_calculator_service_1 = require("./services/distance-calculator.service");
const otp_service_1 = require("./services/otp/otp.service");
const otp_factory_service_1 = require("./services/otp/otp-factory.service");
const twilio_verify_otp_service_1 = require("./services/otp/providers/twilio-verify-otp.service");
const entities_1 = require("../database/entities");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([entities_1.OtpToken]),
        ],
        controllers: [],
        providers: [
            s3_service_1.S3Service,
            distance_calculator_service_1.DistanceCalculatorService,
            otp_service_1.OtpService,
            otp_factory_service_1.OtpFactoryService,
            twilio_verify_otp_service_1.TwilioVerifyOtpService,
        ],
        exports: [
            s3_service_1.S3Service,
            distance_calculator_service_1.DistanceCalculatorService,
            otp_service_1.OtpService,
            otp_factory_service_1.OtpFactoryService,
            twilio_verify_otp_service_1.TwilioVerifyOtpService,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map
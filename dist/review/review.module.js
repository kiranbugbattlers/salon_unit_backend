"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const review_entity_1 = require("../database/entities/review.entity");
const booking_entity_1 = require("../database/entities/booking.entity");
const customer_entity_1 = require("../database/entities/customer.entity");
const business_owner_entity_1 = require("../database/entities/business-owner.entity");
const review_service_1 = require("./review.service");
const customer_review_controller_1 = require("./customer-review.controller");
const business_owner_review_controller_1 = require("./business-owner-review.controller");
const admin_review_controller_1 = require("./admin-review.controller");
let ReviewModule = class ReviewModule {
};
exports.ReviewModule = ReviewModule;
exports.ReviewModule = ReviewModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([review_entity_1.Review, booking_entity_1.Booking, customer_entity_1.Customer, business_owner_entity_1.BusinessOwner]),
        ],
        controllers: [
            customer_review_controller_1.CustomerReviewController,
            business_owner_review_controller_1.BusinessOwnerReviewController,
            admin_review_controller_1.AdminReviewController,
        ],
        providers: [
            review_service_1.ReviewService,
        ],
        exports: [review_service_1.ReviewService],
    })
], ReviewModule);
//# sourceMappingURL=review.module.js.map
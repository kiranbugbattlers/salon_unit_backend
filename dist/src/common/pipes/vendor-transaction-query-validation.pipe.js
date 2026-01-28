"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorTransactionQueryValidationPipe = void 0;
const common_1 = require("@nestjs/common");
let VendorTransactionQueryValidationPipe = class VendorTransactionQueryValidationPipe {
    transform(value, metadata) {
        if (metadata.type !== 'query') {
            return value;
        }
        if (value.sortOrder) {
            const sortOrder = value.sortOrder.toString().trim().toUpperCase();
            if (!['ASC', 'DESC'].includes(sortOrder)) {
                throw new common_1.BadRequestException('sortOrder must be either ASC or DESC');
            }
            value.sortOrder = sortOrder;
        }
        else {
            value.sortOrder = 'DESC';
        }
        if (value.sortBy) {
            const sortBy = value.sortBy.toString().trim();
            const validSortFields = ['createdAt', 'amount', 'type', 'category'];
            if (!validSortFields.includes(sortBy)) {
                throw new common_1.BadRequestException('sortBy must be one of: createdAt, amount, type, category');
            }
            value.sortBy = sortBy;
        }
        else {
            value.sortBy = 'createdAt';
        }
        if (value.page) {
            const page = parseInt(value.page, 10);
            if (isNaN(page) || page < 1) {
                value.page = 1;
            }
            else {
                value.page = page;
            }
        }
        else {
            value.page = 1;
        }
        if (value.limit) {
            const limit = parseInt(value.limit, 10);
            if (isNaN(limit) || limit < 1 || limit > 100) {
                value.limit = 20;
            }
            else {
                value.limit = limit;
            }
        }
        else {
            value.limit = 20;
        }
        return value;
    }
};
exports.VendorTransactionQueryValidationPipe = VendorTransactionQueryValidationPipe;
exports.VendorTransactionQueryValidationPipe = VendorTransactionQueryValidationPipe = __decorate([
    (0, common_1.Injectable)()
], VendorTransactionQueryValidationPipe);
//# sourceMappingURL=vendor-transaction-query-validation.pipe.js.map
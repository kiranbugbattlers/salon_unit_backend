"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlNormalizationMiddleware = void 0;
const common_1 = require("@nestjs/common");
let UrlNormalizationMiddleware = class UrlNormalizationMiddleware {
    use(req, res, next) {
        const originalUrl = req.url;
        if (originalUrl.includes('//')) {
            const normalizedUrl = originalUrl.replace(/\/+/g, '/');
            req.url = normalizedUrl;
            console.log(`URL normalized: ${originalUrl} -> ${normalizedUrl}`);
        }
        next();
    }
};
exports.UrlNormalizationMiddleware = UrlNormalizationMiddleware;
exports.UrlNormalizationMiddleware = UrlNormalizationMiddleware = __decorate([
    (0, common_1.Injectable)()
], UrlNormalizationMiddleware);
//# sourceMappingURL=url-normalization.middleware.js.map
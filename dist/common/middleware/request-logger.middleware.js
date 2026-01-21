"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
let RequestLoggerMiddleware = class RequestLoggerMiddleware {
    use(req, res, next) {
        const startTime = Date.now();
        const { method, originalUrl } = req;
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const statusCode = res.statusCode;
            const reset = '\x1b[0m';
            const bold = '\x1b[1m';
            const dim = '\x1b[2m';
            const green = '\x1b[32m';
            const red = '\x1b[31m';
            const yellow = '\x1b[33m';
            const cyan = '\x1b[36m';
            const white = '\x1b[37m';
            const bgGreen = '\x1b[42m';
            const bgRed = '\x1b[41m';
            const bgYellow = '\x1b[43m';
            const black = '\x1b[30m';
            let statusBg = bgGreen;
            let statusText = black;
            let lineColor = green;
            let statusIcon = '✓';
            if (statusCode >= 400 && statusCode < 500) {
                statusBg = bgYellow;
                statusText = black;
                lineColor = yellow;
                statusIcon = '⚠';
            }
            else if (statusCode >= 500) {
                statusBg = bgRed;
                statusText = white;
                lineColor = red;
                statusIcon = '✗';
            }
            let methodColor = cyan;
            let methodIcon = '→';
            if (method === 'POST') {
                methodColor = green;
                methodIcon = '+';
            }
            else if (method === 'PUT' || method === 'PATCH') {
                methodColor = yellow;
                methodIcon = '~';
            }
            else if (method === 'DELETE') {
                methodColor = red;
                methodIcon = '-';
            }
            const timestamp = new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            console.log(`${lineColor}${dim}${timestamp}${reset} ` +
                `${lineColor}${methodIcon} ${bold}${method.padEnd(7)}${reset} ` +
                `${lineColor}${originalUrl}${reset} ` +
                `${statusBg}${statusText}${bold} ${statusCode} ${reset} ` +
                `${dim}${duration}ms${reset}`);
        });
        next();
    }
};
exports.RequestLoggerMiddleware = RequestLoggerMiddleware;
exports.RequestLoggerMiddleware = RequestLoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestLoggerMiddleware);
//# sourceMappingURL=request-logger.middleware.js.map
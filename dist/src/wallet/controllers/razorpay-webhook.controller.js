"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RazorpayWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const razorpay_payout_service_1 = require("../razorpay-payout.service");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let RazorpayWebhookController = RazorpayWebhookController_1 = class RazorpayWebhookController {
    constructor(razorpayPayoutService, configService) {
        this.razorpayPayoutService = razorpayPayoutService;
        this.configService = configService;
        this.logger = new common_1.Logger(RazorpayWebhookController_1.name);
        this.webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET') || '';
        if (!this.webhookSecret) {
            this.logger.warn('⚠️ RAZORPAY_WEBHOOK_SECRET not configured. Webhook signature verification will be skipped!');
        }
    }
    async handlePayoutWebhook(payload, signature) {
        try {
            this.logger.log(`📥 Received Razorpay webhook: Event=${payload.event} | PayoutId=${payload.payload?.payout?.entity?.id || 'N/A'}`);
            if (this.webhookSecret) {
                const isValid = this.verifyWebhookSignature(payload, signature);
                if (!isValid) {
                    this.logger.error('❌ Invalid webhook signature');
                    throw new common_1.BadRequestException('Invalid webhook signature');
                }
                this.logger.log('✅ Webhook signature verified');
            }
            else {
                this.logger.warn('⚠️ Skipping signature verification (no webhook secret configured)');
            }
            await this.razorpayPayoutService.handlePayoutWebhook(payload);
            this.logger.log(`✅ Webhook processed successfully: Event=${payload.event} | PayoutId=${payload.payload?.payout?.entity?.id}`);
            return {
                success: true,
                message: 'Webhook processed successfully',
            };
        }
        catch (error) {
            this.logger.error(`❌ Failed to process webhook: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Webhook processing failed',
                error: error.message,
            };
        }
    }
    verifyWebhookSignature(payload, signature) {
        if (!signature) {
            this.logger.warn('No signature provided in webhook request');
            return false;
        }
        try {
            const expectedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(JSON.stringify(payload))
                .digest('hex');
            return signature === expectedSignature;
        }
        catch (error) {
            this.logger.error(`Signature verification failed: ${error.message}`);
            return false;
        }
    }
};
exports.RazorpayWebhookController = RazorpayWebhookController;
__decorate([
    (0, common_1.Post)('payout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Razorpay payout webhook endpoint',
        description: `
      Receives webhook notifications from Razorpay for payout status updates.

      Razorpay sends webhooks for the following payout events:
      - payout.processed: Payout successfully transferred to beneficiary
      - payout.failed: Payout failed (invalid account, insufficient balance, etc.)
      - payout.reversed: Payout was reversed by the bank
      - payout.queued: Payout is queued for processing
      - payout.pending: Payout is pending at bank

      Security:
      - Webhook signature is verified using HMAC SHA256
      - Only requests with valid signatures are processed

      This endpoint is called automatically by Razorpay.
      Configure webhook URL in Razorpay Dashboard:
      Settings → Webhooks → Add Webhook

      URL: http://localhost:3000/webhooks/razorpay/payout

      Select Events:
      - payout.processed
      - payout.failed
      - payout.reversed
      - payout.queued
      - payout.pending
    `,
    }),
    (0, swagger_1.ApiBody)({
        description: 'Razorpay webhook payload',
        schema: {
            type: 'object',
            properties: {
                event: {
                    type: 'string',
                    example: 'payout.processed',
                    description: 'Webhook event type',
                },
                payload: {
                    type: 'object',
                    properties: {
                        payout: {
                            type: 'object',
                            properties: {
                                entity: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', example: 'pout_abc123' },
                                        status: { type: 'string', example: 'processed' },
                                        utr: { type: 'string', example: '123456789012' },
                                        failure_reason: { type: 'string', nullable: true },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Webhook processed successfully' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid webhook signature or malformed payload',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-razorpay-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RazorpayWebhookController.prototype, "handlePayoutWebhook", null);
exports.RazorpayWebhookController = RazorpayWebhookController = RazorpayWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('Webhooks - Razorpay'),
    (0, common_1.Controller)('webhooks/razorpay'),
    __metadata("design:paramtypes", [razorpay_payout_service_1.RazorpayPayoutService,
        config_1.ConfigService])
], RazorpayWebhookController);
//# sourceMappingURL=razorpay-webhook.controller.js.map
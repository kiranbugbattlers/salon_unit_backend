import { RazorpayPayoutService } from '../razorpay-payout.service';
import { ConfigService } from '@nestjs/config';
export declare class RazorpayWebhookController {
    private readonly razorpayPayoutService;
    private readonly configService;
    private readonly logger;
    private readonly webhookSecret;
    constructor(razorpayPayoutService: RazorpayPayoutService, configService: ConfigService);
    handlePayoutWebhook(payload: any, signature: string): Promise<any>;
    private verifyWebhookSignature;
}

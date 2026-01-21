import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RazorpayPayoutService } from '../razorpay-payout.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@ApiTags('Webhooks - Razorpay')
@Controller('webhooks/razorpay')
export class RazorpayWebhookController {
  private readonly logger = new Logger(RazorpayWebhookController.name);
  private readonly webhookSecret: string;

  constructor(
    private readonly razorpayPayoutService: RazorpayPayoutService,
    private readonly configService: ConfigService,
  ) {
    this.webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';

    if (!this.webhookSecret) {
      this.logger.warn(
        '⚠️ RAZORPAY_WEBHOOK_SECRET not configured. Webhook signature verification will be skipped!',
      );
    }
  }

  @Post('payout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
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
  })
  @ApiBody({
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
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Webhook processed successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or malformed payload',
  })
  async handlePayoutWebhook(
    @Body() payload: any,
    @Headers('x-razorpay-signature') signature: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `📥 Received Razorpay webhook: Event=${payload.event} | PayoutId=${payload.payload?.payout?.entity?.id || 'N/A'}`,
      );

      // Verify webhook signature (if secret is configured)
      if (this.webhookSecret) {
        const isValid = this.verifyWebhookSignature(payload, signature);
        if (!isValid) {
          this.logger.error('❌ Invalid webhook signature');
          throw new BadRequestException('Invalid webhook signature');
        }
        this.logger.log('✅ Webhook signature verified');
      } else {
        this.logger.warn('⚠️ Skipping signature verification (no webhook secret configured)');
      }

      // Process the webhook
      await this.razorpayPayoutService.handlePayoutWebhook(payload);

      this.logger.log(
        `✅ Webhook processed successfully: Event=${payload.event} | PayoutId=${payload.payload?.payout?.entity?.id}`,
      );

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to process webhook: ${error.message}`,
        error.stack,
      );

      // Don't throw error - return 200 to prevent Razorpay from retrying
      // Log the error for manual investigation
      return {
        success: false,
        message: 'Webhook processing failed',
        error: error.message,
      };
    }
  }

  /**
   * Verify Razorpay webhook signature
   * Signature = HMAC SHA256 (webhook_body, webhook_secret)
   */
  private verifyWebhookSignature(payload: any, signature: string): boolean {
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
    } catch (error) {
      this.logger.error(`Signature verification failed: ${error.message}`);
      return false;
    }
  }
}

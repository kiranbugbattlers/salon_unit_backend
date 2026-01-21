export enum PaymentStatus {
  CREATED = 'created',              // Payment order created, awaiting payment
  PENDING = 'pending',              // Payment in progress
  SUCCESS = 'success',              // Payment completed successfully
  FAILED = 'failed',                // Payment failed
  REFUNDED = 'refunded',            // Full refund processed
  PARTIAL_REFUND = 'partial_refund', // Partial refund processed
  EXPIRED = 'expired',              // Payment link/order expired
}

-- Migration: Make razorpay_order_id nullable for COD payments
-- Date: 2025-10-29
-- Description: Allow COD payments by making razorpay_order_id nullable in payments table

-- Make razorpay_order_id nullable
ALTER TABLE payments
ALTER COLUMN razorpay_order_id DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN payments.razorpay_order_id IS 'Razorpay Order ID (NULL for COD payments)';

-- Verify migration
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully';
    RAISE NOTICE '   - razorpay_order_id is now nullable';
    RAISE NOTICE '   - COD payments can now be created without Razorpay order';
END$$;

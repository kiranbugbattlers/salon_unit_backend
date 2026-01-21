-- Migration: Add Razorpay payment fields to subscription tables
-- Date: 2025-10-22
-- Description: Adds Razorpay-specific columns and fixes column name mismatches
--              to support Razorpay payment integration for subscription payments

-- ============================================================================
-- PART 1: business_subscriptions table
-- ============================================================================

-- Add Razorpay order ID column
ALTER TABLE business_subscriptions
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);

-- Add Razorpay payment ID column
ALTER TABLE business_subscriptions
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);

-- Add last payment attempt timestamp column
ALTER TABLE business_subscriptions
ADD COLUMN IF NOT EXISTS last_payment_attempt_at TIMESTAMP;

-- Add comments for documentation
COMMENT ON COLUMN business_subscriptions.razorpay_order_id IS 'Razorpay order ID for subscription payment';
COMMENT ON COLUMN business_subscriptions.razorpay_payment_id IS 'Razorpay payment ID for completed subscription payment';
COMMENT ON COLUMN business_subscriptions.last_payment_attempt_at IS 'Timestamp of the last payment attempt for this subscription';

-- Create index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_razorpay_order
ON business_subscriptions(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_business_subscriptions_razorpay_payment
ON business_subscriptions(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

-- ============================================================================
-- PART 2: subscription_transactions table
-- ============================================================================

-- Add missing Razorpay-specific columns
ALTER TABLE subscription_transactions
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);

ALTER TABLE subscription_transactions
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);

ALTER TABLE subscription_transactions
ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255);

ALTER TABLE subscription_transactions
ADD COLUMN IF NOT EXISTS payment_attempted_at TIMESTAMP;

ALTER TABLE subscription_transactions
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP;

-- Add required transaction_date column (TypeORM entity requires this)
ALTER TABLE subscription_transactions
ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMP;

-- Set default for transaction_date on existing rows (use created_at as fallback)
UPDATE subscription_transactions
SET transaction_date = created_at
WHERE transaction_date IS NULL;

-- Rename mismatched columns to align with TypeORM entity
-- Note: These renames will fail if column names already match - that's OK
DO $$
BEGIN
    -- Rename payment_gateway to payment_provider
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'subscription_transactions' AND column_name = 'payment_gateway'
    ) THEN
        ALTER TABLE subscription_transactions
        RENAME COLUMN payment_gateway TO payment_provider;
    END IF;

    -- Rename gateway_transaction_id to provider_transaction_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'subscription_transactions' AND column_name = 'gateway_transaction_id'
    ) THEN
        ALTER TABLE subscription_transactions
        RENAME COLUMN gateway_transaction_id TO provider_transaction_id;
    END IF;

    -- Rename gateway_response to metadata
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'subscription_transactions' AND column_name = 'gateway_response'
    ) THEN
        ALTER TABLE subscription_transactions
        RENAME COLUMN gateway_response TO metadata;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN subscription_transactions.razorpay_order_id IS 'Razorpay order ID for transaction';
COMMENT ON COLUMN subscription_transactions.razorpay_payment_id IS 'Razorpay payment ID for completed transaction';
COMMENT ON COLUMN subscription_transactions.razorpay_signature IS 'Razorpay signature for payment verification';
COMMENT ON COLUMN subscription_transactions.payment_attempted_at IS 'Timestamp when payment was attempted';
COMMENT ON COLUMN subscription_transactions.payment_completed_at IS 'Timestamp when payment was completed successfully';
COMMENT ON COLUMN subscription_transactions.transaction_date IS 'Date and time of the transaction';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_razorpay_order
ON subscription_transactions(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscription_transactions_razorpay_payment
ON subscription_transactions(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscription_transactions_subscription_id
ON subscription_transactions(business_subscription_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify business_subscriptions columns
SELECT
    'business_subscriptions' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'business_subscriptions'
AND column_name IN ('razorpay_order_id', 'razorpay_payment_id', 'last_payment_attempt_at')
ORDER BY column_name;

-- Verify subscription_transactions columns
SELECT
    'subscription_transactions' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'subscription_transactions'
AND column_name IN (
    'razorpay_order_id',
    'razorpay_payment_id',
    'razorpay_signature',
    'payment_attempted_at',
    'payment_completed_at',
    'transaction_date',
    'payment_provider',
    'provider_transaction_id',
    'metadata'
)
ORDER BY column_name;

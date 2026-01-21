-- =====================================================
-- Commission Payment System Migration
-- Allows business owners to pay commission debt online
-- =====================================================

-- Create commission_payments table
CREATE TABLE IF NOT EXISTS commission_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL REFERENCES business_owner(id),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_description TEXT,
    notes TEXT,
    failure_reason TEXT,
    defaulter_removed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_commission_payments_business_owner ON commission_payments(business_owner_id);
CREATE INDEX idx_commission_payments_wallet ON commission_payments(wallet_id);
CREATE INDEX idx_commission_payments_order ON commission_payments(razorpay_order_id);
CREATE INDEX idx_commission_payments_status ON commission_payments(status);
CREATE INDEX idx_commission_payments_created ON commission_payments(created_at DESC);

-- Add COMMISSION_PAYMENT category to wallet_transactions if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'wallet_transactions_category_enum'
        AND e.enumlabel = 'commission_payment'
    ) THEN
        ALTER TYPE wallet_transactions_category_enum ADD VALUE 'commission_payment';
    END IF;
END$$;

-- Create function to update commission_payments updated_at
CREATE OR REPLACE FUNCTION update_commission_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for commission_payments
DROP TRIGGER IF EXISTS trigger_update_commission_payments_updated_at ON commission_payments;
CREATE TRIGGER trigger_update_commission_payments_updated_at
    BEFORE UPDATE ON commission_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_commission_payments_updated_at();

-- Create view for pending payments
CREATE OR REPLACE VIEW v_pending_commission_payments AS
SELECT
    cp.id,
    cp.business_owner_id,
    bo.business_name,
    bo.shop_id,
    cp.amount,
    cp.balance_before,
    cp.razorpay_order_id,
    cp.status,
    cp.created_at,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - cp.created_at))/3600 as hours_pending
FROM commission_payments cp
JOIN business_owner bo ON cp.business_owner_id = bo.id
WHERE cp.status = 'pending'
ORDER BY cp.created_at DESC;

-- Create view for completed payments summary
CREATE OR REPLACE VIEW v_commission_payments_summary AS
SELECT
    cp.business_owner_id,
    bo.business_name,
    COUNT(*) as total_payments,
    SUM(cp.amount) as total_amount_paid,
    SUM(CASE WHEN cp.status = 'completed' THEN cp.amount ELSE 0 END) as total_successful,
    SUM(CASE WHEN cp.status = 'failed' THEN cp.amount ELSE 0 END) as total_failed,
    COUNT(CASE WHEN cp.defaulter_removed = true THEN 1 END) as times_defaulter_removed,
    MAX(cp.processed_at) as last_payment_date
FROM commission_payments cp
JOIN business_owner bo ON cp.business_owner_id = bo.id
GROUP BY cp.business_owner_id, bo.business_name;

-- Grant permissions
GRANT SELECT ON v_pending_commission_payments TO salon_user;
GRANT SELECT ON v_commission_payments_summary TO salon_user;

-- Add comments
COMMENT ON TABLE commission_payments IS 'Tracks commission payments made by business owners to clear their debt';
COMMENT ON COLUMN commission_payments.amount IS 'Amount paid in INR';
COMMENT ON COLUMN commission_payments.balance_before IS 'Wallet balance before payment';
COMMENT ON COLUMN commission_payments.balance_after IS 'Wallet balance after payment (populated after successful payment)';
COMMENT ON COLUMN commission_payments.defaulter_removed IS 'TRUE if this payment cleared defaulter status';
COMMENT ON COLUMN commission_payments.razorpay_order_id IS 'Razorpay order ID for tracking';
COMMENT ON COLUMN commission_payments.razorpay_payment_id IS 'Razorpay payment ID after successful payment';
COMMENT ON COLUMN commission_payments.razorpay_signature IS 'Razorpay signature for payment verification';

-- =====================================================
-- Migration Complete
-- =====================================================

-- Verify migration
DO $$
BEGIN
    RAISE NOTICE '✅ Commission payment system migration completed successfully';
    RAISE NOTICE '   - commission_payments table created';
    RAISE NOTICE '   - Indexes created for performance';
    RAISE NOTICE '   - Views created for monitoring';
    RAISE NOTICE '   - COMMISSION_PAYMENT category added to transactions';
END$$;

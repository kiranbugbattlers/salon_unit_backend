-- Migration: Production Hardening - Add audit, encryption, idempotency, and payout features
-- Date: 2025-10-22
-- Description: Adds critical production features for wallet system security and reliability

-- ====================================================================================
-- PART 1: Admin Actions Audit Table
-- ====================================================================================

CREATE TABLE IF NOT EXISTS admin_actions_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who did it
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,

  -- What was done
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- State tracking
  state_before JSONB,
  state_after JSONB,

  -- Why it was done
  reason TEXT NOT NULL,
  notes TEXT,

  -- Request metadata
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  metadata JSONB,

  -- When
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_admin_actions_audit_admin_date
  ON admin_actions_audit(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_audit_action_date
  ON admin_actions_audit(action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_audit_entity
  ON admin_actions_audit(entity_type, entity_id);

COMMENT ON TABLE admin_actions_audit IS
  'Audit trail for all administrative actions on wallet system - for compliance and security';

-- ====================================================================================
-- PART 2: Wallet Freeze Functionality
-- ====================================================================================

DO $$
BEGIN
  -- Add wallet freeze columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wallets' AND column_name = 'is_frozen'
  ) THEN
    ALTER TABLE wallets
      ADD COLUMN is_frozen BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN frozen_reason TEXT,
      ADD COLUMN frozen_at TIMESTAMP,
      ADD COLUMN frozen_by_admin_id UUID REFERENCES admins(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_wallets_frozen ON wallets(is_frozen);

COMMENT ON COLUMN wallets.is_frozen IS 'Whether wallet is frozen (no transactions allowed)';
COMMENT ON COLUMN wallets.frozen_reason IS 'Reason for freezing the wallet';

-- ====================================================================================
-- PART 3: Idempotency Keys Table
-- ====================================================================================

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Unique idempotency key from client
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,

  -- Request details
  endpoint VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL,
  request_payload JSONB NOT NULL,

  -- Response caching
  response_payload JSONB,
  status VARCHAR(50) NOT NULL, -- 'processing', 'completed', 'failed'

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_key ON idempotency_keys(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires ON idempotency_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_user ON idempotency_keys(user_id, created_at DESC);

COMMENT ON TABLE idempotency_keys IS
  'Tracks idempotency keys to prevent duplicate operations (e.g., double commission deduction)';

-- Auto-cleanup expired keys (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM idempotency_keys
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ====================================================================================
-- PART 4: Enhanced Banking Info for Razorpay Integration
-- ====================================================================================

DO $$
BEGIN
  -- Add Razorpay fund account tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banking_info' AND column_name = 'razorpay_fund_account_id'
  ) THEN
    ALTER TABLE banking_info
      ADD COLUMN razorpay_fund_account_id VARCHAR(255),
      ADD COLUMN fund_account_status VARCHAR(50) DEFAULT 'pending',
      ADD COLUMN fund_account_created_at TIMESTAMP,
      ADD COLUMN razorpay_contact_id VARCHAR(255);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_banking_info_fund_account
  ON banking_info(razorpay_fund_account_id);

COMMENT ON COLUMN banking_info.razorpay_fund_account_id IS
  'Razorpay fund account ID for automated payouts';
COMMENT ON COLUMN banking_info.fund_account_status IS
  'Status: pending, active, failed, suspended';

-- ====================================================================================
-- PART 5: Enhanced Settlement Payout Tracking
-- ====================================================================================

DO $$
BEGIN
  -- Add detailed payout tracking columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'monthly_settlements' AND column_name = 'razorpay_payout_id'
  ) THEN
    ALTER TABLE monthly_settlements
      ADD COLUMN razorpay_payout_id VARCHAR(255),
      ADD COLUMN payout_status VARCHAR(50),
      ADD COLUMN payout_utr VARCHAR(255),
      ADD COLUMN payout_mode VARCHAR(50),
      ADD COLUMN retry_count INT DEFAULT 0,
      ADD COLUMN last_retry_at TIMESTAMP,
      ADD COLUMN payout_metadata JSONB;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_settlements_payout_id
  ON monthly_settlements(razorpay_payout_id);
CREATE INDEX IF NOT EXISTS idx_settlements_payout_status
  ON monthly_settlements(payout_status);

COMMENT ON COLUMN monthly_settlements.razorpay_payout_id IS 'Razorpay payout ID';
COMMENT ON COLUMN monthly_settlements.payout_status IS 'Payout status: pending, processing, processed, reversed, failed';
COMMENT ON COLUMN monthly_settlements.payout_utr IS 'Unique Transaction Reference from bank';
COMMENT ON COLUMN monthly_settlements.payout_mode IS 'Payment mode: IMPS, NEFT, RTGS, etc.';

-- ====================================================================================
-- PART 6: Commission Reversal Tracking
-- ====================================================================================

DO $$
BEGIN
  -- Add commission reversal columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'commission_transactions' AND column_name = 'is_reversed'
  ) THEN
    ALTER TABLE commission_transactions
      ADD COLUMN is_reversed BOOLEAN DEFAULT false,
      ADD COLUMN reversed_at TIMESTAMP,
      ADD COLUMN reversal_reason TEXT,
      ADD COLUMN reversed_by_admin_id UUID REFERENCES admins(id),
      ADD COLUMN reversal_transaction_id UUID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_commission_transactions_reversed
  ON commission_transactions(is_reversed, reversed_at);

COMMENT ON COLUMN commission_transactions.is_reversed IS
  'Whether this commission has been reversed (e.g., booking cancelled)';

-- ====================================================================================
-- PART 7: Webhook Tracking Table
-- ====================================================================================

CREATE TABLE IF NOT EXISTS razorpay_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Webhook details
  event_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,

  -- Raw payload
  payload JSONB NOT NULL,

  -- Processing status
  status VARCHAR(50) NOT NULL DEFAULT 'received', -- 'received', 'processing', 'processed', 'failed'
  processed_at TIMESTAMP,
  error_message TEXT,
  retry_count INT DEFAULT 0,

  -- Security
  signature VARCHAR(255),
  ip_address VARCHAR(45),

  -- Timestamps
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhooks_entity ON razorpay_webhooks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON razorpay_webhooks(status, received_at);
CREATE INDEX IF NOT EXISTS idx_webhooks_event ON razorpay_webhooks(event_type);

COMMENT ON TABLE razorpay_webhooks IS
  'Tracks all Razorpay webhooks for payout status updates and debugging';

-- ====================================================================================
-- PART 8: Wallet Reconciliation Log
-- ====================================================================================

CREATE TABLE IF NOT EXISTS wallet_reconciliation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,

  -- Reconciliation results
  expected_balance DECIMAL(12, 2) NOT NULL,
  actual_balance DECIMAL(12, 2) NOT NULL,
  difference DECIMAL(12, 2) NOT NULL,
  is_balanced BOOLEAN NOT NULL,

  -- Transaction count
  transaction_count INT NOT NULL,

  -- Resolution
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'ignored'
  resolved_by_admin_id UUID REFERENCES admins(id),
  resolution_notes TEXT,

  -- Timestamps
  reconciled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_wallet
  ON wallet_reconciliation_log(wallet_id, reconciled_at DESC);
CREATE INDEX IF NOT EXISTS idx_reconciliation_unbalanced
  ON wallet_reconciliation_log(is_balanced, status);

COMMENT ON TABLE wallet_reconciliation_log IS
  'Daily wallet reconciliation results - tracks any balance discrepancies';

-- ====================================================================================
-- PART 9: Transaction Rate Limiting
-- ====================================================================================

CREATE TABLE IF NOT EXISTS transaction_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,

  -- Daily limits
  daily_transaction_count INT DEFAULT 0,
  daily_transaction_amount DECIMAL(12, 2) DEFAULT 0,

  -- Tracking
  last_transaction_date DATE NOT NULL,
  last_reset_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  max_daily_transactions INT DEFAULT 100,
  max_daily_amount DECIMAL(12, 2) DEFAULT 500000, -- ₹5 lakh

  UNIQUE(wallet_id)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_wallet
  ON transaction_rate_limits(wallet_id);

COMMENT ON TABLE transaction_rate_limits IS
  'Tracks transaction limits per wallet to prevent abuse';

-- ====================================================================================
-- PART 10: Create Views for Reporting
-- ====================================================================================

-- View: Pending payouts summary
CREATE OR REPLACE VIEW v_pending_payouts AS
SELECT
  s.id AS settlement_id,
  s.settlement_month,
  bo.shop_id,
  bo.business_name,
  s.net_payable_to_business_owner AS amount,
  s.status,
  s.payout_status,
  s.created_at,
  s.retry_count,
  bi.razorpay_fund_account_id,
  bi.fund_account_status
FROM monthly_settlements s
JOIN business_owner bo ON bo.id = s.business_owner_id
LEFT JOIN banking_info bi ON bi.business_owner_id = s.business_owner_id
WHERE s.status IN ('pending', 'processing')
  AND s.net_payable_to_business_owner > 0
ORDER BY s.created_at ASC;

COMMENT ON VIEW v_pending_payouts IS
  'Quick view of all pending payouts requiring admin attention';

-- View: Audit trail summary
CREATE OR REPLACE VIEW v_recent_admin_actions AS
SELECT
  a.id,
  a.action_type,
  a.entity_type,
  a.entity_id,
  ad.username AS admin_username,
  a.reason,
  a.ip_address,
  a.created_at
FROM admin_actions_audit a
JOIN admins ad ON ad.id = a.admin_id
ORDER BY a.created_at DESC
LIMIT 100;

COMMENT ON VIEW v_recent_admin_actions IS
  'Last 100 admin actions for quick review';

-- ====================================================================================
-- PART 11: Automated Maintenance Jobs
-- ====================================================================================

-- Function: Auto-cleanup old audit logs (keep 2 years)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_actions_audit
  WHERE created_at < NOW() - INTERVAL '2 years';

  DELETE FROM razorpay_webhooks
  WHERE received_at < NOW() - INTERVAL '90 days'
    AND status = 'processed';
END;
$$ LANGUAGE plpgsql;

-- Function: Reset daily transaction limits
CREATE OR REPLACE FUNCTION reset_daily_transaction_limits()
RETURNS void AS $$
BEGIN
  UPDATE transaction_rate_limits
  SET
    daily_transaction_count = 0,
    daily_transaction_amount = 0,
    last_reset_at = NOW()
  WHERE last_transaction_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================================
-- PART 12: Security Enhancements
-- ====================================================================================

-- Enable Row Level Security on sensitive tables (optional, for future)
-- ALTER TABLE banking_info ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_actions_audit ENABLE ROW LEVEL SECURITY;

-- Add trigger to prevent direct updates to audit table
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Cannot modify audit records - they are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_update
  BEFORE UPDATE ON admin_actions_audit
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER prevent_audit_delete
  BEFORE DELETE ON admin_actions_audit
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

-- ====================================================================================
-- PART 13: Constraints and Validations
-- ====================================================================================

-- Ensure payout_status is valid
ALTER TABLE monthly_settlements
  DROP CONSTRAINT IF EXISTS chk_payout_status;

ALTER TABLE monthly_settlements
  ADD CONSTRAINT chk_payout_status
  CHECK (payout_status IN ('pending', 'processing', 'processed', 'reversed', 'failed', 'queued'));

-- Ensure idempotency key expiry is in future
ALTER TABLE idempotency_keys
  DROP CONSTRAINT IF EXISTS chk_expires_future;

ALTER TABLE idempotency_keys
  ADD CONSTRAINT chk_expires_future
  CHECK (expires_at > created_at);

-- Ensure wallet can't be frozen without reason
ALTER TABLE wallets
  DROP CONSTRAINT IF EXISTS chk_frozen_reason;

ALTER TABLE wallets
  ADD CONSTRAINT chk_frozen_reason
  CHECK (
    (is_frozen = false) OR
    (is_frozen = true AND frozen_reason IS NOT NULL)
  );

-- ====================================================================================
-- PART 14: Initial Data
-- ====================================================================================

-- Create a system admin user for automated actions (if not exists)
-- This represents system-triggered actions vs human admin actions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE username = 'system') THEN
    INSERT INTO admins (id, username, email)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'system',
      'system@internal.local'
    );
  END IF;
END $$;

-- ====================================================================================
-- PART 15: Migration Verification & Logging
-- ====================================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 003 completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✓ admin_actions_audit (audit trail)';
  RAISE NOTICE '  ✓ idempotency_keys (prevent duplicates)';
  RAISE NOTICE '  ✓ razorpay_webhooks (webhook tracking)';
  RAISE NOTICE '  ✓ wallet_reconciliation_log (balance checks)';
  RAISE NOTICE '  ✓ transaction_rate_limits (abuse prevention)';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables modified:';
  RAISE NOTICE '  ✓ wallets (freeze functionality)';
  RAISE NOTICE '  ✓ banking_info (Razorpay integration)';
  RAISE NOTICE '  ✓ monthly_settlements (payout tracking)';
  RAISE NOTICE '  ✓ commission_transactions (reversal tracking)';
  RAISE NOTICE '';
  RAISE NOTICE 'Views created:';
  RAISE NOTICE '  ✓ v_pending_payouts';
  RAISE NOTICE '  ✓ v_recent_admin_actions';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  ✓ cleanup_expired_idempotency_keys()';
  RAISE NOTICE '  ✓ cleanup_old_audit_logs()';
  RAISE NOTICE '  ✓ reset_daily_transaction_limits()';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Update application code to use new tables';
  RAISE NOTICE '  2. Configure encryption key in .env';
  RAISE NOTICE '  3. Set up Razorpay credentials';
  RAISE NOTICE '  4. Test payout integration';
  RAISE NOTICE '  5. Enable monitoring & alerts';
  RAISE NOTICE '';
END $$;

-- ====================================================================================
-- ROLLBACK SCRIPT (for reference - DO NOT execute)
-- ====================================================================================

/*
-- To rollback this migration:

DROP VIEW IF EXISTS v_pending_payouts CASCADE;
DROP VIEW IF EXISTS v_recent_admin_actions CASCADE;

DROP TRIGGER IF EXISTS prevent_audit_update ON admin_actions_audit;
DROP TRIGGER IF EXISTS prevent_audit_delete ON admin_actions_audit;

DROP FUNCTION IF EXISTS prevent_audit_modification() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_idempotency_keys() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_audit_logs() CASCADE;
DROP FUNCTION IF EXISTS reset_daily_transaction_limits() CASCADE;

DROP TABLE IF EXISTS transaction_rate_limits CASCADE;
DROP TABLE IF EXISTS wallet_reconciliation_log CASCADE;
DROP TABLE IF EXISTS razorpay_webhooks CASCADE;
DROP TABLE IF EXISTS idempotency_keys CASCADE;
DROP TABLE IF EXISTS admin_actions_audit CASCADE;

ALTER TABLE wallets DROP COLUMN IF EXISTS is_frozen CASCADE;
ALTER TABLE wallets DROP COLUMN IF EXISTS frozen_reason CASCADE;
ALTER TABLE wallets DROP COLUMN IF EXISTS frozen_at CASCADE;
ALTER TABLE wallets DROP COLUMN IF EXISTS frozen_by_admin_id CASCADE;

ALTER TABLE banking_info DROP COLUMN IF EXISTS razorpay_fund_account_id CASCADE;
ALTER TABLE banking_info DROP COLUMN IF EXISTS fund_account_status CASCADE;
ALTER TABLE banking_info DROP COLUMN IF EXISTS fund_account_created_at CASCADE;
ALTER TABLE banking_info DROP COLUMN IF EXISTS razorpay_contact_id CASCADE;

ALTER TABLE monthly_settlements DROP COLUMN IF EXISTS razorpay_payout_id CASCADE;
ALTER TABLE monthly_settlements DROP COLUMN IF EXISTS payout_status CASCADE;
ALTER TABLE monthly_settlements DROP COLUMN IF EXISTS payout_utr CASCADE;
ALTER TABLE monthly_settlements DROP COLUMN IF EXISTS payout_mode CASCADE;
ALTER TABLE monthly_settlements DROP COLUMN IF EXISTS retry_count CASCADE;
ALTER TABLE monthly_settlements DROP COLUMN IF EXISTS last_retry_at CASCADE;
ALTER TABLE monthly_settlements DROP COLUMN IF EXISTS payout_metadata CASCADE;

ALTER TABLE commission_transactions DROP COLUMN IF EXISTS is_reversed CASCADE;
ALTER TABLE commission_transactions DROP COLUMN IF EXISTS reversed_at CASCADE;
ALTER TABLE commission_transactions DROP COLUMN IF EXISTS reversal_reason CASCADE;
ALTER TABLE commission_transactions DROP COLUMN IF EXISTS reversed_by_admin_id CASCADE;
ALTER TABLE commission_transactions DROP COLUMN IF EXISTS reversal_transaction_id CASCADE;

DELETE FROM admins WHERE id = '00000000-0000-0000-0000-000000000000';
*/

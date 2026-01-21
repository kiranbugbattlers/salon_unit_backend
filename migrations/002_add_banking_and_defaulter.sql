-- Migration: Add banking information table and defaulter tracking columns
-- Date: 2025-10-21
-- Description: Creates banking_info table for settlement payouts and adds defaulter tracking to business_owner table

-- ====================================================================================
-- PART 1: Add defaulter columns to business_owner table
-- ====================================================================================

-- Add columns if they don't exist (idempotent)
DO $$
BEGIN
  -- Add is_defaulter column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_owner'
    AND column_name = 'is_defaulter'
  ) THEN
    ALTER TABLE business_owner
    ADD COLUMN is_defaulter BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Add defaulter_since column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_owner'
    AND column_name = 'defaulter_since'
  ) THEN
    ALTER TABLE business_owner
    ADD COLUMN defaulter_since TIMESTAMP NULL;
  END IF;
END $$;

-- Create index on is_defaulter for efficient queries
CREATE INDEX IF NOT EXISTS idx_business_owner_defaulter
  ON business_owner(is_defaulter);

-- Create composite index for filtering approved non-defaulters (common query)
CREATE INDEX IF NOT EXISTS idx_business_owner_approved_defaulter
  ON business_owner(is_approved, is_defaulter);

-- Comment the columns
COMMENT ON COLUMN business_owner.is_defaulter IS
  'Whether the business is marked as defaulter due to negative wallet balance';
COMMENT ON COLUMN business_owner.defaulter_since IS
  'Timestamp when the business was first marked as defaulter';

-- ====================================================================================
-- PART 2: Create banking_info table
-- ====================================================================================

CREATE TABLE IF NOT EXISTS banking_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to business_owner (one-to-one relationship)
  business_owner_id UUID NOT NULL UNIQUE REFERENCES business_owner(id) ON DELETE CASCADE,

  -- Bank account details
  account_number VARCHAR(50) NOT NULL,
  account_holder_name VARCHAR(200) NOT NULL,
  ifsc_code VARCHAR(11) NOT NULL,
  bank_name VARCHAR(200) NOT NULL,
  branch VARCHAR(200) NULL,

  -- Verification status
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP NULL,

  -- Audit timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on business_owner_id for lookups
CREATE INDEX IF NOT EXISTS idx_banking_info_business_owner
  ON banking_info(business_owner_id);

-- Create index on verification status
CREATE INDEX IF NOT EXISTS idx_banking_info_verified
  ON banking_info(is_verified);

-- Add comments
COMMENT ON TABLE banking_info IS
  'Stores bank account information for business owners to receive settlement payouts';
COMMENT ON COLUMN banking_info.business_owner_id IS
  'One-to-one reference to business_owner table';
COMMENT ON COLUMN banking_info.account_number IS
  'Bank account number (stored securely, masked in API responses)';
COMMENT ON COLUMN banking_info.account_holder_name IS
  'Account holder name as per bank records';
COMMENT ON COLUMN banking_info.ifsc_code IS
  'Indian Financial System Code (11 characters, format: AAAA0BBBBBB)';
COMMENT ON COLUMN banking_info.bank_name IS
  'Name of the bank (e.g., State Bank of India)';
COMMENT ON COLUMN banking_info.branch IS
  'Bank branch name or location (optional)';
COMMENT ON COLUMN banking_info.is_verified IS
  'Whether this banking info has been verified by admin';
COMMENT ON COLUMN banking_info.verified_at IS
  'Timestamp when the banking info was verified';

-- ====================================================================================
-- PART 3: Create trigger for updated_at timestamp
-- ====================================================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_banking_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS banking_info_updated_at ON banking_info;
CREATE TRIGGER banking_info_updated_at
  BEFORE UPDATE ON banking_info
  FOR EACH ROW
  EXECUTE FUNCTION update_banking_info_updated_at();

-- ====================================================================================
-- PART 4: Add constraints and validations
-- ====================================================================================

-- Add check constraint for IFSC code format (11 characters)
ALTER TABLE banking_info
  DROP CONSTRAINT IF EXISTS chk_ifsc_code_length;

ALTER TABLE banking_info
  ADD CONSTRAINT chk_ifsc_code_length
  CHECK (LENGTH(ifsc_code) = 11);

-- Add check constraint for account number length (9-18 digits typical for Indian banks)
ALTER TABLE banking_info
  DROP CONSTRAINT IF EXISTS chk_account_number_length;

ALTER TABLE banking_info
  ADD CONSTRAINT chk_account_number_length
  CHECK (LENGTH(account_number) BETWEEN 9 AND 18);

-- Add check constraint: verified_at should only be set if is_verified is true
ALTER TABLE banking_info
  DROP CONSTRAINT IF EXISTS chk_verified_at_requires_verified;

ALTER TABLE banking_info
  ADD CONSTRAINT chk_verified_at_requires_verified
  CHECK (
    (is_verified = false AND verified_at IS NULL) OR
    (is_verified = true)
  );

-- ====================================================================================
-- PART 5: Migration verification
-- ====================================================================================

-- Log migration success
DO $$
BEGIN
  RAISE NOTICE 'Migration 002_add_banking_and_defaulter.sql completed successfully';
  RAISE NOTICE 'Tables created/modified:';
  RAISE NOTICE '  - business_owner (added: is_defaulter, defaulter_since)';
  RAISE NOTICE '  - banking_info (created)';
  RAISE NOTICE 'Indexes created: 3';
  RAISE NOTICE 'Triggers created: 1';
  RAISE NOTICE 'Constraints created: 3';
END $$;

-- ====================================================================================
-- ROLLBACK SCRIPT (for reference, do not execute)
-- ====================================================================================

-- To rollback this migration, execute:
/*
-- Drop banking_info table
DROP TABLE IF EXISTS banking_info CASCADE;
DROP FUNCTION IF EXISTS update_banking_info_updated_at() CASCADE;

-- Remove defaulter columns from business_owner
ALTER TABLE business_owner DROP COLUMN IF EXISTS is_defaulter;
ALTER TABLE business_owner DROP COLUMN IF EXISTS defaulter_since;

-- Drop indexes
DROP INDEX IF EXISTS idx_business_owner_defaulter;
DROP INDEX IF EXISTS idx_business_owner_approved_defaulter;
DROP INDEX IF EXISTS idx_banking_info_business_owner;
DROP INDEX IF EXISTS idx_banking_info_verified;
*/

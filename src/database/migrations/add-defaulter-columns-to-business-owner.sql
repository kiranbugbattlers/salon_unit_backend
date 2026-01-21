-- Add defaulter tracking columns to business_owner table
-- These columns support the wallet defaulter management feature

-- Add is_defaulter column to track businesses with negative wallet balance
ALTER TABLE business_owner
ADD COLUMN IF NOT EXISTS is_defaulter BOOLEAN DEFAULT false NOT NULL;

-- Add defaulter_since column to track when a business was marked as defaulter
ALTER TABLE business_owner
ADD COLUMN IF NOT EXISTS defaulter_since TIMESTAMP NULL;

-- Add index for querying defaulters
CREATE INDEX IF NOT EXISTS idx_business_owner_is_defaulter
ON business_owner(is_defaulter)
WHERE is_defaulter = true;

-- Add comment for documentation
COMMENT ON COLUMN business_owner.is_defaulter IS 'Whether the business is marked as defaulter due to negative wallet balance';
COMMENT ON COLUMN business_owner.defaulter_since IS 'Timestamp when the business was marked as defaulter';

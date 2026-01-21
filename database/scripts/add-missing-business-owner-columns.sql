-- Add missing columns to business_owner table
-- This script adds columns that exist in the BusinessOwner entity but are missing from the database schema

-- Add missing columns to business_owner table
ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS shop_id VARCHAR(9) UNIQUE;

ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS is_defaulter BOOLEAN DEFAULT FALSE;

ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS defaulter_since TIMESTAMP;

ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS upi_id VARCHAR(50);

ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12, 2) DEFAULT 0;

ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS vendor_status VARCHAR(50) DEFAULT 'HOLD_ACCOUNT';

-- Add constraint for vendor_status enum
ALTER TABLE business_owner
DROP CONSTRAINT IF EXISTS business_owner_vendor_status_check;

ALTER TABLE business_owner
ADD CONSTRAINT business_owner_vendor_status_check
CHECK (vendor_status IN ('HOLD_ACCOUNT', 'ACTIVE', 'SUSPENDED', 'TERMINATED'));

-- Add indexes for the new columns (after columns are added)
CREATE INDEX IF NOT EXISTS idx_business_owner_shop_id ON business_owner(shop_id);
CREATE INDEX IF NOT EXISTS idx_business_owner_is_active ON business_owner(is_active);
CREATE INDEX IF NOT EXISTS idx_business_owner_is_defaulter ON business_owner(is_defaulter);
CREATE INDEX IF NOT EXISTS idx_business_owner_vendor_status ON business_owner(vendor_status);

-- Show completion message
SELECT 'Missing columns added to business_owner table successfully!' as status;

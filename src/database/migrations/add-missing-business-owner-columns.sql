-- Add missing columns to business_owner table

-- Add UPI ID column
ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS upi_id VARCHAR(50) NULL;

-- Add credit limit column
ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12,2) DEFAULT 0;

-- Add vendor_status column (enum type)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_status_enum') THEN
        CREATE TYPE vendor_status_enum AS ENUM ('HOLD_ACCOUNT', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');
    END IF;
END $$;

ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS vendor_status vendor_status_enum DEFAULT 'HOLD_ACCOUNT';

-- Add updated_at column if it doesn't exist
ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add is_active column to business_owner table
-- This column is needed for the BusinessOwner entity

ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_business_owner_is_active ON business_owner(is_active);

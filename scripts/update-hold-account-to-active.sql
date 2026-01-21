-- Check and update vendors with HOLD_ACCOUNT status to ACTIVE
-- This script will find all vendors with 'hold_account' status and update them to 'active'
-- Only admin should be able to change vendor status manually

-- First, let's see how many vendors have hold_account status
SELECT 
    id,
    shop_id,
    business_name,
    vendor_status,
    is_approved,
    is_active,
    created_at,
    updated_at
FROM business_owner 
WHERE vendor_status = 'hold_account'
ORDER BY created_at DESC;

-- Update all HOLD_ACCOUNT vendors to ACTIVE
UPDATE business_owner 
SET vendor_status = 'active',
    updated_at = CURRENT_TIMESTAMP
WHERE vendor_status = 'hold_account';

-- Verify the update
SELECT 
    vendor_status,
    COUNT(*) as count
FROM business_owner 
GROUP BY vendor_status
ORDER BY vendor_status;

-- Update all existing vendors to ACTIVE status
-- This ensures all vendor accounts remain active regardless of payment status

UPDATE business_owner 
SET vendor_status = 'active' 
WHERE vendor_status IN ('hold_account', 'inactive', 'suspended', 'services_hidden');

-- Verify the update
SELECT vendor_status, COUNT(*) as count 
FROM business_owner 
GROUP BY vendor_status 
ORDER BY vendor_status;

-- Find all due payments for this business owner
-- This will show you the correct due payment IDs to use

SELECT 
    id,
    business_owner_id,
    due_amount,
    paid_amount,
    remaining_amount,
    status,
    due_date,
    description,
    created_at
FROM vendor_due_payments 
WHERE business_owner_id = '18718212-c634-4ada-a8c7-a15f21dd7c73'
ORDER BY created_at DESC;

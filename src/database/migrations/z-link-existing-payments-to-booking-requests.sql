-- Migration: Link existing payment records to their booking requests
-- Purpose: Fix orphaned payments that weren't properly linked during creation
-- Date: 2025-10-31
-- Description: Updates booking_requests.payment_id to reference existing payment records

-- Step 1: Link existing payment records to their booking requests
UPDATE booking_requests br
SET payment_id = p.id
FROM payments p
WHERE p.booking_request_id = br.id
  AND br.payment_id IS NULL
  AND p.status = 'success';

-- Step 2: Verify the update (optional, for logging)
SELECT
  COUNT(*) as total_linked_payments,
  'Payments successfully linked to booking requests' as status
FROM booking_requests br
INNER JOIN payments p ON br.payment_id = p.id
WHERE p.status = 'SUCCESS';

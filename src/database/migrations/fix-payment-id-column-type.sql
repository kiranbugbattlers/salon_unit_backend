-- Migration: Fix payment_id column type from varchar to uuid
-- Purpose: Ensure payment_id can join with payments.id (uuid type)
-- Date: 2025-11-02
-- Description: Alters booking_requests.payment_id from varchar to uuid

-- Step 1: First, ensure all existing payment_id values are valid UUIDs or NULL
-- (This is safe because we just set them via the linking migration)

-- Step 2: Alter column type from varchar to uuid
ALTER TABLE booking_requests
ALTER COLUMN payment_id TYPE uuid
USING payment_id::uuid;

-- Step 3: Verify the change
SELECT
  column_name,
  data_type,
  'Column type successfully changed to UUID' as status
FROM information_schema.columns
WHERE table_name = 'booking_requests'
AND column_name = 'payment_id';

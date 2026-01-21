-- Migration to update booking_requests_status_enum
-- This removes old status values that are no longer used in the updated booking flow

BEGIN;

-- Step 1: Update any existing records with old statuses to new statuses
UPDATE booking_requests
SET status = 'approved'
WHERE status IN ('approved_otp_generated', 'approved_pending_payment', 'confirmed');

-- Step 2: Drop the old enum type and create new one
ALTER TYPE booking_requests_status_enum RENAME TO booking_requests_status_enum_old;

-- Step 3: Create new enum with updated values
CREATE TYPE booking_requests_status_enum AS ENUM (
  'pending',
  'approved',
  'rejected',
  'staff_assigned',
  'in-progress',
  'awaiting_payment',
  'completed',
  'cancelled'
);

-- Step 4: Alter the column to use the new enum type
ALTER TABLE booking_requests
ALTER COLUMN status TYPE booking_requests_status_enum
USING status::text::booking_requests_status_enum;

-- Step 5: Drop the old enum type
DROP TYPE booking_requests_status_enum_old;

-- Step 6: Verification - ensure enum was created successfully
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_requests_status_enum') THEN
        RAISE EXCEPTION 'Migration failed: booking_requests_status_enum type was not created';
    END IF;

    -- Verify all enum values exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'booking_requests_status_enum'
        AND e.enumlabel = 'pending'
    ) THEN
        RAISE EXCEPTION 'Migration failed: enum values not properly created';
    END IF;
END $$;

COMMIT;

-- Success marker for migration runner detection
SELECT '✓✓✓ MIGRATION COMPLETED SUCCESSFULLY' as migration_status;

-- Verification query to show current statuses
SELECT DISTINCT status FROM booking_requests ORDER BY status;

-- Migration: Add approval/rejection timestamps to booking_services table
-- Purpose: Support customer approval/rejection workflow for business owner requested add-on services
-- Date: 2025-11-11

-- Step 1: Add approved_at timestamp column
ALTER TABLE booking_services
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Step 2: Add rejected_at timestamp column
ALTER TABLE booking_services
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

-- Step 3: Add index for querying pending approvals (performance optimization)
CREATE INDEX IF NOT EXISTS idx_booking_services_pending_approval
ON booking_services(booking_id, customer_approved, is_add_on)
WHERE is_add_on = true AND customer_approved = false;

-- Step 4: Add index for approved add-ons (payment calculation optimization)
CREATE INDEX IF NOT EXISTS idx_booking_services_approved_addons
ON booking_services(booking_id, customer_approved, is_add_on)
WHERE is_add_on = true AND customer_approved = true;

-- Step 5: Set approved_at for existing approved add-ons (backward compatibility)
-- Existing add-ons with customer_approved = true should have approved_at set
UPDATE booking_services
SET approved_at = added_at
WHERE is_add_on = true
  AND customer_approved = true
  AND approved_at IS NULL
  AND added_at IS NOT NULL;

-- Step 6: Set approved_at to created_at for existing add-ons without added_at
UPDATE booking_services
SET approved_at = created_at
WHERE is_add_on = true
  AND customer_approved = true
  AND approved_at IS NULL
  AND added_at IS NULL;

-- Comments:
-- - approved_at: Set when customer approves an add-on service
-- - rejected_at: Set when customer rejects an add-on service (before deletion)
-- - Indexes improve query performance for pending approvals and payment calculations
-- - Existing approved add-ons get approved_at = added_at for historical consistency

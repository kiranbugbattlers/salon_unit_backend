-- Migration: Add approval timestamp columns to booking_services table
-- Date: 2025-11-11
-- Description: Adds approved_at and rejected_at columns for tracking add-on service approval/rejection

BEGIN;

-- ============================================
-- Add approval timestamp columns
-- ============================================

-- Add approved_at column
ALTER TABLE booking_services
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;

-- Add rejected_at column
ALTER TABLE booking_services
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP NULL;

-- ============================================
-- Add comments for documentation
-- ============================================

COMMENT ON COLUMN booking_services.approved_at IS 'Timestamp when customer approved the add-on service';
COMMENT ON COLUMN booking_services.rejected_at IS 'Timestamp when customer rejected the add-on service';

COMMIT;

-- Verification
SELECT
    'booking_services' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'booking_services'
AND column_name IN ('approved_at', 'rejected_at')
ORDER BY ordinal_position;

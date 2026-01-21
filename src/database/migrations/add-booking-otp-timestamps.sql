-- Migration: Add OTP verification and service timestamps to bookings table
-- Description: Adds optional timestamp fields to track OTP verification and service start/completion times
-- Date: 2025-01-15

-- Add OTP verified timestamp
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS otp_verified_at TIMESTAMP NULL;

-- Add service started timestamp
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS service_started_at TIMESTAMP NULL;

-- Add service completed timestamp
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS service_completed_at TIMESTAMP NULL;

-- Add comments for documentation
COMMENT ON COLUMN bookings.otp_verified_at IS 'Timestamp when OTP was verified by staff';
COMMENT ON COLUMN bookings.service_started_at IS 'Timestamp when service was actually started';
COMMENT ON COLUMN bookings.service_completed_at IS 'Timestamp when service was completed';

-- Create index for performance on service_started_at for analytics queries
CREATE INDEX IF NOT EXISTS idx_bookings_service_started_at
ON bookings(service_started_at)
WHERE service_started_at IS NOT NULL;

-- Create index for performance on service_completed_at for analytics queries
CREATE INDEX IF NOT EXISTS idx_bookings_service_completed_at
ON bookings(service_completed_at)
WHERE service_completed_at IS NOT NULL;

-- Migration: Add quantity column to booking_request_services table
-- Date: 2025-10-31
-- Description: Adds the missing 'quantity' column to track service quantities in booking requests

-- Add quantity column with default value
ALTER TABLE booking_request_services
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- Update any existing records to have quantity = 1 (in case column was added but data is missing)
UPDATE booking_request_services
SET quantity = 1
WHERE quantity IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN booking_request_services.quantity IS 'Quantity of this service requested (e.g., 2x haircut)';

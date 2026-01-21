-- Add timezone column to business_owner table
ALTER TABLE business_owner
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';

-- Add quantity column removal from booking_request_services
ALTER TABLE booking_request_services
DROP COLUMN IF EXISTS quantity;

-- Add unique constraint to prevent overlapping confirmed bookings for same staff
-- Note: This requires PostgreSQL GIST extension for range types
-- This constraint prevents overlapping time slots for the same staff member on the same date

-- First, ensure the GIST extension is available (this is typically included)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint for confirmed bookings
-- This prevents two bookings for the same staff at overlapping times
ALTER TABLE bookings
ADD CONSTRAINT bookings_no_staff_time_overlap
EXCLUDE USING gist (
  staff_id WITH =,
  appointment_date WITH =,
  tsrange(
    (appointment_date + start_time::time)::timestamp,
    (appointment_date + end_time::time)::timestamp
  ) WITH &&
)
WHERE (status IN ('confirmed', 'in-progress', 'pending'));

-- Add partial unique index for pending booking requests
-- This prevents multiple pending requests for the same staff at the same time
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_requests_unique_pending_staff_time
ON booking_requests (requested_staff_id, requested_date, requested_start_time, requested_end_time)
WHERE status = 'pending' AND requested_staff_id IS NOT NULL;

-- Add partial unique index for assigned staff in booking requests
-- This prevents conflicts when staff is assigned but not yet approved
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_requests_unique_assigned_staff_time
ON booking_requests (assigned_staff_id, requested_date, requested_start_time, requested_end_time)
WHERE status = 'pending' AND assigned_staff_id IS NOT NULL;

-- Add check constraint to ensure start_time < end_time
ALTER TABLE bookings
ADD CONSTRAINT bookings_start_before_end
CHECK (start_time < end_time);

ALTER TABLE booking_requests
ADD CONSTRAINT booking_requests_start_before_end
CHECK (requested_start_time < requested_end_time);

-- Add check constraint for valid booking statuses
ALTER TABLE bookings
ADD CONSTRAINT bookings_valid_status
CHECK (status IN ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled'));

ALTER TABLE booking_requests
ADD CONSTRAINT booking_requests_valid_status
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add index for better performance on time-based queries
CREATE INDEX IF NOT EXISTS idx_bookings_staff_date_time
ON bookings (staff_id, appointment_date, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_booking_requests_staff_date_time
ON booking_requests (requested_staff_id, requested_date, requested_start_time, requested_end_time);

CREATE INDEX IF NOT EXISTS idx_booking_requests_assigned_staff_date_time
ON booking_requests (assigned_staff_id, requested_date, requested_start_time, requested_end_time);

-- Add comments for documentation
COMMENT ON CONSTRAINT bookings_no_staff_time_overlap ON bookings IS
'Prevents overlapping bookings for the same staff member on the same date';

COMMENT ON INDEX idx_booking_requests_unique_pending_staff_time IS
'Ensures no duplicate pending requests for the same staff and time slot';

COMMENT ON INDEX idx_booking_requests_unique_assigned_staff_time IS
'Prevents conflicts when assigning staff to booking requests';
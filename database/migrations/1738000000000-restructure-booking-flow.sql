-- Migration: Restructure booking flow - Remove arrival OTP and simplify statuses
-- Date: 2024-01-27
-- Description: Remove arrival OTP fields, update status enum, prepare for new booking flow

-- Step 1: Update existing data - migrate intermediate statuses to 'approved'
UPDATE booking_requests
SET status = 'approved'
WHERE status IN ('approved_otp_generated', 'approved_pending_payment');

-- Step 2: Remove arrival OTP columns from booking_requests
ALTER TABLE booking_requests
  DROP COLUMN IF EXISTS arrival_otp,
  DROP COLUMN IF EXISTS arrival_otp_generated_at,
  DROP COLUMN IF EXISTS arrival_otp_verified_at;

-- Step 3: Add delivery-related columns to booking_requests
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS customer_address JSONB,
  ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_distance DECIMAL(5, 2);

-- Step 4: Add delivery-related columns to bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_address JSONB,
  ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_distance DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS payment_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS add_on_services_total DECIMAL(10, 2) DEFAULT 0;

-- Step 5: Create business_settings table for delivery charge configuration
CREATE TABLE IF NOT EXISTS business_settings (
  business_owner_id UUID PRIMARY KEY REFERENCES business_owners(id) ON DELETE CASCADE,
  delivery_charges_enabled BOOLEAN DEFAULT TRUE,
  base_delivery_charge DECIMAL(10, 2) DEFAULT 0,
  per_km_charge DECIMAL(10, 2) DEFAULT 10,
  free_delivery_upto_km DECIMAL(5, 2) DEFAULT 5,
  max_delivery_distance_km DECIMAL(5, 2) DEFAULT 20,
  free_delivery_above_amount DECIMAL(10, 2) DEFAULT 1000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 6: Create booking_services table to track original and add-on services
CREATE TABLE IF NOT EXISTS booking_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  business_service_id UUID NOT NULL REFERENCES business_services(id),
  service_id UUID NOT NULL REFERENCES services(id),
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INT NOT NULL,
  is_add_on BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP,
  added_by_staff_id UUID REFERENCES staff(id),
  customer_approved BOOLEAN DEFAULT TRUE,
  package_id UUID REFERENCES service_packages(id),
  package_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_requests_service_location ON booking_requests(service_location);
CREATE INDEX IF NOT EXISTS idx_booking_requests_delivery_charge ON booking_requests(delivery_charge) WHERE delivery_charge > 0;
CREATE INDEX IF NOT EXISTS idx_bookings_service_location ON bookings(service_location);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_completed ON bookings(payment_completed);
CREATE INDEX IF NOT EXISTS idx_booking_services_booking_id ON booking_services(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_services_is_add_on ON booking_services(is_add_on);
CREATE INDEX IF NOT EXISTS idx_business_settings_delivery_enabled ON business_settings(delivery_charges_enabled);

-- Step 8: Migrate existing bookings to booking_services table
-- Each existing booking gets one service record (the original service)
INSERT INTO booking_services (
  booking_id,
  business_service_id,
  service_id,
  price,
  duration_minutes,
  is_add_on,
  customer_approved
)
SELECT
  b.id as booking_id,
  b.service_id as business_service_id,
  s.id as service_id,
  b.total_amount as price,
  COALESCE(
    (SELECT custom_duration_minutes FROM business_services WHERE id = b.service_id),
    s.default_duration,
    60
  ) as duration_minutes,
  FALSE as is_add_on,
  TRUE as customer_approved
FROM bookings b
JOIN services s ON s.id = (SELECT service_id FROM business_services WHERE id = b.service_id)
WHERE NOT EXISTS (
  SELECT 1 FROM booking_services bs WHERE bs.booking_id = b.id
)
ON CONFLICT DO NOTHING;

-- Step 9: Add comments for documentation
COMMENT ON TABLE business_settings IS 'Business-specific settings for delivery charges and other configurations';
COMMENT ON TABLE booking_services IS 'Tracks all services (original and add-ons) associated with a booking';
COMMENT ON COLUMN booking_requests.customer_address IS 'Customer address for at-home services (JSONB format)';
COMMENT ON COLUMN booking_requests.delivery_charge IS 'Calculated delivery charge based on distance for at-home services';
COMMENT ON COLUMN booking_requests.delivery_distance IS 'Distance in kilometers from business to customer location';
COMMENT ON COLUMN bookings.payment_completed IS 'Flag indicating if payment has been completed (before service completion)';
COMMENT ON COLUMN bookings.add_on_services_total IS 'Total cost of add-on services added during service';
COMMENT ON COLUMN booking_services.is_add_on IS 'TRUE if service was added during IN_PROGRESS status, FALSE for original services';

-- Step 10: Create trigger to update business_settings updated_at
CREATE OR REPLACE FUNCTION update_business_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_settings_updated_at
  BEFORE UPDATE ON business_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_business_settings_updated_at();

-- Migration completed successfully

-- Migration: Create device_tokens table
-- Purpose: Store FCM device tokens for push notifications (customers, business owners, staff)
-- Date: 2025-11-12
-- Author: Firebase Push Notification Integration

-- Step 1: Create device_tokens table
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('customer', 'business_owner', 'staff', 'admin')),
  fcm_token VARCHAR(500) NOT NULL,
  device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
  device_info JSONB DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_fcm_token ON device_tokens(fcm_token);
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_type ON device_tokens(user_type);
CREATE INDEX IF NOT EXISTS idx_device_tokens_is_active ON device_tokens(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_active ON device_tokens(user_id, is_active) WHERE is_active = TRUE;

-- Step 3: Create unique constraint (one token per user per device)
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_tokens_user_fcm_unique ON device_tokens(user_id, fcm_token);

-- Step 4: Add comments for documentation
COMMENT ON TABLE device_tokens IS 'Stores FCM device tokens for push notifications to customers, business owners, staff, and admins';
COMMENT ON COLUMN device_tokens.user_id IS 'Reference to the user who owns this device';
COMMENT ON COLUMN device_tokens.user_type IS 'Type of user: customer, business_owner, staff, or admin';
COMMENT ON COLUMN device_tokens.fcm_token IS 'Firebase Cloud Messaging token from the device (max 500 characters)';
COMMENT ON COLUMN device_tokens.device_type IS 'Device platform: ios, android, or web';
COMMENT ON COLUMN device_tokens.device_info IS 'Optional device metadata (model, OS version, app version, device name)';
COMMENT ON COLUMN device_tokens.is_active IS 'Whether this token is still valid and active';
COMMENT ON COLUMN device_tokens.last_used_at IS 'Last time this token was used to send a notification';
COMMENT ON COLUMN device_tokens.created_at IS 'When the token was first registered';
COMMENT ON COLUMN device_tokens.updated_at IS 'Last time the token record was updated';

-- Step 5: Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_device_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER device_tokens_updated_at
  BEFORE UPDATE ON device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_device_tokens_updated_at();

-- Step 6: Verify table creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'device_tokens'
  ) THEN
    RAISE EXCEPTION 'Migration failed: device_tokens table was not created';
  END IF;

  RAISE NOTICE 'device_tokens table created successfully';
END $$;

-- Success marker for migration runner detection
SELECT '✓✓✓ MIGRATION COMPLETED SUCCESSFULLY - device_tokens table created' as migration_status;

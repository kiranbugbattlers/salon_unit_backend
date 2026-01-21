-- Migration: Create notification_logs table
-- Purpose: Track all push notifications sent to users (customers, business owners, staff)
-- Date: 2025-11-12
-- Author: Firebase Push Notification Integration

-- Step 1: Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('customer', 'business_owner', 'staff', 'admin')),
  notification_type VARCHAR(100) NOT NULL CHECK (notification_type IN (
    -- Booking Request Flow
    'booking_request_created',
    'booking_request_staff_assigned',
    'booking_request_approved',
    'booking_request_rejected',
    'booking_request_cancelled_by_customer',
    -- Service Execution Flow
    'service_otp_sent',
    'service_started',
    'service_completed',
    'service_reminder',
    -- Add-On Services Flow
    'addon_service_pending_approval',
    'addon_service_approved_by_customer',
    'addon_service_rejected_by_customer',
    'addon_service_added_by_customer',
    -- Booking Management
    'booking_rescheduled',
    'booking_cancelled',
    'booking_updated',
    -- Payment Flow
    'payment_completed',
    'payment_cod_confirmed',
    'payment_failed',
    'payment_reminder',
    'refund_processed',
    -- Delivery & Location
    'delivery_charge_calculated',
    -- Business Approval
    'business_approved',
    'business_rejected',
    -- Staff Management
    'staff_assigned',
    'schedule_changed',
    -- General
    'promotional',
    'system_update',
    'custom'
  )),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('sent', 'delivered', 'failed', 'pending')),
  fcm_response JSONB DEFAULT NULL,
  fcm_tokens TEXT[] DEFAULT NULL,
  sent_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_type ON notification_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_type ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);

-- Step 3: Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_created ON notification_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type_created ON notification_logs(notification_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_type_status ON notification_logs(user_id, user_type, status);

-- Step 4: Add comments for documentation
COMMENT ON TABLE notification_logs IS 'Tracks all push notifications sent via Firebase Cloud Messaging';
COMMENT ON COLUMN notification_logs.user_id IS 'Reference to the user who received the notification';
COMMENT ON COLUMN notification_logs.user_type IS 'Type of user: customer, business_owner, staff, or admin';
COMMENT ON COLUMN notification_logs.notification_type IS 'Type/category of notification for filtering and analytics';
COMMENT ON COLUMN notification_logs.title IS 'Notification title displayed to the user';
COMMENT ON COLUMN notification_logs.body IS 'Notification message body';
COMMENT ON COLUMN notification_logs.data IS 'Additional metadata and payload sent with the notification';
COMMENT ON COLUMN notification_logs.status IS 'Delivery status: sent, delivered, failed, or pending';
COMMENT ON COLUMN notification_logs.fcm_response IS 'Response from Firebase Cloud Messaging (message ID, errors, counts)';
COMMENT ON COLUMN notification_logs.fcm_tokens IS 'Array of FCM tokens that were used to send this notification';
COMMENT ON COLUMN notification_logs.sent_at IS 'Timestamp when the notification was sent to FCM';
COMMENT ON COLUMN notification_logs.created_at IS 'When the notification log entry was created';

-- Step 5: Verify table creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'notification_logs'
  ) THEN
    RAISE EXCEPTION 'Migration failed: notification_logs table was not created';
  END IF;

  RAISE NOTICE 'notification_logs table created successfully';
END $$;

-- Success marker for migration runner detection
SELECT '✓✓✓ MIGRATION COMPLETED SUCCESSFULLY - notification_logs table created' as migration_status;

-- Migration: Create scheduled_notifications table
-- Description: Store scheduled reminder notifications for bookings
-- Created: 2025-01-12

-- Create enum types for scheduled notifications
DO $$ BEGIN
    CREATE TYPE scheduled_notification_status AS ENUM ('pending', 'sent', 'cancelled', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_type AS ENUM ('24h', '2h');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create scheduled_notifications table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_type user_type NOT NULL,
    notification_type notification_type NOT NULL,
    reminder_type reminder_type NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status scheduled_notification_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    attempts INT NOT NULL DEFAULT 0,
    notification_data JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_scheduled_notifications_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_scheduled_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT unique_booking_user_reminder UNIQUE(booking_id, user_id, reminder_type),
    CONSTRAINT check_scheduled_for_future CHECK (scheduled_for > created_at)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for_status
    ON scheduled_notifications(scheduled_for, status)
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_booking_reminder
    ON scheduled_notifications(booking_id, reminder_type);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user
    ON scheduled_notifications(user_id, status);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_created_at
    ON scheduled_notifications(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE scheduled_notifications IS 'Stores scheduled reminder notifications for bookings (24h and 2h before appointment)';
COMMENT ON COLUMN scheduled_notifications.booking_id IS 'Reference to the booking this notification is for';
COMMENT ON COLUMN scheduled_notifications.reminder_type IS 'Type of reminder: 24h or 2h before appointment';
COMMENT ON COLUMN scheduled_notifications.scheduled_for IS 'When to send the notification (24h or 2h before appointment time)';
COMMENT ON COLUMN scheduled_notifications.status IS 'Current status of the scheduled notification';
COMMENT ON COLUMN scheduled_notifications.attempts IS 'Number of send attempts made';
COMMENT ON COLUMN scheduled_notifications.notification_data IS 'Additional data to include in the notification payload';

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_scheduled_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scheduled_notifications_updated_at
    BEFORE UPDATE ON scheduled_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_scheduled_notifications_updated_at();

-- Verify table creation
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'scheduled_notifications';

    IF table_count = 1 THEN
        RAISE NOTICE '✓ scheduled_notifications table created successfully';
    ELSE
        RAISE EXCEPTION '✗ Failed to create scheduled_notifications table';
    END IF;
END $$;

-- Migration completed
SELECT 'Migration 1731398400002-create-scheduled-notifications-table.sql completed successfully' AS status;

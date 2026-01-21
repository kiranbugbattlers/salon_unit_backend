-- Migration: Add retry fields to notification_logs table
-- Description: Add retry mechanism fields for failed notification handling
-- Created: 2025-01-12

-- Add retry-related columns to notification_logs
ALTER TABLE notification_logs
ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retries INT NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS retry_error TEXT;

-- Create index for retry queue processing
CREATE INDEX IF NOT EXISTS idx_notification_logs_retry_queue
    ON notification_logs(next_retry_at, status, retry_count)
    WHERE status = 'failed' AND retry_count < max_retries AND next_retry_at IS NOT NULL;

-- Create index for failed notifications needing retry
CREATE INDEX IF NOT EXISTS idx_notification_logs_failed_status
    ON notification_logs(status, created_at DESC)
    WHERE status = 'failed';

-- Add comments for documentation
COMMENT ON COLUMN notification_logs.retry_count IS 'Number of retry attempts made for failed notifications';
COMMENT ON COLUMN notification_logs.max_retries IS 'Maximum number of retry attempts allowed (default: 5)';
COMMENT ON COLUMN notification_logs.next_retry_at IS 'Scheduled time for next retry attempt (exponential backoff)';
COMMENT ON COLUMN notification_logs.last_retry_at IS 'Timestamp of last retry attempt';
COMMENT ON COLUMN notification_logs.retry_error IS 'Error message from last retry attempt';

-- Verify migration
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'notification_logs'
    AND column_name IN ('retry_count', 'max_retries', 'next_retry_at', 'last_retry_at', 'retry_error');

    IF column_count = 5 THEN
        RAISE NOTICE '✓ Retry fields added to notification_logs table successfully';
    ELSE
        RAISE EXCEPTION '✗ Failed to add retry fields to notification_logs table';
    END IF;
END $$;

-- Migration completed
SELECT 'Migration 1731398400003-add-retry-fields-to-notification-logs.sql completed successfully' AS status;

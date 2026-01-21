-- Migration: Fix staff_breaks table schema
-- Date: 2025-11-10
-- Description: Recreates staff_breaks table to match TypeORM entity definition

BEGIN;

-- Drop the existing staff_breaks table (no data to preserve)
DROP TABLE IF EXISTS staff_breaks CASCADE;

-- Ensure enum type exists (should already exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_breaks_break_type_enum') THEN
        CREATE TYPE staff_breaks_break_type_enum AS ENUM ('lunch', 'short_break', 'other');
    END IF;
END $$;

-- Recreate staff_breaks table with correct schema
CREATE TABLE staff_breaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_type staff_breaks_break_type_enum NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_staff_breaks_staff_id_day_active
ON staff_breaks(staff_id, day_of_week, is_active);

CREATE INDEX idx_staff_breaks_day_of_week
ON staff_breaks(day_of_week);

CREATE INDEX idx_staff_breaks_is_active
ON staff_breaks(is_active);

-- Add comments for documentation
COMMENT ON TABLE staff_breaks IS 'Staff break schedules including lunch and short breaks';
COMMENT ON COLUMN staff_breaks.day_of_week IS 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)';
COMMENT ON COLUMN staff_breaks.break_type IS 'Type of break: lunch, short_break, or other';
COMMENT ON COLUMN staff_breaks.is_recurring IS 'Whether this break recurs weekly';
COMMENT ON COLUMN staff_breaks.effective_from IS 'Date from which this break is effective';
COMMENT ON COLUMN staff_breaks.effective_to IS 'Date until which this break is effective';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_staff_breaks_updated_at ON staff_breaks;
CREATE TRIGGER update_staff_breaks_updated_at
    BEFORE UPDATE ON staff_breaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Verification
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'staff_breaks'
ORDER BY ordinal_position;

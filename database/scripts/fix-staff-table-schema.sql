-- Migration: Fix staff table schema to match TypeORM entity
-- Date: 2025-11-10
-- Description: Removes unused columns and fixes gender column type

BEGIN;

-- ============================================
-- 1. Remove unused columns from staff table
-- ============================================

-- Drop is_verified column (not in entity)
ALTER TABLE staff DROP COLUMN IF EXISTS is_verified;

-- Drop verified_at column (not in entity)
ALTER TABLE staff DROP COLUMN IF EXISTS verified_at;

-- ============================================
-- 2. Fix gender column type
-- ============================================

-- Create gender enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
        CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
    END IF;
END $$;

-- Add 'prefer_not_to_say' value if enum already exists
ALTER TYPE gender_enum ADD VALUE IF NOT EXISTS 'prefer_not_to_say';

-- Convert gender column from VARCHAR to ENUM
-- First, check if column is not already an enum
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'staff'
        AND column_name = 'gender'
        AND data_type = 'character varying'
    ) THEN
        -- Alter column type using USING clause to convert values
        ALTER TABLE staff
        ALTER COLUMN gender TYPE gender_enum
        USING gender::gender_enum;
    END IF;
END $$;

-- Ensure gender column is NOT NULL
ALTER TABLE staff ALTER COLUMN gender SET NOT NULL;

COMMIT;

-- Verification
SELECT
    'staff' as table_name,
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'staff'
ORDER BY ordinal_position;

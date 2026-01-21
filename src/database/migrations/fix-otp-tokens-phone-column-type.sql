-- Fix OTP Tokens Phone Column Type
-- The phone column was incorrectly created as UUID instead of VARCHAR
-- This migration converts it to VARCHAR(15) to store phone numbers correctly

BEGIN;

-- Step 1: Check if phone column exists and is UUID type
DO $$
DECLARE
    phone_column_type text;
BEGIN
    -- Get current column type
    SELECT udt_name INTO phone_column_type
    FROM information_schema.columns
    WHERE table_name = 'otp_tokens' AND column_name = 'phone';

    RAISE NOTICE 'Current phone column type: %', COALESCE(phone_column_type, 'NOT FOUND');

    IF phone_column_type = 'uuid' THEN
        RAISE NOTICE '⚠️  Phone column is UUID type - needs conversion';
    ELSIF phone_column_type = 'varchar' THEN
        RAISE NOTICE '✓ Phone column is already VARCHAR type';
    END IF;
END $$;

-- Step 2: Convert UUID to VARCHAR (safe conversion)
DO $$
DECLARE
    phone_column_type text;
BEGIN
    -- Get current column type
    SELECT udt_name INTO phone_column_type
    FROM information_schema.columns
    WHERE table_name = 'otp_tokens' AND column_name = 'phone';

    IF phone_column_type = 'uuid' THEN
        -- Convert UUID to VARCHAR
        -- First, change type to TEXT (allows any UUID value)
        ALTER TABLE otp_tokens ALTER COLUMN phone TYPE VARCHAR(15) USING phone::text;
        
        RAISE NOTICE '✓ Converted phone column from UUID to VARCHAR(15)';
    ELSE
        RAISE NOTICE '⚠️  Phone column is already VARCHAR or TEXT type, no conversion needed';
    END IF;
END $$;

-- Step 3: Verify the change
DO $$
DECLARE
    result_type text;
    result_length integer;
BEGIN
    SELECT udt_name, character_maximum_length 
    INTO result_type, result_length
    FROM information_schema.columns
    WHERE table_name = 'otp_tokens' AND column_name = 'phone';

    IF result_type = 'varchar' AND result_length = 15 THEN
        RAISE NOTICE '✓✓✓ MIGRATION SUCCESSFUL ✓✓✓';
        RAISE NOTICE '    Phone column type: VARCHAR(15)';
    ELSE
        RAISE WARNING '⚠ Migration may have issues. Type: %, Length: %', result_type, result_length;
    END IF;
END $$;

COMMIT;

-- Verification query (run manually if needed)
/*
SELECT 
    column_name,
    udt_name as data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'otp_tokens' AND column_name = 'phone';
*/


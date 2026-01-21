-- Fix settlement_month column length from VARCHAR(7) to VARCHAR(10)
-- This fixes the "value too long for type character varying(7)" error

DO $$
BEGIN
    -- Check if the column exists and has the old length
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'monthly_settlements' 
        AND column_name = 'settlement_month' 
        AND character_maximum_length = 7
    ) THEN
        -- Alter the column to increase length
        ALTER TABLE monthly_settlements 
        ALTER COLUMN settlement_month TYPE VARCHAR(10);
        
        RAISE NOTICE 'settlement_month column length increased from VARCHAR(7) to VARCHAR(10)';
    ELSE
        RAISE NOTICE 'settlement_month column already has correct length or does not exist';
    END IF;
END $$;

-- Add comment to document the expected format
COMMENT ON COLUMN monthly_settlements.settlement_month IS 'Settlement month in YYYY-MM format (e.g., 2024-01)';

-- Fix settlement_date null values in daily_settlements table
-- First, update any existing null settlement_date values to a default date
-- We'll use the created_at date as a fallback, or current date if that's also null

UPDATE daily_settlements 
SET settlement_date = COALESCE(
    DATE(created_at), 
    CURRENT_DATE
) 
WHERE settlement_date IS NULL;

-- Now make the column NOT NULL (this should work since all nulls are now filled)
ALTER TABLE daily_settlements 
ALTER COLUMN settlement_date SET NOT NULL;

-- Migration to add shopId column to business_owner table
-- Add unique shop identifier to all business owners
-- Format: SH-<6CHAR_ALPHANUMERIC>

BEGIN;

-- Add shop_id column to business_owner table
ALTER TABLE business_owner
ADD COLUMN IF NOT EXISTS shop_id VARCHAR(9) UNIQUE;

-- Create unique index on shop_id for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_owner_shop_id ON business_owner(shop_id);

-- Function to generate random shop ID
CREATE OR REPLACE FUNCTION generate_shop_id()
RETURNS TEXT AS $$
DECLARE
    characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := 'SH-';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(characters, floor(random() * length(characters) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique shop ID (with collision handling)
CREATE OR REPLACE FUNCTION generate_unique_shop_id()
RETURNS TEXT AS $$
DECLARE
    new_shop_id TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        new_shop_id := generate_shop_id();

        -- Check if this shop_id already exists
        IF NOT EXISTS (SELECT 1 FROM business_owner WHERE shop_id = new_shop_id) THEN
            RETURN new_shop_id;
        END IF;

        counter := counter + 1;

        -- Safety check to prevent infinite loop
        IF counter > 100 THEN
            RAISE EXCEPTION 'Failed to generate unique shop_id after 100 attempts';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing business_owner records with unique shop_ids
UPDATE business_owner
SET shop_id = generate_unique_shop_id()
WHERE shop_id IS NULL;

-- Make shop_id NOT NULL after populating existing records
ALTER TABLE business_owner
ALTER COLUMN shop_id SET NOT NULL;

-- Remove the gender column if it exists (cleanup from previous requirements)
ALTER TABLE business_owner
DROP COLUMN IF EXISTS gender;

COMMIT;

-- Cleanup functions (optional - remove after migration)
-- DROP FUNCTION IF EXISTS generate_shop_id();
-- DROP FUNCTION IF EXISTS generate_unique_shop_id();
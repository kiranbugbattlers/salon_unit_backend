-- Migration: Create Customer Favorites Table
-- Purpose: Allow customers to save/favorite businesses for later viewing
-- Date: 2025-01-13

-- Step 1: Create customer_favorites table
CREATE TABLE IF NOT EXISTS customer_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  business_owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key constraints with CASCADE delete
  CONSTRAINT fk_customer_favorites_customer
    FOREIGN KEY (customer_id)
    REFERENCES customers(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_customer_favorites_business_owner
    FOREIGN KEY (business_owner_id)
    REFERENCES business_owner(id)
    ON DELETE CASCADE,

  -- Ensure a customer can only favorite a business once
  CONSTRAINT uq_customer_business_favorite
    UNIQUE (customer_id, business_owner_id)
);

-- Step 2: Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_customer_favorites_customer_id
  ON customer_favorites(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_favorites_business_owner_id
  ON customer_favorites(business_owner_id);

CREATE INDEX IF NOT EXISTS idx_customer_favorites_created_at
  ON customer_favorites(created_at DESC);

-- Step 3: Create trigger function for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to call the function
DROP TRIGGER IF EXISTS trg_update_customer_favorites_updated_at ON customer_favorites;
CREATE TRIGGER trg_update_customer_favorites_updated_at
  BEFORE UPDATE ON customer_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_favorites_updated_at();

-- Step 5: Verify table creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'customer_favorites'
  ) THEN
    RAISE EXCEPTION 'Migration failed: customer_favorites table was not created';
  END IF;

  -- Verify unique constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'uq_customer_business_favorite'
    AND table_name = 'customer_favorites'
  ) THEN
    RAISE EXCEPTION 'Migration failed: unique constraint uq_customer_business_favorite was not created';
  END IF;

  RAISE NOTICE 'Migration successful: customer_favorites table created with all constraints and indexes';
END $$;

-- Migration completed successfully

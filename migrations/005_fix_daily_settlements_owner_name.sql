-- Migration: Fix null values in daily_settlements table
-- Date: 2026-01-08
-- Description: Update null values by joining with business_owners and business tables

-- Update null settlement_date values - use current date as default
UPDATE daily_settlements 
SET settlement_date = CURRENT_DATE
WHERE settlement_date IS NULL;

-- Update null owner_name values by joining with business_owners table
UPDATE daily_settlements ds
SET owner_name = bo.first_name || ' ' || COALESCE(bo.last_name, '')
FROM business_owners bo
WHERE ds.business_owner_id = bo.id 
  AND ds.owner_name IS NULL;

-- Update null salon_name values by joining with business table
UPDATE daily_settlements ds
SET salon_name = b.name
FROM business b
WHERE ds.business_owner_id = b.business_owner_id 
  AND ds.salon_name IS NULL;

-- Update null mobile_number values by joining with business_owners table
UPDATE daily_settlements ds
SET mobile_number = bo.mobile_number
FROM business_owners bo
WHERE ds.business_owner_id = bo.id 
  AND ds.mobile_number IS NULL;

-- Update null address values by joining with business table
UPDATE daily_settlements ds
SET address = COALESCE(b.address_line_1 || ', ' || b.address_line_2 || ', ' || b.city || ', ' || b.state || ' ' || b.pincode, 'Address not available')
FROM business b
WHERE ds.business_owner_id = b.business_owner_id 
  AND ds.address IS NULL;

-- If there are still null values (orphaned records), set default values
UPDATE daily_settlements 
SET settlement_date = CURRENT_DATE
WHERE settlement_date IS NULL;

UPDATE daily_settlements 
SET owner_name = 'Unknown Owner'
WHERE owner_name IS NULL;

UPDATE daily_settlements 
SET salon_name = 'Unknown Salon'
WHERE salon_name IS NULL;

UPDATE daily_settlements 
SET mobile_number = '0000000000'
WHERE mobile_number IS NULL;

UPDATE daily_settlements 
SET address = 'Address not available'
WHERE address IS NULL;

-- Add comments to document the fix
COMMENT ON COLUMN daily_settlements.settlement_date IS 'Settlement date - defaults to current date if null';
COMMENT ON COLUMN daily_settlements.owner_name IS 'Owner full name - populated from business_owners table';
COMMENT ON COLUMN daily_settlements.salon_name IS 'Salon/Business name - populated from business table';
COMMENT ON COLUMN daily_settlements.mobile_number IS 'Mobile number - populated from business_owners table';
COMMENT ON COLUMN daily_settlements.address IS 'Full address - populated from business table';

-- Add onboarding_id column to customers table
-- This column is needed for the OneToOne relationship with customer_onboarding table

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS onboarding_id UUID NULL;

-- Add foreign key constraint to reference customer_onboarding table
ALTER TABLE customers 
ADD CONSTRAINT IF NOT EXISTS fk_customers_onboarding 
FOREIGN KEY (onboarding_id) 
REFERENCES customer_onboarding(id) 
ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_customers_onboarding_id ON customers(onboarding_id);

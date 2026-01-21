-- Add credit limit to business_owner table
ALTER TABLE business_owner 
ADD COLUMN credit_limit DECIMAL(12,2) DEFAULT 0;

-- Add admin remarks to business_approvals table
ALTER TABLE business_approvals 
ADD COLUMN admin_remarks TEXT;

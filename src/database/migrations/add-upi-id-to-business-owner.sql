-- Add UPI ID column to business_owner table
ALTER TABLE business_owner 
ADD COLUMN upi_id VARCHAR(50);

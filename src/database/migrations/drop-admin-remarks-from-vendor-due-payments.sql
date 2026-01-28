-- Drop admin_remarks column from vendor_due_payments table
ALTER TABLE "vendor_due_payments" 
DROP COLUMN IF EXISTS "admin_remarks";

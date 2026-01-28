-- Add remark and alternate_number columns to business_owner table
ALTER TABLE "business_owner" 
ADD COLUMN IF NOT EXISTS "remark" TEXT,
ADD COLUMN IF NOT EXISTS "alternate_number" VARCHAR(20);

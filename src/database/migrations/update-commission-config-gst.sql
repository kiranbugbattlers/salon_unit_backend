-- Update commission config table: Replace customer_reward_percent with gst_percent
-- First, drop the old column
ALTER TABLE "commission_configs" DROP COLUMN IF EXISTS "customer_reward_percent";

-- Then add the new GST column
ALTER TABLE "commission_configs" 
ADD COLUMN "gst_percent" DECIMAL(5,2) DEFAULT 0;

-- Update commission transaction table: Replace customer reward fields with GST fields
-- First, drop the old columns
ALTER TABLE "commission_transactions" DROP COLUMN IF EXISTS "customer_reward_percent";
ALTER TABLE "commission_transactions" DROP COLUMN IF EXISTS "customer_reward_amount";

-- Then add the new GST columns
ALTER TABLE "commission_transactions" 
ADD COLUMN "gst_percent" DECIMAL(5,2) DEFAULT 0,
ADD COLUMN "gst_amount" DECIMAL(10,2) DEFAULT 0;

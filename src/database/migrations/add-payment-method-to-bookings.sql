-- Add payment_method and commission_transaction_id columns to bookings table
-- These columns support COD payment tracking and commission linkage

-- Create enum type for payment method if it doesn't exist
DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM ('online', 'cod');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add payment_method column to track payment type (online/cod)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_method payment_method_type DEFAULT 'online';

-- Add commission_transaction_id column to link to commission transactions
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS commission_transaction_id UUID NULL;

-- Add foreign key constraint for commission_transaction_id if not exists
DO $$ BEGIN
    ALTER TABLE bookings
    ADD CONSTRAINT fk_bookings_commission_transaction
    FOREIGN KEY (commission_transaction_id)
    REFERENCES commission_transactions(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add index for commission_transaction_id for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_commission_transaction_id
ON bookings(commission_transaction_id)
WHERE commission_transaction_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN bookings.payment_method IS 'Payment method used for the booking (online/cod)';
COMMENT ON COLUMN bookings.commission_transaction_id IS 'Reference to commission transaction for this booking';

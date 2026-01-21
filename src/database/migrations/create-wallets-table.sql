-- Create wallets table for customer and business owner wallet management

-- Create enum type for wallet user type
DO $$ BEGIN
    CREATE TYPE wallet_user_type AS ENUM ('customer', 'business_owner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_type wallet_user_type NOT NULL,
    balance NUMERIC(12,2) DEFAULT 0 NOT NULL,
    total_earned NUMERIC(12,2) DEFAULT 0 NOT NULL,
    total_spent NUMERIC(12,2) DEFAULT 0 NOT NULL,
    total_commission_paid NUMERIC(12,2) DEFAULT 0 NOT NULL,
    total_commission_received NUMERIC(12,2) DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_transaction_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

    -- Foreign key to users table
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create unique index on user_id and user_type (one wallet per user per type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_id_user_type
ON wallets(user_id, user_type);

-- Create index on user_type and is_active for efficient queries
CREATE INDEX IF NOT EXISTS idx_wallets_user_type_is_active
ON wallets(user_type, is_active)
WHERE is_active = true;

-- Create index on user_type for filtering
CREATE INDEX IF NOT EXISTS idx_wallets_user_type
ON wallets(user_type);

-- Add comments for documentation
COMMENT ON TABLE wallets IS 'Wallet accounts for customers and business owners';
COMMENT ON COLUMN wallets.user_id IS 'Reference to users table';
COMMENT ON COLUMN wallets.user_type IS 'Type of user: customer or business_owner';
COMMENT ON COLUMN wallets.balance IS 'Current wallet balance in INR';
COMMENT ON COLUMN wallets.total_earned IS 'Total amount earned (lifetime credits)';
COMMENT ON COLUMN wallets.total_spent IS 'Total amount spent (lifetime debits)';
COMMENT ON COLUMN wallets.total_commission_paid IS 'Total commission paid by business owner to company';
COMMENT ON COLUMN wallets.total_commission_received IS 'Total commission/rewards received by customer from company';
COMMENT ON COLUMN wallets.is_active IS 'Whether wallet is active';
COMMENT ON COLUMN wallets.last_transaction_at IS 'Timestamp of last wallet transaction';

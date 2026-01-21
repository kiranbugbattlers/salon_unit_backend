-- Create wallet_transactions table for tracking all wallet activity

-- Create enum types
DO $$ BEGIN
    CREATE TYPE wallet_transaction_type AS ENUM ('credit', 'debit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wallet_transaction_category AS ENUM (
        'booking_payment',
        'commission',
        'commission_payment',
        'settlement',
        'reward_points',
        'refund',
        'adjustment',
        'withdrawal'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wallet_transaction_status AS ENUM ('pending', 'completed', 'failed', 'reversed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL,
    type wallet_transaction_type NOT NULL,
    category wallet_transaction_category NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    balance_before NUMERIC(12,2) NOT NULL,
    balance_after NUMERIC(12,2) NOT NULL,
    booking_id UUID NULL,
    payment_id UUID NULL,
    settlement_id UUID NULL,
    description TEXT NOT NULL,
    metadata JSONB NULL,
    status wallet_transaction_status DEFAULT 'completed' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,

    -- Foreign keys
    CONSTRAINT fk_wallet_transactions_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    CONSTRAINT fk_wallet_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    CONSTRAINT fk_wallet_transactions_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    CONSTRAINT fk_wallet_transactions_settlement FOREIGN KEY (settlement_id) REFERENCES monthly_settlements(id) ON DELETE SET NULL
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id_created_at
ON wallet_transactions(wallet_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type_category
ON wallet_transactions(type, category);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_booking_id
ON wallet_transactions(booking_id)
WHERE booking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_payment_id
ON wallet_transactions(payment_id)
WHERE payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_settlement_id
ON wallet_transactions(settlement_id)
WHERE settlement_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status
ON wallet_transactions(status);

-- Add comments for documentation
COMMENT ON TABLE wallet_transactions IS 'All wallet transactions for customers and business owners';
COMMENT ON COLUMN wallet_transactions.wallet_id IS 'Reference to wallets table';
COMMENT ON COLUMN wallet_transactions.type IS 'Transaction type: credit or debit';
COMMENT ON COLUMN wallet_transactions.category IS 'Transaction category for classification';
COMMENT ON COLUMN wallet_transactions.amount IS 'Transaction amount in INR';
COMMENT ON COLUMN wallet_transactions.balance_before IS 'Wallet balance before transaction';
COMMENT ON COLUMN wallet_transactions.balance_after IS 'Wallet balance after transaction';
COMMENT ON COLUMN wallet_transactions.description IS 'Human-readable transaction description';
COMMENT ON COLUMN wallet_transactions.metadata IS 'Additional transaction metadata in JSON format';
COMMENT ON COLUMN wallet_transactions.status IS 'Transaction status';

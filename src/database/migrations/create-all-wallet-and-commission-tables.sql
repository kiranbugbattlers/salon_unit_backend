-- Comprehensive migration for all wallet, commission, and reward systems
-- Run this migration if deploying to a fresh database

-- ============================================
-- ENUMS
-- ============================================

-- Wallet enums
DO $$ BEGIN CREATE TYPE wallet_user_type AS ENUM ('customer', 'business_owner'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE wallet_transaction_type AS ENUM ('credit', 'debit'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE wallet_transaction_category AS ENUM ('booking_payment', 'commission', 'commission_payment', 'settlement', 'reward_points', 'refund', 'adjustment', 'withdrawal'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE wallet_transaction_status AS ENUM ('pending', 'completed', 'failed', 'reversed'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Commission enums
DO $$ BEGIN CREATE TYPE commission_transaction_status AS ENUM ('calculated', 'applied', 'reversed', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE commission_payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Settlement enums
DO $$ BEGIN CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'requires_payment'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Reward enums
DO $$ BEGIN CREATE TYPE reward_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Payment method enum
DO $$ BEGIN CREATE TYPE payment_method_type AS ENUM ('online', 'cod'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- COD transaction enum
DO $$ BEGIN CREATE TYPE cod_transaction_status AS ENUM ('pending', 'settled', 'disputed'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================
-- TABLE MODIFICATIONS
-- ============================================

-- Add defaulter columns to business_owner
ALTER TABLE business_owner ADD COLUMN IF NOT EXISTS is_defaulter BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE business_owner ADD COLUMN IF NOT EXISTS defaulter_since TIMESTAMP NULL;
CREATE INDEX IF NOT EXISTS idx_business_owner_is_defaulter ON business_owner(is_defaulter) WHERE is_defaulter = true;

-- Add payment method and commission tracking to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method payment_method_type DEFAULT 'online';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_transaction_id UUID NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_commission_transaction_id ON bookings(commission_transaction_id) WHERE commission_transaction_id IS NOT NULL;

-- Make razorpay_order_id nullable in payments (for COD payments)
ALTER TABLE payments ALTER COLUMN razorpay_order_id DROP NOT NULL;

-- ============================================
-- NEW TABLES
-- ============================================

-- Wallets table
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
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_id_user_type ON wallets(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_wallets_user_type_is_active ON wallets(user_type, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_wallets_user_type ON wallets(user_type);

-- Wallet transactions table
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
    CONSTRAINT fk_wallet_transactions_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    CONSTRAINT fk_wallet_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    CONSTRAINT fk_wallet_transactions_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id_created_at ON wallet_transactions(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type_category ON wallet_transactions(type, category);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_booking_id ON wallet_transactions(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_payment_id ON wallet_transactions(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);

-- Commission configs table
CREATE TABLE IF NOT EXISTS commission_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_owner_commission_percent NUMERIC(5,2) DEFAULT 0 NOT NULL,
    customer_reward_percent NUMERIC(5,2) DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    effective_from DATE NOT NULL,
    effective_until DATE NULL,
    created_by_admin_id UUID NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_commission_configs_admin FOREIGN KEY (created_by_admin_id) REFERENCES admins(id)
);
CREATE INDEX IF NOT EXISTS idx_commission_configs_active_dates ON commission_configs(is_active, effective_from, effective_until);
CREATE INDEX IF NOT EXISTS idx_commission_configs_effective_from ON commission_configs(effective_from DESC);

-- Insert default commission config if none exists
INSERT INTO commission_configs (business_owner_commission_percent, customer_reward_percent, effective_from, created_by_admin_id, notes)
SELECT 10.00, 5.00, '2024-01-01', (SELECT id FROM admins LIMIT 1), 'Default commission configuration'
WHERE NOT EXISTS (SELECT 1 FROM commission_configs);

-- Commission transactions table
CREATE TABLE IF NOT EXISTS commission_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL,
    payment_id UUID NULL,
    business_owner_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    commission_config_id UUID NOT NULL,
    booking_amount NUMERIC(10,2) NOT NULL,
    business_owner_commission_percent NUMERIC(5,2) NOT NULL,
    business_owner_commission_amount NUMERIC(10,2) NOT NULL,
    customer_reward_percent NUMERIC(5,2) NOT NULL,
    customer_reward_amount NUMERIC(10,2) NOT NULL,
    business_owner_wallet_transaction_id UUID NULL,
    customer_wallet_transaction_id UUID NULL,
    status commission_transaction_status DEFAULT 'calculated' NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_commission_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_commission_transactions_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    CONSTRAINT fk_commission_transactions_business_owner FOREIGN KEY (business_owner_id) REFERENCES business_owner(id) ON DELETE CASCADE,
    CONSTRAINT fk_commission_transactions_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_commission_transactions_commission_config FOREIGN KEY (commission_config_id) REFERENCES commission_configs(id),
    CONSTRAINT fk_commission_transactions_bo_wallet_txn FOREIGN KEY (business_owner_wallet_transaction_id) REFERENCES wallet_transactions(id) ON DELETE SET NULL,
    CONSTRAINT fk_commission_transactions_customer_wallet_txn FOREIGN KEY (customer_wallet_transaction_id) REFERENCES wallet_transactions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_booking_id ON commission_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_payment_id ON commission_transactions(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commission_transactions_business_owner_id_calculated_at ON commission_transactions(business_owner_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_customer_id_calculated_at ON commission_transactions(customer_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_status ON commission_transactions(status);

-- Add foreign key from bookings to commission_transactions
DO $$ BEGIN
    ALTER TABLE bookings ADD CONSTRAINT fk_bookings_commission_transaction FOREIGN KEY (commission_transaction_id) REFERENCES commission_transactions(id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Monthly settlements table
CREATE TABLE IF NOT EXISTS monthly_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_owner_id UUID NOT NULL,
    settlement_month VARCHAR(7) NOT NULL,
    total_booking_amount NUMERIC(12,2) DEFAULT 0 NOT NULL,
    total_commission_amount NUMERIC(12,2) DEFAULT 0 NOT NULL,
    net_payable_to_business_owner NUMERIC(12,2) NOT NULL,
    total_cod_amount NUMERIC(12,2) DEFAULT 0 NOT NULL,
    total_online_amount NUMERIC(12,2) DEFAULT 0 NOT NULL,
    booking_count INTEGER DEFAULT 0 NOT NULL,
    status settlement_status DEFAULT 'pending' NOT NULL,
    razorpay_payout_id VARCHAR(255) NULL,
    razorpay_fund_account_id VARCHAR(255) NULL,
    payout_initiated_at TIMESTAMP NULL,
    payout_completed_at TIMESTAMP NULL,
    failure_reason TEXT NULL,
    payout_status VARCHAR(100) NULL,
    payout_mode VARCHAR(50) NULL,
    payout_utr VARCHAR(255) NULL,
    payout_metadata JSONB NULL,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP NULL,
    metadata JSONB NULL,
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_monthly_settlements_business_owner FOREIGN KEY (business_owner_id) REFERENCES business_owner(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_settlements_business_owner_month ON monthly_settlements(business_owner_id, settlement_month);
CREATE INDEX IF NOT EXISTS idx_monthly_settlements_status ON monthly_settlements(status);
CREATE INDEX IF NOT EXISTS idx_monthly_settlements_month ON monthly_settlements(settlement_month DESC);

-- Add foreign key from wallet_transactions to settlements
DO $$ BEGIN
    ALTER TABLE wallet_transactions ADD CONSTRAINT fk_wallet_transactions_settlement FOREIGN KEY (settlement_id) REFERENCES monthly_settlements(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Commission payments table
CREATE TABLE IF NOT EXISTS commission_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_owner_id UUID NOT NULL,
    wallet_id UUID NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    razorpay_order_id VARCHAR(255) NULL,
    razorpay_payment_id VARCHAR(255) NULL,
    razorpay_signature VARCHAR(512) NULL,
    status commission_payment_status DEFAULT 'pending' NOT NULL,
    balance_before NUMERIC(10,2) NOT NULL,
    balance_after NUMERIC(10,2) NULL,
    payment_method VARCHAR(100) NULL,
    payment_description VARCHAR(500) NULL,
    notes TEXT NULL,
    failure_reason TEXT NULL,
    defaulter_removed BOOLEAN DEFAULT false NOT NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_commission_payments_business_owner FOREIGN KEY (business_owner_id) REFERENCES business_owner(id) ON DELETE CASCADE,
    CONSTRAINT fk_commission_payments_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_commission_payments_business_owner_id ON commission_payments(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_wallet_id ON commission_payments(wallet_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_status ON commission_payments(status);
CREATE INDEX IF NOT EXISTS idx_commission_payments_created_at ON commission_payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commission_payments_razorpay_order_id ON commission_payments(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

-- Customer reward points table
CREATE TABLE IF NOT EXISTS customer_reward_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    total_points NUMERIC(10,2) DEFAULT 0 NOT NULL,
    total_earned NUMERIC(10,2) DEFAULT 0 NOT NULL,
    total_redeemed NUMERIC(10,2) DEFAULT 0 NOT NULL,
    expiring_points NUMERIC(10,2) DEFAULT 0 NOT NULL,
    next_expiry_date DATE NULL,
    tier reward_tier DEFAULT 'bronze' NOT NULL,
    total_bookings INTEGER DEFAULT 0 NOT NULL,
    last_earned_at TIMESTAMP NULL,
    last_redeemed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_customer_reward_points_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_reward_points_customer_id ON customer_reward_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_reward_points_tier ON customer_reward_points(tier);

-- COD transactions table
CREATE TABLE IF NOT EXISTS cod_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL,
    business_owner_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    net_amount NUMERIC(10,2) NOT NULL,
    collected_at TIMESTAMP NOT NULL,
    settled_in_month VARCHAR(7) NULL,
    settlement_id UUID NULL,
    status cod_transaction_status DEFAULT 'pending' NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_cod_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_cod_transactions_business_owner FOREIGN KEY (business_owner_id) REFERENCES business_owner(id) ON DELETE CASCADE,
    CONSTRAINT fk_cod_transactions_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_cod_transactions_settlement FOREIGN KEY (settlement_id) REFERENCES monthly_settlements(id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cod_transactions_booking_id ON cod_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_cod_transactions_business_owner_collected_at ON cod_transactions(business_owner_id, collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_cod_transactions_status ON cod_transactions(status);
CREATE INDEX IF NOT EXISTS idx_cod_transactions_settled_in_month ON cod_transactions(settled_in_month) WHERE settled_in_month IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cod_transactions_settlement_id ON cod_transactions(settlement_id) WHERE settlement_id IS NOT NULL;

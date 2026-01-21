-- Migration: Add CANCELLED status to booking_request_status_enum and create wallet system tables
-- Date: 2025-10-13
-- Description: Adds 'cancelled' status to booking requests and creates complete wallet/commission infrastructure

-- Part 1: Add CANCELLED status to booking_request_status_enum
ALTER TYPE booking_request_status_enum ADD VALUE IF NOT EXISTS 'cancelled';

-- Part 2: Create wallet-related enums
CREATE TYPE wallet_user_type_enum AS ENUM ('customer', 'business_owner');
CREATE TYPE wallet_transaction_type_enum AS ENUM ('credit', 'debit');
CREATE TYPE wallet_transaction_category_enum AS ENUM ('booking_payment', 'commission', 'settlement', 'reward_points', 'refund', 'adjustment', 'withdrawal');
CREATE TYPE wallet_transaction_status_enum AS ENUM ('pending', 'completed', 'failed', 'reversed');
CREATE TYPE commission_transaction_status_enum AS ENUM ('calculated', 'applied', 'reversed', 'failed');
CREATE TYPE settlement_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed', 'requires_payment', 'payment_received');
CREATE TYPE payment_method_type_enum AS ENUM ('online', 'cod');
CREATE TYPE cod_transaction_status_enum AS ENUM ('pending', 'settled', 'disputed');
CREATE TYPE reward_tier_enum AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- Part 3: Create wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_type wallet_user_type_enum NOT NULL,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_earned DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_commission_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_commission_received DECIMAL(12, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_transaction_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_wallet UNIQUE (user_id, user_type)
);

CREATE INDEX idx_wallets_user_id_type ON wallets(user_id, user_type);
CREATE INDEX idx_wallets_user_type_active ON wallets(user_type, is_active);

-- Part 4: Create wallet_transactions table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type wallet_transaction_type_enum NOT NULL,
    category wallet_transaction_category_enum NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    settlement_id UUID,
    description TEXT NOT NULL,
    metadata JSONB,
    status wallet_transaction_status_enum NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_transactions_wallet_id_created ON wallet_transactions(wallet_id, created_at);
CREATE INDEX idx_wallet_transactions_type_category ON wallet_transactions(type, category);
CREATE INDEX idx_wallet_transactions_booking_id ON wallet_transactions(booking_id);
CREATE INDEX idx_wallet_transactions_payment_id ON wallet_transactions(payment_id);
CREATE INDEX idx_wallet_transactions_settlement_id ON wallet_transactions(settlement_id);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);

-- Part 5: Create commission_configs table
CREATE TABLE commission_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_commission_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
    customer_reward_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE NOT NULL,
    effective_until DATE,
    created_by_admin_id UUID NOT NULL REFERENCES admins(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commission_configs_active_dates ON commission_configs(is_active, effective_from, effective_until);
CREATE INDEX idx_commission_configs_effective_from ON commission_configs(effective_from);

-- Part 6: Create commission_transactions table
CREATE TABLE commission_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    business_owner_id UUID NOT NULL REFERENCES business_owner(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    commission_config_id UUID NOT NULL REFERENCES commission_configs(id),
    booking_amount DECIMAL(10, 2) NOT NULL,
    business_owner_commission_percent DECIMAL(5, 2) NOT NULL,
    business_owner_commission_amount DECIMAL(10, 2) NOT NULL,
    customer_reward_percent DECIMAL(5, 2) NOT NULL,
    customer_reward_amount DECIMAL(10, 2) NOT NULL,
    business_owner_wallet_transaction_id UUID REFERENCES wallet_transactions(id),
    customer_wallet_transaction_id UUID REFERENCES wallet_transactions(id),
    status commission_transaction_status_enum NOT NULL DEFAULT 'calculated',
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commission_transactions_booking_id ON commission_transactions(booking_id);
CREATE INDEX idx_commission_transactions_payment_id ON commission_transactions(payment_id);
CREATE INDEX idx_commission_transactions_business_owner ON commission_transactions(business_owner_id, calculated_at);
CREATE INDEX idx_commission_transactions_customer ON commission_transactions(customer_id, calculated_at);
CREATE INDEX idx_commission_transactions_status ON commission_transactions(status);

-- Part 7: Create monthly_settlements table
CREATE TABLE monthly_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL REFERENCES business_owner(id) ON DELETE CASCADE,
    settlement_month VARCHAR(7) NOT NULL,
    total_booking_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_commission_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    net_payable_to_business_owner DECIMAL(12, 2) NOT NULL,
    total_cod_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_online_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    booking_count INT NOT NULL DEFAULT 0,
    status settlement_status_enum NOT NULL DEFAULT 'pending',
    razorpay_payout_id VARCHAR(255),
    razorpay_fund_account_id VARCHAR(255),
    payout_initiated_at TIMESTAMP,
    payout_completed_at TIMESTAMP,
    failure_reason TEXT,
    metadata JSONB,
    admin_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_business_owner_month UNIQUE (business_owner_id, settlement_month)
);

CREATE INDEX idx_monthly_settlements_business_owner_month ON monthly_settlements(business_owner_id, settlement_month);
CREATE INDEX idx_monthly_settlements_status ON monthly_settlements(status);
CREATE INDEX idx_monthly_settlements_month ON monthly_settlements(settlement_month);

-- Part 8: Create settlement_transactions table
CREATE TABLE settlement_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NOT NULL REFERENCES monthly_settlements(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id),
    commission_transaction_id UUID REFERENCES commission_transactions(id),
    amount DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    net_amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method_type_enum NOT NULL,
    booking_completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settlement_transactions_settlement_id ON settlement_transactions(settlement_id);
CREATE INDEX idx_settlement_transactions_booking_id ON settlement_transactions(booking_id);
CREATE INDEX idx_settlement_transactions_payment_method ON settlement_transactions(payment_method);

-- Part 9: Create cod_transactions table
CREATE TABLE cod_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    business_owner_id UUID NOT NULL REFERENCES business_owner(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    net_amount DECIMAL(10, 2) NOT NULL,
    collected_at TIMESTAMP NOT NULL,
    settled_in_month VARCHAR(7),
    settlement_id UUID REFERENCES monthly_settlements(id),
    status cod_transaction_status_enum NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cod_transactions_booking_id ON cod_transactions(booking_id);
CREATE INDEX idx_cod_transactions_business_owner ON cod_transactions(business_owner_id, collected_at);
CREATE INDEX idx_cod_transactions_status ON cod_transactions(status);
CREATE INDEX idx_cod_transactions_settled_month ON cod_transactions(settled_in_month);
CREATE INDEX idx_cod_transactions_settlement_id ON cod_transactions(settlement_id);

-- Part 10: Create customer_reward_points table
CREATE TABLE customer_reward_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    total_points DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_earned DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_redeemed DECIMAL(10, 2) NOT NULL DEFAULT 0,
    expiring_points DECIMAL(10, 2) NOT NULL DEFAULT 0,
    next_expiry_date DATE,
    tier reward_tier_enum NOT NULL DEFAULT 'bronze',
    total_bookings INT NOT NULL DEFAULT 0,
    last_earned_at TIMESTAMP,
    last_redeemed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_reward_points_customer_id ON customer_reward_points(customer_id);
CREATE INDEX idx_customer_reward_points_tier ON customer_reward_points(tier);

-- Part 11: Add foreign key to wallet_transactions for settlement_id
ALTER TABLE wallet_transactions
ADD CONSTRAINT fk_wallet_transactions_settlement
FOREIGN KEY (settlement_id) REFERENCES monthly_settlements(id) ON DELETE SET NULL;

-- Part 12: Add payment_method column to bookings table
ALTER TABLE bookings
ADD COLUMN payment_method payment_method_type_enum DEFAULT 'online',
ADD COLUMN commission_transaction_id UUID REFERENCES commission_transactions(id);

-- Part 13: Add wallet_transaction_id to payments table
ALTER TABLE payments
ADD COLUMN wallet_transaction_id UUID REFERENCES wallet_transactions(id);

-- Part 14: Insert default commission config (0% commission)
INSERT INTO commission_configs (
    business_owner_commission_percent,
    customer_reward_percent,
    is_active,
    effective_from,
    created_by_admin_id,
    notes
)
SELECT
    0,
    0,
    true,
    CURRENT_DATE,
    id,
    'Default commission configuration - 0% on both sides'
FROM admins
LIMIT 1;

-- Part 15: Create trigger to update wallet updated_at timestamp
CREATE OR REPLACE FUNCTION update_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_wallet_updated_at
BEFORE UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_updated_at();

CREATE TRIGGER trigger_commission_config_updated_at
BEFORE UPDATE ON commission_configs
FOR EACH ROW
EXECUTE FUNCTION update_wallet_updated_at();

CREATE TRIGGER trigger_monthly_settlement_updated_at
BEFORE UPDATE ON monthly_settlements
FOR EACH ROW
EXECUTE FUNCTION update_wallet_updated_at();

CREATE TRIGGER trigger_customer_reward_points_updated_at
BEFORE UPDATE ON customer_reward_points
FOR EACH ROW
EXECUTE FUNCTION update_wallet_updated_at();

-- Migration completed successfully

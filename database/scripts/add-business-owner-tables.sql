-- Add missing business owner related tables and dependencies
-- This script adds the missing tables needed for business owner functionality
-- Including subscription plans, staff services, and other related tables

-- Business Owner table
CREATE TABLE IF NOT EXISTS business_owner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    gender VARCHAR(50) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    date_of_birth DATE,
    business_name VARCHAR(200),
    business_description TEXT,
    operating_years INTEGER,
    referral_code VARCHAR(50) UNIQUE,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Owner Onboarding table
CREATE TABLE IF NOT EXISTS business_owner_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL REFERENCES business_owner(id) ON DELETE CASCADE UNIQUE,
    current_step INTEGER DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 4),
    completed_steps INTEGER[] DEFAULT '{}',
    is_completed BOOLEAN DEFAULT FALSE,
    step1_data JSONB,
    step2_data JSONB,
    step3_data JSONB,
    step4_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Addresses table
CREATE TABLE IF NOT EXISTS business_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL REFERENCES business_owner(id) ON DELETE CASCADE,
    address_type VARCHAR(50) DEFAULT 'business' CHECK (address_type IN ('business', 'home', 'work', 'other')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    street_address VARCHAR(500) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    landmark VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Approvals table
CREATE TABLE IF NOT EXISTS business_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL REFERENCES business_owner(id) ON DELETE CASCADE,
    assigned_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
    assigned_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'requires_changes')),
    review_notes TEXT,
    rejection_reason TEXT,
    is_auto_assigned BOOLEAN DEFAULT TRUE,
    distance_to_agent_km DECIMAL(10, 2),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Media table
CREATE TABLE IF NOT EXISTS business_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL REFERENCES business_owner(id) ON DELETE CASCADE,
    media_type VARCHAR(50) CHECK (media_type IN ('image', 'video', 'document')),
    media_url TEXT NOT NULL,
    cdn_url TEXT,
    s3_key TEXT,
    thumbnail_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Plans table (needed before business_subscriptions)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    billing_type VARCHAR(50) CHECK (billing_type IN ('one_time', 'monthly', 'yearly')) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Subscriptions table
CREATE TABLE IF NOT EXISTS business_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL REFERENCES business_owner(id) ON DELETE CASCADE,
    subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired', 'suspended')),
    started_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    auto_renew BOOLEAN DEFAULT FALSE,
    payment_method_id VARCHAR(255),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Transactions table
CREATE TABLE IF NOT EXISTS subscription_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_subscription_id UUID NOT NULL REFERENCES business_subscriptions(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_method VARCHAR(100),
    payment_gateway VARCHAR(100),
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    processed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL REFERENCES business_owner(id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(50) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')) NOT NULL,
    profile_pic TEXT,
    profile_pic_cdn_url TEXT,
    profile_pic_s3_key TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_owner_user_id ON business_owner(user_id);
CREATE INDEX IF NOT EXISTS idx_business_owner_referral_code ON business_owner(referral_code);
CREATE INDEX IF NOT EXISTS idx_business_owner_is_approved ON business_owner(is_approved);
CREATE INDEX IF NOT EXISTS idx_business_owner_onboarding_business_owner_id ON business_owner_onboarding(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_business_addresses_business_owner_id ON business_addresses(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_business_addresses_primary ON business_addresses(business_owner_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_business_approvals_business_owner_id ON business_approvals(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_business_approvals_assigned_agent_id ON business_approvals(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_business_media_business_owner_id ON business_media(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_business_owner_id ON business_subscriptions(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_staff_business_owner_id ON staff(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_staff_business_owner_id_is_active ON staff(business_owner_id, is_active);

-- Add triggers for updated_at (assumes update_updated_at function exists)
CREATE TRIGGER IF NOT EXISTS update_business_owner_updated_at
    BEFORE UPDATE ON business_owner
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_business_owner_onboarding_updated_at
    BEFORE UPDATE ON business_owner_onboarding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_business_addresses_updated_at
    BEFORE UPDATE ON business_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_business_approvals_updated_at
    BEFORE UPDATE ON business_approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_business_media_updated_at
    BEFORE UPDATE ON business_media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_business_subscriptions_updated_at
    BEFORE UPDATE ON business_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Constraint to ensure only one primary address per business owner
ALTER TABLE business_addresses
ADD CONSTRAINT IF NOT EXISTS only_one_primary_business_address
EXCLUDE (business_owner_id WITH =) WHERE (is_primary = TRUE);

-- Update user_roles to include 'agent' and 'admin' roles as mentioned in error
ALTER TABLE user_roles
DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE user_roles
ADD CONSTRAINT user_roles_role_check
CHECK (role IN ('customer', 'business_owner', 'agent', 'admin'));

-- Show completion message
SELECT 'Business owner tables created successfully!' as status;

-- Staff Services table (junction table for staff and services)
CREATE TABLE IF NOT EXISTS staff_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    is_primary_service BOOLEAN DEFAULT FALSE,
    custom_price DECIMAL(10, 2),
    custom_duration INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, service_id)
);

-- Staff Schedule Overrides table
CREATE TABLE IF NOT EXISTS staff_schedule_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    override_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, override_date)
);

-- Staff Breaks table
CREATE TABLE IF NOT EXISTS staff_breaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    break_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_type VARCHAR(50) DEFAULT 'lunch' CHECK (break_type IN ('lunch', 'personal', 'emergency', 'other')),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_days INTEGER[],
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional indexes for staff-related tables
CREATE INDEX IF NOT EXISTS idx_staff_services_staff_id ON staff_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service_id ON staff_services(service_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_staff_id_is_active ON staff_services(staff_id, is_active);
CREATE INDEX IF NOT EXISTS idx_staff_services_service_id_is_active ON staff_services(service_id, is_active);
CREATE INDEX IF NOT EXISTS idx_staff_schedule_overrides_staff_id ON staff_schedule_overrides(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedule_overrides_override_date ON staff_schedule_overrides(override_date);
CREATE INDEX IF NOT EXISTS idx_staff_breaks_staff_id ON staff_breaks(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_breaks_break_date ON staff_breaks(break_date);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_business_subscription_id ON subscription_transactions(business_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_status ON subscription_transactions(status);

-- Additional triggers for new tables
CREATE TRIGGER IF NOT EXISTS update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_subscription_transactions_updated_at
    BEFORE UPDATE ON subscription_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_staff_schedule_overrides_updated_at
    BEFORE UPDATE ON staff_schedule_overrides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_staff_breaks_updated_at
    BEFORE UPDATE ON staff_breaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Show all tables to verify
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name IN ('business_owner', 'business_owner_onboarding', 'business_addresses', 'business_approvals', 'business_media', 'business_subscriptions', 'staff', 'subscription_plans', 'subscription_transactions', 'staff_services', 'staff_schedule_overrides', 'staff_breaks')
ORDER BY table_name;
-- Fix Business Owner Database Schema

-- Drop existing foreign key constraints that might be causing issues
ALTER TABLE business_addresses DROP CONSTRAINT IF EXISTS "FK_8e35effd8a73c11fdf94ff17374";
ALTER TABLE business_media DROP CONSTRAINT IF EXISTS "FK_business_media_business_owner";
ALTER TABLE business_owner_onboarding DROP CONSTRAINT IF EXISTS "FK_business_owner_onboarding_business_owner";
ALTER TABLE business_approvals DROP CONSTRAINT IF EXISTS "FK_business_approvals_business_owner";
ALTER TABLE business_subscriptions DROP CONSTRAINT IF EXISTS "FK_business_subscriptions_business_owner";
ALTER TABLE staff DROP CONSTRAINT IF EXISTS "FK_staff_business_owner";

-- Drop existing tables if they have data conflicts (since you mentioned you'll remove the DB anyway)
DROP TABLE IF EXISTS business_addresses CASCADE;
DROP TABLE IF EXISTS business_media CASCADE;
DROP TABLE IF EXISTS business_owner_onboarding CASCADE;
DROP TABLE IF EXISTS business_approvals CASCADE;
DROP TABLE IF EXISTS business_subscriptions CASCADE;
DROP TABLE IF EXISTS staff CASCADE;

-- Recreate business_addresses table with correct structure
CREATE TABLE business_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL,
    address_type VARCHAR(50) NOT NULL DEFAULT 'BUSINESS',
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    street_address VARCHAR(500) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    landmark VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    is_primary BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Recreate business_media table
CREATE TABLE business_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    s3_key VARCHAR(500),
    cdn_url VARCHAR(1000),
    upload_status VARCHAR(50) NOT NULL DEFAULT 'UPLOADED',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Recreate business_owner_onboarding table
CREATE TABLE business_owner_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL UNIQUE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    current_step INTEGER NOT NULL DEFAULT 1,
    completed_steps INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    step1_data JSONB,
    step2_data JSONB,
    step3_data JSONB,
    step4_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Recreate business_approvals table
CREATE TABLE business_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    submission_date TIMESTAMP NOT NULL DEFAULT NOW(),
    review_date TIMESTAMP,
    approval_date TIMESTAMP,
    rejection_date TIMESTAMP,
    rejection_reason TEXT,
    assigned_agent_id UUID,
    reviewer_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Recreate business_subscriptions table
CREATE TABLE business_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL,
    subscription_plan_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP,
    next_billing_date TIMESTAMP,
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Recreate staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL,
    user_id UUID NOT NULL,
    position VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    permissions JSONB,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add proper foreign key constraints
ALTER TABLE business_addresses
    ADD CONSTRAINT FK_business_addresses_business_owner
    FOREIGN KEY (business_owner_id) REFERENCES business_owner(id) ON DELETE CASCADE;

ALTER TABLE business_media
    ADD CONSTRAINT FK_business_media_business_owner
    FOREIGN KEY (business_owner_id) REFERENCES business_owner(id) ON DELETE CASCADE;

ALTER TABLE business_owner_onboarding
    ADD CONSTRAINT FK_business_owner_onboarding_business_owner
    FOREIGN KEY (business_owner_id) REFERENCES business_owner(id) ON DELETE CASCADE;

ALTER TABLE business_approvals
    ADD CONSTRAINT FK_business_approvals_business_owner
    FOREIGN KEY (business_owner_id) REFERENCES business_owner(id) ON DELETE CASCADE;

ALTER TABLE business_subscriptions
    ADD CONSTRAINT FK_business_subscriptions_business_owner
    FOREIGN KEY (business_owner_id) REFERENCES business_owner(id) ON DELETE CASCADE;

ALTER TABLE staff
    ADD CONSTRAINT FK_staff_business_owner
    FOREIGN KEY (business_owner_id) REFERENCES business_owner(id) ON DELETE CASCADE;

-- Add foreign key constraints to other tables if they exist
ALTER TABLE business_subscriptions
    ADD CONSTRAINT FK_business_subscriptions_plan
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
    IF NOT EXISTS;

ALTER TABLE business_approvals
    ADD CONSTRAINT FK_business_approvals_agent
    FOREIGN KEY (assigned_agent_id) REFERENCES agents(id) ON DELETE SET NULL
    IF NOT EXISTS;

ALTER TABLE staff
    ADD CONSTRAINT FK_staff_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    IF NOT EXISTS;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_addresses_business_owner_id ON business_addresses(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_business_addresses_is_primary ON business_addresses(is_primary);
CREATE INDEX IF NOT EXISTS idx_business_media_business_owner_id ON business_media(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_business_owner_onboarding_business_owner_id ON business_owner_onboarding(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_business_approvals_business_owner_id ON business_approvals(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_business_approvals_status ON business_approvals(status);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_business_owner_id ON business_subscriptions(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_staff_business_owner_id ON staff(business_owner_id);

-- Add unique constraints where needed
ALTER TABLE business_addresses ADD CONSTRAINT unique_primary_address_per_business
    UNIQUE (business_owner_id, is_primary) DEFERRABLE INITIALLY DEFERRED;
-- Comprehensive Migration Script
-- Adds missing columns to existing tables to match entity definitions
-- Run this script if you encounter "column does not exist" errors

BEGIN;

-- ============================================
-- 1. Add S3/CDN and device columns to users table
-- ============================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_pic_cdn_url TEXT,
ADD COLUMN IF NOT EXISTS profile_pic_s3_key TEXT,
ADD COLUMN IF NOT EXISTS fcm_token TEXT,
ADD COLUMN IF NOT EXISTS device_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS device_id VARCHAR(100);

-- Add comments
COMMENT ON COLUMN users.fcm_token IS 'Firebase Cloud Messaging token for push notifications';
COMMENT ON COLUMN users.device_type IS 'Device type: android, ios, web, etc.';
COMMENT ON COLUMN users.device_id IS 'Unique device identifier';

-- ============================================
-- 2. Add gender enum and column to services table
-- ============================================
DO $$
BEGIN
    -- Create enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_gender_enum') THEN
        CREATE TYPE service_gender_enum AS ENUM ('male', 'female', 'both');
    END IF;
END $$;

-- Add gender column to services table
ALTER TABLE services
ADD COLUMN IF NOT EXISTS gender service_gender_enum;

-- Add comment to column
COMMENT ON COLUMN services.gender IS 'Gender this service is available for: male, female, or both';

-- ============================================
-- 3. Add missing columns to agents table
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agents') THEN
        ALTER TABLE agents
        ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
        ADD COLUMN IF NOT EXISTS password VARCHAR(255),
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
        ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
        ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7),
        ADD COLUMN IF NOT EXISTS location_address TEXT;

        -- Create indexes for new columns
        CREATE INDEX IF NOT EXISTS idx_agents_username ON agents(username);
        CREATE INDEX IF NOT EXISTS idx_agents_location ON agents(latitude, longitude);

        -- Add comments
        COMMENT ON COLUMN agents.username IS 'Unique username for agent login';
        COMMENT ON COLUMN agents.password IS 'Hashed password for agent authentication';
        COMMENT ON COLUMN agents.last_login IS 'Last login timestamp';
        COMMENT ON COLUMN agents.latitude IS 'Agent location latitude';
        COMMENT ON COLUMN agents.longitude IS 'Agent location longitude';
        COMMENT ON COLUMN agents.location_address IS 'Agent location address';
    END IF;
END $$;

-- ============================================
-- 4. Add S3/CDN columns to staff table (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
        ALTER TABLE staff
        ADD COLUMN IF NOT EXISTS profile_pic_cdn_url TEXT,
        ADD COLUMN IF NOT EXISTS profile_pic_s3_key TEXT;
    END IF;
END $$;

-- ============================================
-- 5. Add S3/CDN columns to business_media table (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_media') THEN
        ALTER TABLE business_media
        ADD COLUMN IF NOT EXISTS cdn_url TEXT,
        ADD COLUMN IF NOT EXISTS s3_key TEXT,
        ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

        -- Create index on s3_key for better lookups
        CREATE INDEX IF NOT EXISTS idx_business_media_s3_key ON business_media(s3_key);
    END IF;
END $$;

-- ============================================
-- 6. Create customer_media table if it doesn't exist
-- ============================================
CREATE TABLE IF NOT EXISTS customer_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'document')),
    media_url TEXT NOT NULL,
    cdn_url TEXT,
    s3_key TEXT,
    thumbnail_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for customer_media (if table was just created)
CREATE INDEX IF NOT EXISTS idx_customer_media_customer_id ON customer_media(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_media_active ON customer_media(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_media_display_order ON customer_media(display_order);
CREATE INDEX IF NOT EXISTS idx_customer_media_media_type ON customer_media(media_type);

-- ============================================
-- 7. Add missing columns to business_owner table (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_owner') THEN
        ALTER TABLE business_owner
        ADD COLUMN IF NOT EXISTS shop_id VARCHAR(9) UNIQUE,
        ADD COLUMN IF NOT EXISTS is_defaulter BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS defaulter_since TIMESTAMP;

        -- Create index on shop_id
        CREATE INDEX IF NOT EXISTS idx_business_owner_shop_id ON business_owner(shop_id);

        -- Add comments
        COMMENT ON COLUMN business_owner.shop_id IS 'Unique shop identifier with format SH-XXXXXX';
        COMMENT ON COLUMN business_owner.is_defaulter IS 'Whether the business is marked as defaulter due to negative wallet balance';
        COMMENT ON COLUMN business_owner.defaulter_since IS 'When the business was marked as defaulter';
    END IF;
END $$;

-- ============================================
-- 8. Create or update trigger function for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to customer_media if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_media') THEN
        DROP TRIGGER IF EXISTS update_customer_media_updated_at ON customer_media;
        CREATE TRIGGER update_customer_media_updated_at
            BEFORE UPDATE ON customer_media
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓✓✓ MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE 'All missing columns have been added to existing tables';
END $$;

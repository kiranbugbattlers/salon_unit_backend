-- S3 Integration Migration Script
-- Adds S3-related fields to existing media tables and creates customer_media table

BEGIN;

-- Add S3 profile picture fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_pic_cdn_url TEXT,
ADD COLUMN IF NOT EXISTS profile_pic_s3_key TEXT;

-- Add S3 fields to business_media table
ALTER TABLE business_media 
ADD COLUMN IF NOT EXISTS cdn_url TEXT,
ADD COLUMN IF NOT EXISTS s3_key TEXT,
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

-- Create customer_media table for customer gallery images
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_media_customer_id ON customer_media(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_media_active ON customer_media(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_media_display_order ON customer_media(display_order);
CREATE INDEX IF NOT EXISTS idx_customer_media_media_type ON customer_media(media_type);

-- Create index on business_media for better S3 key lookups
CREATE INDEX IF NOT EXISTS idx_business_media_s3_key ON business_media(s3_key);

-- Add updated_at trigger for customer_media table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_media_updated_at 
    BEFORE UPDATE ON customer_media 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Sample data for testing (optional)
-- INSERT INTO customer_media (customer_id, media_type, media_url, cdn_url, s3_key, file_name, file_size, mime_type, description)
-- VALUES (
--     (SELECT id FROM customers LIMIT 1),
--     'image',
--     'https://blr1.digitaloceanspaces.com/styleplusunits3/galleries/2024-09-08/customer_test-uuid.jpg',
--     'https://styleplusunits3.blr1.cdn.digitaloceanspaces.com/galleries/2024-09-08/customer_test-uuid.jpg',
--     'galleries/2024-09-08/customer_test-uuid.jpg',
--     'inspiration_hair_style.jpg',
--     1024000,
--     'image/jpeg',
--     'Hair style inspiration from Pinterest'
-- );
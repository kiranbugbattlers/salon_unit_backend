-- Complete Database Reset Script
-- Run this to completely clean the database and let TypeORM recreate everything

-- Drop all tables in the correct order (considering foreign key dependencies)
DROP TABLE IF EXISTS business_subscriptions CASCADE;
DROP TABLE IF EXISTS business_approvals CASCADE;
DROP TABLE IF EXISTS business_media CASCADE;
DROP TABLE IF EXISTS business_addresses CASCADE;
DROP TABLE IF EXISTS business_owner_onboarding CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS customer_media CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS subscription_transactions CASCADE;
DROP TABLE IF EXISTS staff_schedule_overrides CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS business_owner CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS genders CASCADE;

-- Drop any remaining sequences
DROP SEQUENCE IF EXISTS business_owner_id_seq CASCADE;
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;

-- Drop custom types/enums if they exist
DROP TYPE IF EXISTS address_type CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS gender_enum CASCADE;
DROP TYPE IF EXISTS media_type CASCADE;
DROP TYPE IF EXISTS service_location_type CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS upload_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Clear any cached TypeORM metadata
-- (TypeORM will recreate all tables with the correct schema when the app starts)
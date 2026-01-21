# Salon Backend Database Tables

## User Management
- **users** - User accounts and authentication
- **user_roles** - User role definitions
- **user_addresses** - User address information
- **refresh_tokens** - JWT refresh tokens
- **otp_tokens** - One-time password tokens

## Customer Management
- **customers** - Customer profiles
- **customer_media** - Customer photos and media
- **customer_favorites** - Customer favorite services/salons
- **customer_onboarding** - Customer onboarding progress
- **customer_reward_points** - Customer loyalty points
- **customer_support_mapping** - Customer to support member assignments

## Business Owner Management
- **business_owners** - Business owner accounts
- **business_owner_onboarding** - Business owner onboarding progress
- **business_addresses** - Business address information
- **business_media** - Business photos and media
- **business_operating_hours** - Business operating schedules
- **business_services** - Services offered by businesses
- **business_settings** - Business configuration settings
- **business_subscriptions** - Business subscription plans
- **business_documents** - Business verification documents
- **business_approval** - Business approval workflow

## Service Management
- **service_categories** - Service category classifications
- **services** - Individual service definitions
- **service_packages** - Service package bundles
- **service_package_items** - Items within service packages

## Staff Management
- **staff** - Staff member profiles
- **staff_services** - Staff to service assignments
- **staff_working_hours** - Staff working schedules
- **staff_schedule_override** - Staff schedule exceptions
- **staff_break** - Staff break schedules

## Booking Management
- **bookings** - Main booking records
- **booking_requests** - Booking request records
- **booking_services** - Services within bookings
- **booking_request_services** - Services within booking requests

## Payment and Financial
- **payments** - Payment transaction records
- **wallets** - Customer wallet balances
- **wallet_transactions** - Wallet transaction history
- **cod_transactions** - Cash on delivery transactions
- **banking_info** - Banking information for settlements

## Commission and Settlements
- **commission_configs** - Commission configuration
- **commission_transactions** - Commission transaction records
- **commission_payments** - Commission payment records
- **daily_settlements** - Daily settlement calculations
- **monthly_settlements** - Monthly settlement records
- **settlement_transactions** - Settlement transaction details

## Subscription Management
- **subscription_plans** - Available subscription plans
- **subscription_transactions** - Subscription payment records

## Reviews and Ratings
- **reviews** - Customer reviews and ratings

## Advertisement Management
- **advertisements** - Advertisement records

## Support Management
- **support_members** - Support team members
- **admin_action_audit** - Admin action audit logs

## System and Utilities
- **idempotency_keys** - Idempotency key management
- **admins** - Admin user accounts
- **agents** - Agent user accounts

## Notification System
- **device_tokens** - Push notification device tokens
- **notification_logs** - Notification delivery logs
- **scheduled_notifications** - Scheduled notification records

## Total Tables: 54

All tables are properly configured in the TypeORM entities and included in the database synchronization process.

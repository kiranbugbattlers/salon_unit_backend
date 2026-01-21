-- Customer Onboarding Database Schema
-- Normalized design supporting multiple user roles

-- Base users table (shared between customers and future business owners)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    profile_pic TEXT,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles (supports multiple roles except admin)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'business_owner', 'agent', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role)
);

-- Customer specific data
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    gender VARCHAR(50) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer onboarding progress tracking
CREATE TABLE customer_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
    current_step INTEGER DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 4),
    completed_steps INTEGER[] DEFAULT '{}',
    is_completed BOOLEAN DEFAULT FALSE,
    step_1_data JSONB,
    step_2_data JSONB,
    step_3_data JSONB,
    step_4_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer addresses (normalized, multiple addresses per customer)
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_type VARCHAR(50) DEFAULT 'home' CHECK (address_type IN ('home', 'work', 'other')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    street_address VARCHAR(255) NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hair types master data
CREATE TABLE hair_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Service categories master data
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    image_s3_key TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gender master data
CREATE TABLE genders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gender_name VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services master data
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES service_categories(id),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image TEXT,
    image_s3_key TEXT,
    base_price DECIMAL(10, 2),
    default_duration INTEGER,
    available_at_home BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service-Gender junction table (many-to-many)
CREATE TABLE service_genders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    gender_id UUID REFERENCES genders(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, gender_id)
);

-- Customer service preferences
CREATE TABLE customer_service_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    hair_type_id UUID REFERENCES hair_types(id),
    preferred_service_ids UUID[],
    preferred_category_id UUID REFERENCES service_categories(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id)
);

-- Time slots master data
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(start_time, end_time)
);

-- Days of week master data  
CREATE TABLE days_of_week (
    id INTEGER PRIMARY KEY,
    name VARCHAR(10) NOT NULL UNIQUE,
    short_name VARCHAR(3) NOT NULL UNIQUE
);

-- Customer timing preferences
CREATE TABLE customer_timing_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    preferred_time_slot_ids UUID[],
    preferred_days INTEGER[], -- Array of day IDs (1=Monday, 7=Sunday)
    avoid_time_slot_ids UUID[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id)
);

-- Refresh tokens for JWT management
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    device_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP tokens for phone verification
CREATE TABLE otp_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    requested_role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin table (separate from users - admin cannot have other roles)
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    fcm_token TEXT,
    device_type VARCHAR(20),
    device_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent table (can only be created by admin)
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    created_by_admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    gender VARCHAR(50) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    date_of_birth DATE,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    permissions JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_primary ON customer_addresses(customer_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_otp_tokens_phone ON otp_tokens(phone);
CREATE INDEX idx_otp_tokens_expires ON otp_tokens(expires_at);
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_created_by_admin_id ON agents(created_by_admin_id);
CREATE INDEX idx_agents_employee_id ON agents(employee_id);
CREATE INDEX idx_agents_is_active ON agents(is_active);

-- Insert master data
INSERT INTO service_categories (name, description) VALUES
    ('Hair Care', 'Hair care services'),
    ('Styling', 'Hair styling services'),
    ('Treatments', 'Hair treatment services'),
    ('Coloring', 'Hair coloring services');

INSERT INTO services (category_id, name, description, base_price, default_duration, available_at_home, genders) VALUES
    ((SELECT id FROM service_categories WHERE name = 'Hair Care'), 'Haircut', 'Basic haircut service', 45.00, 45, false, 'male,female,other'),
    ((SELECT id FROM service_categories WHERE name = 'Hair Care'), 'Hair Wash', 'Hair washing service', 25.00, 30, false, 'male,female,other'),
    ((SELECT id FROM service_categories WHERE name = 'Styling'), 'Blow Dry', 'Hair blow dry styling', 35.00, 30, true, 'female'),
    ((SELECT id FROM service_categories WHERE name = 'Styling'), 'Hair Styling', 'Professional hair styling', 60.00, 60, true, 'male,female,other'),
    ((SELECT id FROM service_categories WHERE name = 'Treatments'), 'Hair Treatment', 'Deep conditioning treatment', 80.00, 90, false, 'male,female,other'),
    ((SELECT id FROM service_categories WHERE name = 'Coloring'), 'Hair Color', 'Hair coloring service', 120.00, 120, false, 'male,female,other');

INSERT INTO days_of_week (id, name, short_name) VALUES
    (1, 'Monday', 'Mon'),
    (2, 'Tuesday', 'Tue'), 
    (3, 'Wednesday', 'Wed'),
    (4, 'Thursday', 'Thu'),
    (5, 'Friday', 'Fri'),
    (6, 'Saturday', 'Sat'),
    (7, 'Sunday', 'Sun');

INSERT INTO time_slots (start_time, end_time, display_name) VALUES
    ('09:00', '12:00', '9:00 AM - 12:00 PM'),
    ('13:00', '17:00', '1:00 PM - 5:00 PM'),
    ('18:00', '21:00', '6:00 PM - 9:00 PM'),
    ('10:00', '14:00', '10:00 AM - 2:00 PM'),
    ('15:00', '19:00', '3:00 PM - 7:00 PM');

-- Constraints to ensure data integrity
ALTER TABLE customer_addresses ADD CONSTRAINT only_one_primary_address 
    EXCLUDE (customer_id WITH =) WHERE (is_primary = TRUE);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customer_onboarding_updated_at BEFORE UPDATE ON customer_onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customer_service_preferences_updated_at BEFORE UPDATE ON customer_service_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customer_timing_preferences_updated_at BEFORE UPDATE ON customer_timing_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default admin users
-- Example: INSERT INTO admins (username, password, first_name, email, is_active) VALUES
--     ('your_username', 'your_hashed_password', 'Your Name', 'your_email@domain.com', true);
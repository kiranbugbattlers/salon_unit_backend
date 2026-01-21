-- Create vendor_due_payments table
CREATE TABLE IF NOT EXISTS vendor_due_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_owner_id UUID NOT NULL,
    due_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0 NOT NULL,
    remaining_amount DECIMAL(12,2) NOT NULL,
    alternate_number VARCHAR(20),
    salon_name VARCHAR(200),
    owner_name VARCHAR(200),
    mobile_number VARCHAR(15),
    is_business_enabled BOOLEAN DEFAULT true,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    description TEXT,
    created_by_admin_id UUID,
    updated_by_admin_id UUID,
    admin_remarks TEXT,
    marked_overdue_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_vendor_due_payments_business_owner 
        FOREIGN KEY (business_owner_id) 
        REFERENCES business_owner(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_vendor_due_payments_created_admin 
        FOREIGN KEY (created_by_admin_id) 
        REFERENCES admin(id) 
        ON DELETE SET NULL,
        
    CONSTRAINT fk_vendor_due_payments_updated_admin 
        FOREIGN KEY (updated_by_admin_id) 
        REFERENCES admin(id) 
        ON DELETE SET NULL
);

-- Add vendor_status column to business_owner table
ALTER TABLE business_owner 
ADD COLUMN IF NOT EXISTS vendor_status VARCHAR(20) DEFAULT 'active';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_due_payments_business_owner ON vendor_due_payments(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_vendor_due_payments_status ON vendor_due_payments(status);
CREATE INDEX IF NOT EXISTS idx_vendor_due_payments_due_date ON vendor_due_payments(due_date);

-- Complete Database Migration Script for Proposal Generator
-- This script creates all tables, indexes, RLS policies, and default data
-- Compatible with Supabase and Vercel deployment
-- Updated with rich text editor support and PDF generation features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS proposal_products CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS terms_condition_templates CASCADE;
DROP TABLE IF EXISTS service_benefit_templates CASCADE;
DROP TABLE IF EXISTS company_profile_templates CASCADE;

-- Updated company_profile_templates with rich text content support
CREATE TABLE company_profile_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    content JSONB DEFAULT '{}', -- Rich text content storage
    logo_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated service_benefit_templates with structured JSONB content
CREATE TABLE service_benefit_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Rich text HTML content
    benefits JSONB NOT NULL DEFAULT '[]', -- Structured benefits array
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated terms_condition_templates with rich text support
CREATE TABLE terms_condition_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Rich text HTML content
    terms JSONB NOT NULL DEFAULT '[]', -- Structured terms array
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'pcs',
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    thumbnail_url TEXT,
    category VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced proposals table with PDF generation and design settings
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    proposal_type VARCHAR(100) NOT NULL DEFAULT 'business',
    type VARCHAR(100) NOT NULL DEFAULT 'quotation' CHECK (type IN ('quotation', 'partnership')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'sent')),
    recipient_name VARCHAR(255) NOT NULL,
    recipient_company VARCHAR(255),
    recipient_address TEXT,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),
    creator_name VARCHAR(255) NOT NULL,
    creator_position VARCHAR(255),
    letter_date DATE DEFAULT CURRENT_DATE,
    content JSONB DEFAULT '{}', -- Complete proposal content
    company_profile_template_id UUID REFERENCES company_profile_templates(id),
    service_benefit_template_id UUID REFERENCES service_benefit_templates(id),
    terms_condition_template_id UUID REFERENCES terms_condition_templates(id),
    total_amount DECIMAL(15,2) DEFAULT 0,
    pdf_url TEXT, -- Generated PDF file URL
    design_settings JSONB DEFAULT '{}', -- PDF design configuration
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proposal_products junction table
CREATE TABLE proposal_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, product_id)
);

-- Enhanced indexes including JSONB content indexing
CREATE INDEX idx_company_profile_templates_user_id ON company_profile_templates(user_id);
CREATE INDEX idx_company_profile_templates_content ON company_profile_templates USING GIN (content);
CREATE INDEX idx_service_benefit_templates_user_id ON service_benefit_templates(user_id);
CREATE INDEX idx_service_benefit_templates_benefits ON service_benefit_templates USING GIN (benefits);
CREATE INDEX idx_terms_condition_templates_user_id ON terms_condition_templates(user_id);
CREATE INDEX idx_terms_condition_templates_terms ON terms_condition_templates USING GIN (terms);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_category ON portfolios(category);
CREATE INDEX idx_portfolios_is_featured ON portfolios(is_featured);
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_type ON proposals(type);
CREATE INDEX idx_proposals_created_at ON proposals(created_at);
CREATE INDEX idx_proposals_content ON proposals USING GIN (content);
CREATE INDEX idx_proposals_design_settings ON proposals USING GIN (design_settings);
CREATE INDEX idx_proposal_products_proposal_id ON proposal_products(proposal_id);
CREATE INDEX idx_proposal_products_product_id ON proposal_products(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE company_profile_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_benefit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_condition_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_profile_templates
CREATE POLICY "Users can view their own company profile templates" ON company_profile_templates
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own company profile templates" ON company_profile_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own company profile templates" ON company_profile_templates
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own company profile templates" ON company_profile_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for service_benefit_templates
CREATE POLICY "Users can view their own service benefit templates" ON service_benefit_templates
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own service benefit templates" ON service_benefit_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own service benefit templates" ON service_benefit_templates
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own service benefit templates" ON service_benefit_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for terms_condition_templates
CREATE POLICY "Users can view their own terms condition templates" ON terms_condition_templates
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own terms condition templates" ON terms_condition_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own terms condition templates" ON terms_condition_templates
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own terms condition templates" ON terms_condition_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for products
CREATE POLICY "Users can view their own products" ON products
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON products
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for portfolios
CREATE POLICY "Users can view their own portfolios" ON portfolios
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own portfolios" ON portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolios" ON portfolios
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own portfolios" ON portfolios
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for proposals
CREATE POLICY "Users can view their own proposals" ON proposals
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own proposals" ON proposals
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own proposals" ON proposals
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own proposals" ON proposals
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for proposal_products
CREATE POLICY "Users can view their own proposal products" ON proposal_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM proposals 
            WHERE proposals.id = proposal_products.proposal_id 
            AND proposals.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert their own proposal products" ON proposal_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM proposals 
            WHERE proposals.id = proposal_products.proposal_id 
            AND proposals.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update their own proposal products" ON proposal_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM proposals 
            WHERE proposals.id = proposal_products.proposal_id 
            AND proposals.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete their own proposal products" ON proposal_products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM proposals 
            WHERE proposals.id = proposal_products.proposal_id 
            AND proposals.user_id = auth.uid()
        )
    );

-- Updated default templates creation with rich text content
CREATE OR REPLACE FUNCTION create_user_default_templates()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default company profile template with rich content
    INSERT INTO company_profile_templates (
        name, company_name, address, phone, email, website, description, content, user_id
    ) VALUES (
        'Default Company Profile',
        'Your Company Name',
        'Your Company Address',
        '+62 XXX-XXXX-XXXX',
        'info@yourcompany.com',
        'https://yourcompany.com',
        'Brief description of your company and services.',
        '{"sections": {"about": "<p>We are a professional company dedicated to providing high-quality services to our clients.</p>", "mission": "<p>To deliver exceptional value through innovative solutions and outstanding customer service.</p>", "vision": "<p>To be the leading provider in our industry, recognized for excellence and integrity.</p>"}}'::jsonb,
        NEW.id
    );

    -- Create default service benefits template with rich content
    INSERT INTO service_benefit_templates (
        name, title, content, benefits, user_id
    ) VALUES (
        'Default Service Benefits',
        'Our Service Benefits',
        '<p>We offer comprehensive services designed to meet your business needs with the following key benefits:</p>',
        '[
            {"title": "Professional Service", "description": "<p>High-quality professional service with experienced team members who understand your business requirements.</p>"},
            {"title": "Competitive Pricing", "description": "<p>Affordable pricing structure without compromising on quality or service delivery standards.</p>"},
            {"title": "Timely Delivery", "description": "<p>On-time project delivery as per agreed timeline with regular progress updates and communication.</p>"},
            {"title": "24/7 Support", "description": "<p>Round-the-clock customer support and maintenance services to ensure smooth operations.</p>"}
        ]'::jsonb,
        NEW.id
    );

    -- Create default terms and conditions template with rich content
    INSERT INTO terms_condition_templates (
        name, title, content, terms, user_id
    ) VALUES (
        'Default Terms & Conditions',
        'Terms and Conditions',
        '<p>Please review the following terms and conditions that govern our business relationship:</p>',
        '[
            {"title": "Payment Terms", "description": "<p><strong>Payment Schedule:</strong> 50% advance payment required to commence work, remaining 50% due upon project completion and delivery.</p>"},
            {"title": "Project Timeline", "description": "<p><strong>Delivery Schedule:</strong> Project timeline as mutually agreed upon in the project scope document with milestone-based deliverables.</p>"},
            {"title": "Revision Policy", "description": "<p><strong>Revisions Included:</strong> Up to 3 major revisions included in the quoted price. Additional revisions will be charged separately.</p>"},
            {"title": "Intellectual Property", "description": "<p><strong>Rights Transfer:</strong> All intellectual property rights will be transferred to the client upon receipt of full payment.</p>"},
            {"title": "Cancellation Policy", "description": "<p><strong>Cancellation Notice:</strong> 48-hour advance notice required for meeting cancellations. Project cancellation terms as per signed agreement.</p>"}
        ]'::jsonb,
        NEW.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create default templates for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_default_templates();

-- Insert some sample data for demonstration (optional - remove in production)
-- This data will only be visible to the user who created it due to RLS policies

-- Note: The following sample data requires actual user IDs from auth.users
-- In a real deployment, this would be handled by the application after user registration

COMMENT ON TABLE company_profile_templates IS 'Stores company profile templates for proposals';
COMMENT ON TABLE service_benefit_templates IS 'Stores service benefits templates for proposals';
COMMENT ON TABLE terms_condition_templates IS 'Stores terms and conditions templates for proposals';
COMMENT ON TABLE products IS 'Stores products/services with pricing information';
COMMENT ON TABLE portfolios IS 'Stores portfolio files and metadata';
COMMENT ON TABLE proposals IS 'Main proposals table with all proposal data';
COMMENT ON TABLE proposal_products IS 'Junction table linking proposals with products';

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_company_profile_templates_updated_at
    BEFORE UPDATE ON company_profile_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_benefit_templates_updated_at
    BEFORE UPDATE ON service_benefit_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_terms_condition_templates_updated_at
    BEFORE UPDATE ON terms_condition_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

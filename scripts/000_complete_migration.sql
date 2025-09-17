-- Complete Database Migration Script for Proposal Generator
-- This script creates all tables, indexes, RLS policies, and default data
-- Compatible with Supabase and Vercel deployment
-- Updated with rich text editor support, PDF generation features, and enhanced schema

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

-- Enhanced company_profile_templates with rich text content support
CREATE TABLE company_profile_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    content TEXT, -- Rich text HTML content from QuillEditor
    logo_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced service_benefit_templates with structured JSONB content and HTML support
CREATE TABLE service_benefit_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Rich text HTML content from QuillEditor
    benefits JSONB NOT NULL DEFAULT '[]', -- Structured benefits array with HTML descriptions
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced terms_condition_templates with rich text support
CREATE TABLE terms_condition_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Rich text HTML content from QuillEditor
    terms JSONB NOT NULL DEFAULT '[]', -- Structured terms array with HTML descriptions
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

-- Enhanced proposals table with comprehensive PDF generation and design settings
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
    content JSONB DEFAULT '{}', -- Complete proposal content with HTML support
    company_profile_template_id UUID REFERENCES company_profile_templates(id),
    service_benefit_template_id UUID REFERENCES service_benefit_templates(id),
    terms_condition_template_id UUID REFERENCES terms_condition_templates(id),
    total_amount DECIMAL(15,2) DEFAULT 0,
    pdf_url TEXT, -- Generated PDF file URL for storage
    design_settings JSONB DEFAULT '{
        "theme": "professional",
        "primaryColor": "#2563eb",
        "secondaryColor": "#64748b",
        "fontFamily": "helvetica",
        "fontSize": 12,
        "lineHeight": 1.5,
        "pageSize": "A4",
        "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20},
        "header": {"enabled": true, "height": 15, "content": "PROPOSAL BISNIS", "showLogo": false},
        "footer": {"enabled": true, "height": 15, "content": "Confidential Document", "showPageNumbers": true},
        "watermark": {"enabled": false, "text": "DRAFT", "opacity": 20}
    }'::jsonb, -- PDF design configuration with defaults
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

-- Enhanced indexes including content search optimization
CREATE INDEX idx_company_profile_templates_user_id ON company_profile_templates(user_id);
CREATE INDEX idx_company_profile_templates_content ON company_profile_templates USING gin(to_tsvector('indonesian', content)); -- Full-text search on HTML content
CREATE INDEX idx_service_benefit_templates_user_id ON service_benefit_templates(user_id);
CREATE INDEX idx_service_benefit_templates_benefits ON service_benefit_templates USING GIN (benefits);
CREATE INDEX idx_service_benefit_templates_content ON service_benefit_templates USING gin(to_tsvector('indonesian', content)); -- Full-text search
CREATE INDEX idx_terms_condition_templates_user_id ON terms_condition_templates(user_id);
CREATE INDEX idx_terms_condition_templates_terms ON terms_condition_templates USING GIN (terms);
CREATE INDEX idx_terms_condition_templates_content ON terms_condition_templates USING gin(to_tsvector('indonesian', content)); -- Full-text search
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
CREATE INDEX idx_proposals_pdf_url ON proposals(pdf_url) WHERE pdf_url IS NOT NULL; -- Index for PDF URL lookups
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

-- Enhanced default templates creation with rich HTML content
CREATE OR REPLACE FUNCTION create_user_default_templates()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default company profile template with rich HTML content
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
        '<h2>Tentang Perusahaan</h2><p>Kami adalah perusahaan profesional yang berdedikasi untuk memberikan layanan berkualitas tinggi kepada klien kami.</p><h3>Misi Kami</h3><p>Memberikan nilai luar biasa melalui solusi inovatif dan layanan pelanggan yang outstanding.</p><h3>Visi Kami</h3><p>Menjadi penyedia terdepan di industri kami, diakui karena keunggulan dan integritas.</p>', -- Rich HTML content
        NEW.id
    );

    -- Create default service benefits template with rich HTML content
    INSERT INTO service_benefit_templates (
        name, title, content, benefits, user_id
    ) VALUES (
        'Default Service Benefits',
        'Keuntungan Layanan Kami',
        '<p>Kami menawarkan layanan komprehensif yang dirancang untuk memenuhi kebutuhan bisnis Anda dengan keuntungan utama sebagai berikut:</p>', -- Rich HTML content
        '[
            {
                "title": "Layanan Profesional", 
                "description": "<p><strong>Layanan berkualitas tinggi</strong> dengan tim berpengalaman yang memahami kebutuhan bisnis Anda.</p><ul><li>Tim ahli bersertifikat</li><li>Pengalaman lebih dari 5 tahun</li><li>Metodologi terbukti</li></ul>"
            },
            {
                "title": "Harga Kompetitif", 
                "description": "<p><strong>Struktur harga terjangkau</strong> tanpa mengorbankan kualitas atau standar penyampaian layanan.</p><ul><li>Paket fleksibel</li><li>Tidak ada biaya tersembunyi</li><li>ROI yang terukur</li></ul>"
            },
            {
                "title": "Pengiriman Tepat Waktu", 
                "description": "<p><strong>Pengiriman proyek tepat waktu</strong> sesuai timeline yang disepakati dengan update progress reguler.</p><ul><li>Milestone tracking</li><li>Progress report mingguan</li><li>Komunikasi real-time</li></ul>"
            },
            {
                "title": "Dukungan 24/7", 
                "description": "<p><strong>Dukungan pelanggan dan maintenance</strong> sepanjang waktu untuk memastikan operasional yang lancar.</p><ul><li>Help desk 24/7</li><li>Remote support</li><li>Emergency response</li></ul>"
            }
        ]'::jsonb, -- Enhanced benefits with HTML descriptions
        NEW.id
    );

    -- Create default terms and conditions template with rich HTML content
    INSERT INTO terms_condition_templates (
        name, title, content, terms, user_id
    ) VALUES (
        'Default Terms & Conditions',
        'Syarat dan Ketentuan',
        '<p>Mohon tinjau syarat dan ketentuan berikut yang mengatur hubungan bisnis kami:</p>', -- Rich HTML content
        '[
            {
                "title": "Ketentuan Pembayaran", 
                "description": "<p><strong>Jadwal Pembayaran:</strong></p><ul><li>50% pembayaran di muka diperlukan untuk memulai pekerjaan</li><li>50% sisanya jatuh tempo setelah penyelesaian dan penyerahan proyek</li><li>Pembayaran melalui transfer bank atau metode yang disepakati</li></ul>"
            },
            {
                "title": "Timeline Proyek", 
                "description": "<p><strong>Jadwal Pengiriman:</strong></p><ul><li>Timeline proyek sesuai kesepakatan dalam dokumen scope proyek</li><li>Deliverable berbasis milestone</li><li>Perubahan scope dapat mempengaruhi timeline</li></ul>"
            },
            {
                "title": "Kebijakan Revisi", 
                "description": "<p><strong>Revisi Termasuk:</strong></p><ul><li>Hingga 3 revisi besar termasuk dalam harga yang dikutip</li><li>Revisi tambahan akan dikenakan biaya terpisah</li><li>Minor adjustment tidak dikenakan biaya tambahan</li></ul>"
            },
            {
                "title": "Hak Kekayaan Intelektual", 
                "description": "<p><strong>Transfer Hak:</strong></p><ul><li>Semua hak kekayaan intelektual akan dialihkan kepada klien</li><li>Transfer dilakukan setelah pembayaran penuh diterima</li><li>Source code dan dokumentasi disertakan</li></ul>"
            },
            {
                "title": "Kebijakan Pembatalan", 
                "description": "<p><strong>Pemberitahuan Pembatalan:</strong></p><ul><li>Pemberitahuan 48 jam diperlukan untuk pembatalan meeting</li><li>Ketentuan pembatalan proyek sesuai perjanjian yang ditandatangani</li><li>Refund policy berlaku sesuai tahapan proyek</li></ul>"
            }
        ]'::jsonb, -- Enhanced terms with HTML descriptions
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

-- Add user_id columns to all tables for user-specific data
-- This migration adds user authentication support to existing tables

-- Add user_id column to company_profile_templates
ALTER TABLE company_profile_templates 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to products
ALTER TABLE products 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to portfolios
ALTER TABLE portfolios 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to service_benefit_templates
ALTER TABLE service_benefit_templates 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to terms_condition_templates
ALTER TABLE terms_condition_templates 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to proposals
ALTER TABLE proposals 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to proposal_products (this table links to proposals, so it inherits user context)
ALTER TABLE proposal_products 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security on all tables
ALTER TABLE company_profile_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_benefit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_condition_templates ENABLE ROW LEVEL SECURITY;
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
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own proposal products" ON proposal_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proposal products" ON proposal_products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proposal products" ON proposal_products
    FOR DELETE USING (auth.uid() = user_id);

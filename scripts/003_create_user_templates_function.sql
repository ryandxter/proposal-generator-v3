-- Function to create default templates for new users
CREATE OR REPLACE FUNCTION create_default_templates_for_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Create default company profile template for the user
    INSERT INTO public.company_profile_templates (name, content, is_default, user_id)
    SELECT name, content, false, user_id
    FROM public.company_profile_templates
    WHERE is_default = true AND user_id IS NULL;

    -- Create default proposal template for the user
    INSERT INTO public.proposal_templates (name, content, is_default, user_id)
    SELECT name, content, false, user_id
    FROM public.proposal_templates
    WHERE is_default = true AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default templates for the new user
    PERFORM create_default_templates_for_user(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create templates when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

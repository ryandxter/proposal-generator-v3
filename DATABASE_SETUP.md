# Database Setup Guide

This guide explains how to set up the database for the Proposal Generator application on Vercel with Supabase.

## Quick Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run the Migration Script**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `scripts/000_complete_migration.sql`
   - Click "Run" to execute the script

3. **Configure Environment Variables**
   Add these to your Vercel project settings:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   \`\`\`

## Database Schema

### Tables Overview

- **company_profile_templates** - Company information templates
- **service_benefit_templates** - Service benefits templates  
- **terms_condition_templates** - Terms & conditions templates
- **products** - Products/services with pricing
- **portfolios** - Portfolio files and metadata
- **proposals** - Main proposals with all data
- **proposal_products** - Links proposals to products

### Key Features

- **UUID Primary Keys** - Better for distributed systems
- **Row Level Security (RLS)** - Multi-tenant data isolation
- **Automatic Timestamps** - Created/updated tracking
- **User Authentication** - Integrated with Supabase Auth
- **Default Templates** - Auto-created for new users
- **Comprehensive Indexing** - Optimized performance

### Security

All tables have Row Level Security enabled with policies that ensure:
- Users can only access their own data
- Proper authentication is required
- Data isolation between users

### Automatic Features

- **Default Templates**: New users automatically get default templates
- **Updated Timestamps**: Automatic `updated_at` field updates
- **User Isolation**: RLS policies prevent data leakage

## Deployment Steps

1. **Local Development**
   \`\`\`bash
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   
   # Run development server
   npm run dev
   \`\`\`

2. **Vercel Deployment**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push to main branch

3. **Database Migration**
   - Run the migration script in Supabase SQL Editor
   - Verify all tables are created correctly
   - Test user registration and template creation

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Ensure user is authenticated
   - Check that user_id matches auth.uid()

2. **Migration Errors**
   - Run script in parts if needed
   - Check for existing tables/functions
   - Verify extensions are enabled

3. **Environment Variables**
   - Double-check URLs and keys
   - Ensure NEXT_PUBLIC_ prefix for client-side vars
   - Restart development server after changes

### Verification

After setup, verify:
- [ ] All tables created successfully
- [ ] RLS policies are active
- [ ] User registration creates default templates
- [ ] Application can connect to database
- [ ] CRUD operations work correctly

## Maintenance

### Regular Tasks

- Monitor database performance
- Review and optimize queries
- Update RLS policies as needed
- Backup important data regularly
- Monitor storage usage

### Scaling Considerations

- Add database indexes for new query patterns
- Consider read replicas for high traffic
- Monitor connection pool usage
- Implement caching strategies

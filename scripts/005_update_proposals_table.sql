-- Update proposals table to match the new structure needed for proposal management
-- Add missing columns for better proposal management

-- Add title column for better identification
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Add type column (rename from proposal_type for consistency)
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS type VARCHAR(50) CHECK (type IN ('quotation', 'partnership'));

-- Add total_amount column for quick reference
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2) DEFAULT 0;

-- Add proposal_data column to store complete proposal information
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS proposal_data JSONB;

-- Add pdf_url column to store generated PDF location
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Update status values to match the new system
ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE proposals ADD CONSTRAINT proposals_status_check 
  CHECK (status IN ('draft', 'completed', 'sent'));

-- Copy data from old columns to new ones if they exist
UPDATE proposals 
SET type = proposal_type 
WHERE type IS NULL AND proposal_type IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_proposals_type ON proposals(type);
CREATE INDEX IF NOT EXISTS idx_proposals_title ON proposals(title);
CREATE INDEX IF NOT EXISTS idx_proposals_total_amount ON proposals(total_amount);

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for proposals table
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

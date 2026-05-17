-- Drop old constraints on verification_status
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_verification_status_check;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;

-- Migrate existing rows to match new logic
UPDATE campaigns SET verification_status = 'approved' WHERE verification_status = 'verified';
UPDATE campaigns SET verification_status = 'pending_hospital' WHERE verification_status = 'pending';

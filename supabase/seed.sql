-- MediFund AI — optional seed data (runs after migrations on `supabase db reset`).
-- Uncomment and adjust UUIDs when you have real auth.users rows.

-- Example transparency ledger rows (requires existing campaigns):
-- insert into public.campaign_transparency_entries (campaign_id, amount, transaction_type, bank_reference, status)
-- values
--   ('00000000-0000-0000-0000-000000000001', 25000.00, 'donation', 'LK-MOCK-QR-001', 'posted'),
--   ('00000000-0000-0000-0000-000000000001', 18000.00, 'payout', 'LK-MOCK-PAYOUT-221', 'posted');

-- Example notification:
-- insert into public.notifications (user_id, title, message)
-- values ('00000000-0000-0000-0000-000000000002', 'Verification queue', 'New campaign awaiting hospital attestation.');

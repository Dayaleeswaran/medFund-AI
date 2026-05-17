-- Default wallet currency LKR (matches app + Drizzle schema)
alter table public.wallets alter column currency set default 'LKR';

-- Normalize legacy rows created under USD default
update public.wallets
set currency = 'LKR'
where currency is null or currency = 'USD';

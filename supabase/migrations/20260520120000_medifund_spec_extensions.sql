-- MedFund AI — schema extensions aligned with product spec (public ledger, payouts, fraud, notifications).
-- Safe to apply after initial MediFund migrations.

alter table public.profiles add column if not exists email text;

alter table public.campaigns add column if not exists diagnosis text;
alter table public.campaigns add column if not exists story text;
alter table public.campaigns add column if not exists qr_code_url text;

alter table public.donations add column if not exists payment_method text default 'bank_transfer';
alter table public.donations add column if not exists transaction_reference text;

update public.donations d
set transaction_reference = coalesce(d.transaction_reference, d.payment_ref)
where d.transaction_reference is null and d.payment_ref is not null;

create index if not exists donations_campaign_id_idx on public.donations (campaign_id);
create index if not exists donations_donor_id_idx on public.donations (donor_id);

create table if not exists public.campaign_transparency_entries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  amount numeric(12, 2) not null,
  transaction_type text not null check (
    transaction_type in ('donation', 'payout', 'fee', 'adjustment')
  ),
  bank_reference text,
  status text not null default 'posted',
  created_at timestamptz default now()
);

create index if not exists campaign_transparency_campaign_idx
  on public.campaign_transparency_entries (campaign_id, created_at desc);

alter table public.campaign_transparency_entries enable row level security;

create policy "Transparency ledger readable"
  on public.campaign_transparency_entries for select using (true);

create policy "Authenticated insert ledger rows"
  on public.campaign_transparency_entries for insert with check (auth.uid() is not null);

create table if not exists public.hospital_payouts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  hospital_account text not null,
  amount numeric(12, 2) not null,
  payout_status text not null default 'pending' check (
    payout_status in ('pending', 'processing', 'completed', 'failed')
  ),
  created_at timestamptz default now()
);

create index if not exists hospital_payouts_campaign_idx on public.hospital_payouts (campaign_id);

alter table public.hospital_payouts enable row level security;

create policy "Payouts readable"
  on public.hospital_payouts for select using (true);

create policy "Hospital or admin inserts payouts"
  on public.hospital_payouts for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('hospital', 'admin')
    )
  );

create policy "Hospital or admin updates payouts"
  on public.hospital_payouts for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('hospital', 'admin')
    )
  );

create table if not exists public.fraud_analysis (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  fraud_score numeric(5, 2) not null default 0,
  ai_reasoning text,
  flagged boolean default false,
  created_at timestamptz default now()
);

create index if not exists fraud_analysis_campaign_idx on public.fraud_analysis (campaign_id, created_at desc);

alter table public.fraud_analysis enable row level security;

create policy "Fraud rows readable"
  on public.fraud_analysis for select using (true);

create policy "Authenticated fraud inserts"
  on public.fraud_analysis for insert with check (auth.uid() is not null);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Users read own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

create policy "Users insert notification self"
  on public.notifications for insert with check (auth.uid() = user_id);

create table if not exists public.campaign_favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, campaign_id)
);

alter table public.campaign_favorites enable row level security;

create policy "Favorites readable by owner"
  on public.campaign_favorites for select using (auth.uid() = user_id);

create policy "Favorites writable by owner"
  on public.campaign_favorites for insert with check (auth.uid() = user_id);

create policy "Favorites deletable by owner"
  on public.campaign_favorites for delete using (auth.uid() = user_id);

do $pub$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end
$pub$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text := coalesce(new.raw_user_meta_data->>'role', 'donor');
begin
  -- Never promote to hospital/admin from client metadata (admins assign roles in-console).
  if meta_role not in ('patient', 'donor') then
    meta_role := 'donor';
  end if;

  insert into public.profiles (id, full_name, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    meta_role,
    new.email
  )
  on conflict (id) do update
    set
      full_name = coalesce(
        nullif(excluded.full_name, ''),
        public.profiles.full_name
      ),
      email = coalesce(excluded.email, public.profiles.email),
      updated_at = now();

  insert into public.wallets (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

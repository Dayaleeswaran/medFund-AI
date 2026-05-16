-- MediFund AI — run in Supabase SQL Editor or via migrations
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text default 'donor' check (role in ('patient', 'donor', 'hospital', 'admin')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Campaigns
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  patient_name text not null,
  hospital_name text not null,
  title text not null,
  description text,
  medical_proof_url text,
  target_amount numeric(12,2) not null,
  raised_amount numeric(12,2) default 0,
  urgency text default 'high' check (urgency in ('critical', 'high', 'medium')),
  status text default 'pending_verification' check (status in ('draft', 'pending_verification', 'active', 'rejected', 'completed')),
  verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  fraud_score numeric(5,2) default 0,
  trust_score numeric(5,2) default 100,
  donor_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.campaigns enable row level security;

create policy "Campaigns are viewable by everyone"
  on public.campaigns for select using (true);

create policy "Authenticated users can create campaigns"
  on public.campaigns for insert with check (auth.uid() = user_id);

create policy "Owners can update campaigns"
  on public.campaigns for update using (auth.uid() = user_id);

-- Donations
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns (id) on delete cascade not null,
  donor_id uuid references public.profiles (id) on delete set null,
  amount numeric(12,2) not null,
  status text default 'completed',
  payment_ref text,
  created_at timestamptz default now()
);

alter table public.donations enable row level security;

create policy "Donations readable for campaign context"
  on public.donations for select using (true);

create policy "Authenticated users can donate"
  on public.donations for insert with check (auth.uid() = donor_id or donor_id is null);

-- Wallets
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade unique not null,
  balance numeric(12,2) default 0,
  currency text default 'USD',
  updated_at timestamptz default now()
);

alter table public.wallets enable row level security;

create policy "Users can view own wallet"
  on public.wallets for select using (auth.uid() = user_id);

create policy "Users can update own wallet"
  on public.wallets for update using (auth.uid() = user_id);

create policy "Users can insert own wallet"
  on public.wallets for insert with check (auth.uid() = user_id);

-- Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid references public.wallets (id) on delete cascade not null,
  type text not null check (type in ('inflow', 'outflow')),
  amount numeric(12,2) not null,
  description text,
  campaign_id uuid references public.campaigns (id) on delete set null,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Users view own transactions"
  on public.transactions for select
  using (
    exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid())
  );

create policy "System inserts transactions" -- tighten with service role in production
  on public.transactions for insert with check (
    exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid())
  );

-- Verifications (hospital/admin)
create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns (id) on delete cascade not null,
  reviewer_id uuid references public.profiles (id) on delete set null,
  status text not null check (status in ('approved', 'rejected')),
  notes text,
  created_at timestamptz default now()
);

alter table public.verifications enable row level security;

create policy "Verifications viewable"
  on public.verifications for select using (true);

create policy "Hospital role can insert verification"
  on public.verifications for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('hospital', 'admin')
    )
  );

-- AI risk scores
create table if not exists public.ai_risk_scores (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns (id) on delete cascade not null,
  risk_score numeric(5,2) not null,
  signals jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.ai_risk_scores enable row level security;

create policy "Risk scores viewable"
  on public.ai_risk_scores for select using (true);

create policy "Authenticated can insert risk scores"
  on public.ai_risk_scores for insert with check (auth.uid() is not null);

-- Realtime
alter publication supabase_realtime add table public.donations;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.campaigns;
alter publication supabase_realtime add table public.wallets;

-- Trigger: new user → profile + wallet
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'donor');
  insert into public.wallets (user_id, balance) values (new.id, 0);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

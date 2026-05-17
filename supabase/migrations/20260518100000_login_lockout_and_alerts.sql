-- Login lockout + admin security alerts (used by /api/auth/*)

create table if not exists public.login_credential_guards (
  email_norm text primary key,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_security_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null,
  summary text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

alter table public.login_credential_guards enable row level security;
alter table public.admin_security_alerts enable row level security;

create policy "No direct access login_credential_guards"
  on public.login_credential_guards for all using (false);

create policy "No direct access admin_security_alerts"
  on public.admin_security_alerts for all using (false);

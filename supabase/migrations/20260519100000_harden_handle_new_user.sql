-- Resilient signup: idempotent profile/wallet rows + explicit trigger wiring.
-- Requires public.profiles and public.wallets (see 20260516101500_medifund_initial.sql).
-- Apply with: supabase db push (or paste into SQL Editor after initial schema exists).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'donor'
  )
  on conflict (id) do update
    set
      full_name = coalesce(
        nullif(excluded.full_name, ''),
        public.profiles.full_name
      ),
      updated_at = now();

  insert into public.wallets (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

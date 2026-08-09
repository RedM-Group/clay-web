-- Run this after 001_initial_schema.sql on existing Clay projects.
alter table public.profiles add column if not exists full_name text not null default '';
alter table public.profiles add column if not exists phone text not null default '';
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$;

-- Existing users must complete the new account screen once.
update public.profiles set onboarding_completed = false where full_name = '' or phone = '';

-- Tell the Supabase Data API to recognize the new columns immediately.
select pg_notify('pgrst', 'reload schema');

create table if not exists public.profile_change_codes (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('phone')),
  pending_value text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, kind)
);

alter table public.profile_change_codes enable row level security;
-- Codes are intentionally accessible only through Clay's server service role.

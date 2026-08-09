create table if not exists public.drive_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(), ended_at timestamptz,
  status text not null default 'active' check (status in ('active','completed')),
  route jsonb not null default '[]'::jsonb, distance_meters double precision not null default 0,
  duration_seconds integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.properties add column if not exists drive_session_id uuid references public.drive_sessions(id) on delete set null;
create unique index if not exists drive_sessions_one_active_per_user on public.drive_sessions(user_id) where status='active';
create index if not exists drive_sessions_user_started_idx on public.drive_sessions(user_id,started_at desc);
create index if not exists properties_drive_session_idx on public.properties(drive_session_id) where drive_session_id is not null;
alter table public.drive_sessions enable row level security;
create policy "drive sessions own rows" on public.drive_sessions for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

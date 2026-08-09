create table if not exists public.property_research_checklists (
  property_id uuid primary key references public.properties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  owner boolean not null default false,
  mailing_address boolean not null default false,
  phone boolean not null default false,
  comps boolean not null default false,
  zoning boolean not null default false,
  taxes boolean not null default false,
  buyer_match boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists property_research_user_idx on public.property_research_checklists(user_id);
alter table public.property_research_checklists enable row level security;
create policy "property research own rows" on public.property_research_checklists for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

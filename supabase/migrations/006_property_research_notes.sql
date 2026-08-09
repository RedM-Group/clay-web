create table if not exists public.property_research_notes (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('general','owner','mailing_address','phone','comps','zoning','taxes','buyer_match','sources')),
  content text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(property_id,category)
);
create index if not exists property_research_notes_property_idx on public.property_research_notes(property_id);
alter table public.property_research_notes enable row level security;
create policy "property research notes own rows" on public.property_research_notes for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

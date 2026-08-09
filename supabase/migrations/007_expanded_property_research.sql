-- Clay expanded Research File. This migration is additive and preserves legacy research.
begin;
create table if not exists public.property_research (
  id uuid primary key default gen_random_uuid(), property_id uuid not null unique references public.properties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  research_status text not null default 'Not Started' check (research_status in ('Not Started','Researching','Needs Review','Research Complete')),
  bbl text default '', borough text default '', block text default '', lot text default '', lot_width numeric, lot_depth numeric, lot_area numeric,
  building_area numeric, number_of_buildings integer, stories numeric, residential_units integer, commercial_units integer, year_built integer,
  building_class text default '', tax_class text default '', current_use text default '',
  current_owner text default '', owner_type text default '', owner_mailing_address text default '', ownership_entity text default '', entity_type text default '', entity_status text default '', registration_state text default '', entity_formation_date date,
  acquisition_date date, acquisition_price numeric,
  primary_phone text default '', primary_email text default '', website text default '', decision_maker text default '', contact_verified boolean not null default false, verification_date date,
  zoning_district text default '', zoning_overlay text default '', special_district text default '', residential_far numeric, commercial_far numeric, community_far numeric,
  existing_floor_area numeric, historic_district text default '', landmark_status text default '', flood_zone text default '', development_notes text default '',
  last_sale_price numeric, last_sale_date date, assessed_value numeric, market_value numeric, annual_property_taxes numeric, tax_arrears numeric, estimated_mortgage_balance numeric, estimated_equity numeric,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);

create table if not exists public.property_research_items (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null, completed boolean not null default false, completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade,
  unique(property_id,item_key)
);
create table if not exists public.property_owner_people (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '', role text default '', phone text default '', email text default '', notes text default '', contact_id uuid references public.contacts(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);
create table if not exists public.property_contact_methods (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check(kind in ('Phone','Email')), value text not null, type text default 'Other', source text default '', verified boolean not null default false, notes text default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);
create table if not exists public.property_mortgages (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric, mortgage_date date, lender text default '', estimated_balance numeric, data_class text not null default 'User-entered' check(data_class in ('Official/recorded','User-entered','Estimated')), notes text default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);
create table if not exists public.property_liens (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  lien_type text not null default 'Lien', amount numeric, record_number text default '', record_date date, status text default '', data_class text not null default 'User-entered' check(data_class in ('Official/recorded','User-entered','Estimated')), notes text default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);
create table if not exists public.property_municipal_records (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, record_number text default '', record_date date, status text default '', description text default '', source_url text default '', notes text default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);
create table if not exists public.property_comps (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  comp_type text not null check(comp_type in ('Sales Comp','Land Comp')), address text not null default '', distance numeric, sale_price numeric, sale_date date, property_type text default '', lot_area numeric, building_area numeric, units integer,
  price_per_sf numeric generated always as (case when sale_price is not null and building_area > 0 then sale_price/building_area else null end) stored,
  price_per_unit numeric generated always as (case when sale_price is not null and units > 0 then sale_price/units else null end) stored,
  zoning text default '', notes text default '', source_url text default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);
create table if not exists public.property_research_sources (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  section_key text not null default 'general', record_id uuid, source_name text not null, source_url text default '', source_type text not null default 'Other', date_accessed date not null default current_date, verified boolean not null default false, notes text default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);
create table if not exists public.property_buyer_matches (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null, buyer_name text not null default '', match_percentage numeric check(match_percentage between 0 and 100), buy_box text default '', location_match boolean, property_type_match boolean, price_match boolean, zoning_match boolean, buildable_sf_match boolean, notes text default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);
create table if not exists public.property_outreach (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null default now(), contact text default '', method text not null check(method in ('Call','Text','Email','Letter','Meeting','Voicemail','Other')), outcome text not null default 'Other', notes text default '', follow_up_date date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);
create table if not exists public.property_photo_metadata (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade, property_photo_id uuid not null unique references public.property_photos(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'Other', captured_at timestamptz, latitude double precision, longitude double precision, notes text default '', uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);
create table if not exists public.property_opportunity_scores (
  id uuid primary key default gen_random_uuid(), property_id uuid not null unique references public.properties(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
  development_potential numeric check(development_potential between 0 and 100), owner_motivation numeric check(owner_motivation between 0 and 100), equity numeric check(equity between 0 and 100), market numeric check(market between 0 and 100), buyer_demand numeric check(buyer_demand between 0 and 100), property_condition numeric check(property_condition between 0 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade
);

-- Broaden note topics while retaining all old rows and topic keys.
alter table public.property_research_notes drop constraint if exists property_research_notes_category_check;
alter table public.property_research_notes add constraint property_research_notes_category_check check (category in ('general','owner','ownership','mailing_address','phone','contact','comps','zoning','development','taxes','financial','liens','dob','hpd','market','buyer_match','outreach','property_condition','sources','other'));

-- Seed one research file and migrate completed legacy checklist items without deleting legacy data.
insert into public.property_research(property_id,user_id,created_by)
select id,user_id,user_id from public.properties on conflict(property_id) do nothing;
insert into public.property_research_items(property_id,user_id,created_by,item_key,completed,completed_at)
select c.property_id,c.user_id,c.user_id,v.item_key,v.done,case when v.done then c.updated_at end
from public.property_research_checklists c cross join lateral (values
 ('owner',c.owner),('mailing_address',c.mailing_address),('phone',c.phone),('sales_comps',c.comps),('zoning',c.zoning),('taxes',c.taxes),('buyer_match',c.buyer_match)
) v(item_key,done) on conflict(property_id,item_key) do nothing;

do $$ declare t text; begin
  foreach t in array array['property_research','property_research_items','property_owner_people','property_contact_methods','property_mortgages','property_liens','property_municipal_records','property_comps','property_research_sources','property_buyer_matches','property_outreach','property_photo_metadata','property_opportunity_scores'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('drop policy if exists %I on public.%I',t||' own rows',t);
    execute format('create policy %I on public.%I for all using (auth.uid()=user_id) with check (auth.uid()=user_id)',t||' own rows',t);
  end loop;
end $$;
create index if not exists property_research_items_property_idx on public.property_research_items(property_id);
create index if not exists property_owner_people_property_idx on public.property_owner_people(property_id);
create index if not exists property_contact_methods_property_idx on public.property_contact_methods(property_id);
create index if not exists property_mortgages_property_idx on public.property_mortgages(property_id);
create index if not exists property_liens_property_idx on public.property_liens(property_id);
create index if not exists property_municipal_records_property_idx on public.property_municipal_records(property_id);
create index if not exists property_comps_property_idx on public.property_comps(property_id);
create index if not exists property_research_sources_property_idx on public.property_research_sources(property_id);
create index if not exists property_buyer_matches_property_idx on public.property_buyer_matches(property_id);
create index if not exists property_outreach_property_idx on public.property_outreach(property_id,occurred_at desc);
notify pgrst, 'reload schema';
commit;

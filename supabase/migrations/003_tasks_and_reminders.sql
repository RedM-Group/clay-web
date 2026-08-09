create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null,
  notes text not null default '',
  priority text not null default 'Normal' check (priority in ('Low','Normal','High','Urgent')),
  status text not null default 'Open' check (status in ('Open','Completed')),
  due_at timestamptz,
  reminder_at timestamptz,
  property_id uuid references public.properties(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not (property_id is not null and contact_id is not null))
);

create index if not exists tasks_user_status_due_idx on public.tasks(user_id,status,due_at);
create index if not exists tasks_user_reminder_idx on public.tasks(user_id,reminder_at) where status='Open';
create index if not exists tasks_property_idx on public.tasks(property_id) where property_id is not null;
create index if not exists tasks_contact_idx on public.tasks(contact_id) where contact_id is not null;

alter table public.tasks enable row level security;
drop policy if exists "tasks own rows" on public.tasks;
create policy "tasks own rows" on public.tasks for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

select pg_notify('pgrst','reload schema');

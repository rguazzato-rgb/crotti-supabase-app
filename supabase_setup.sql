-- Crotti Safety - setup Supabase per Next.js App Router
-- Eseguire in Supabase SQL Editor dopo avere creato il progetto.

-- FIX: gen_random_uuid() richiede pgcrypto nei progetti PostgreSQL/Supabase.
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can view their own data." on public.users;
drop policy if exists "Users can update their own data." on public.users;

create policy "Users can view their own data." on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own data." on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
-- FIX: search_path esplicito riduce i rischi nelle funzioni security definer.
$$ language plpgsql security definer set search_path = public, auth;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  scheduled_date date,
  priority text default 'Normale',
  client_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  priority text not null default 'Normale',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  requested_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  file_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.documents
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.documents
  add column if not exists name text;

alter table public.documents
  add column if not exists description text;

alter table public.documents
  add column if not exists file_url text;

alter table public.documents
  alter column id set default gen_random_uuid();

update public.documents
set name = coalesce(name, 'Documento')
where name is null;

update public.documents
set titolo_documento = coalesce(titolo_documento, name, 'Documento')
where titolo_documento is null;

create table if not exists public.fire_extinguishers (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  location text not null,
  status text not null default 'In Servizio' check (status in ('In Servizio', 'Scadenza Prossima', 'Manutenzione Richiesta', 'Fuori Servizio')),
  last_check date,
  created_at timestamptz default now()
);

alter table public.fire_extinguishers
  add column if not exists client_id uuid references auth.users(id) on delete set null;

alter table public.jobs enable row level security;
alter table public.service_requests enable row level security;
alter table public.documents enable row level security;
alter table public.fire_extinguishers enable row level security;

drop policy if exists "Authenticated users can read jobs." on public.jobs;
drop policy if exists "Authenticated users can insert service requests." on public.service_requests;
drop policy if exists "Authenticated users can read service requests." on public.service_requests;
drop policy if exists "Authenticated users can read documents." on public.documents;
drop policy if exists "Authenticated users can read extinguishers." on public.fire_extinguishers;

create policy "Authenticated users can read jobs." on public.jobs
  for select to authenticated using (auth.uid() = client_id);

create policy "Authenticated users can insert service requests." on public.service_requests
  for insert to authenticated with check (auth.uid() = requested_by);

create policy "Authenticated users can read service requests." on public.service_requests
  for select to authenticated using (auth.uid() = requested_by);

create policy "Authenticated users can read documents." on public.documents
  for select to authenticated using (auth.uid() = created_by);

create policy "Authenticated users can read extinguishers." on public.fire_extinguishers
  for select to authenticated using (auth.uid() = client_id);

-- Seed demo saltati: i nuovi utenti devono vedere solo dati reali associati
-- al proprio account tramite RLS.

delete from public.jobs
where title in (
  'Controllo Estintori Magazzino B',
  'Manutenzione Porte REI'
);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'title'
  ) then
    delete from public.events
    where title in (
      'Manutenzione Estintori - Sede Bergamo',
      'Ispezione Centrale Antincendio',
      'Verifica Porte REI - Magazzino Nord',
      'Test Allarme Evacuazione'
    );
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'titolo'
  ) then
    delete from public.events
    where titolo in (
      'Manutenzione Estintori - Sede Bergamo',
      'Ispezione Centrale Antincendio',
      'Verifica Porte REI - Magazzino Nord',
      'Test Allarme Evacuazione'
    );
  end if;
end $$;

-- Seed documenti saltato: alcune installazioni esistenti richiedono campi legacy
-- obbligatori come evento_id/url/titolo_documento. I documenti reali vengono creati
-- dalla dashboard admin rispettando lo schema del progetto.

-- Seed presidi saltato per evitare inventari fittizi sui nuovi account.

delete from public.fire_extinguishers
where (type = 'Polvere 6Kg' and location in ('Atrio ingresso', 'Atrio Ingresso'))
   or (type = 'CO2 5Kg' and location in ('Sala server', 'Sala Server'))
   or (type = 'Schiuma 6L' and location = 'Magazzino A')
   or (type = 'Polvere 9Kg' and location = 'Officina');

-- Admin aziendale Crotti
-- Eseguire anche su progetti Supabase gia avviati: le istruzioni sono idempotenti.

alter table public.users
  add column if not exists role text check (role in ('admin', 'user')) default 'user';

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into public.profiles (id, email, role, created_at)
select
  id,
  email,
  case when lower(email) = 'r.guazzato@studenti.unibg.it' then 'admin' else coalesce(role, 'user') end,
  coalesce(created_at, now())
from public.users
on conflict (id) do update
set
  email = excluded.email,
  role = case
    when lower(excluded.email) = 'r.guazzato@studenti.unibg.it' then 'admin'
    else public.profiles.role
  end;

update public.users
set role = 'admin'
where lower(email) = 'r.guazzato@studenti.unibg.it';

update public.profiles
set role = 'admin'
where lower(email) = 'r.guazzato@studenti.unibg.it';

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'pending',
  start_at timestamptz,
  end_at timestamptz,
  location text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  assigned_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text not null default 'Normale',
  start_at timestamptz not null,
  end_at timestamptz,
  scheduled_date date,
  location text,
  technician text,
  source text not null default 'manual',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.activities
  add column if not exists assigned_user_id uuid references auth.users(id) on delete cascade;

alter table public.activities
  add column if not exists title text;

alter table public.activities
  add column if not exists description text;

alter table public.activities
  add column if not exists status text default 'pending';

alter table public.activities
  add column if not exists priority text default 'Normale';

alter table public.activities
  add column if not exists start_at timestamptz;

alter table public.activities
  add column if not exists end_at timestamptz;

alter table public.activities
  add column if not exists scheduled_date date;

alter table public.activities
  add column if not exists location text;

alter table public.activities
  add column if not exists technician text;

alter table public.activities
  add column if not exists source text default 'manual';

alter table public.activities
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.activities
  add column if not exists updated_at timestamptz default now();

create index if not exists activities_assigned_user_id_idx on public.activities (assigned_user_id);
create index if not exists activities_start_at_idx on public.activities (start_at);

alter table public.events
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.activities enable row level security;

drop policy if exists "Users can view their own profile." on public.profiles;
drop policy if exists "Users can update their own profile." on public.profiles;
drop policy if exists "Admins can do everything on profiles." on public.profiles;
drop policy if exists "Admins can do everything on users." on public.users;
drop policy if exists "Authenticated users can read events." on public.events;
drop policy if exists "Admins full access on events." on public.events;
drop policy if exists "Users can read assigned activities." on public.activities;
drop policy if exists "Admins full access on activities." on public.activities;
drop policy if exists "Admins full access on documents." on public.documents;
drop policy if exists "Admins full access on jobs." on public.jobs;
drop policy if exists "Admins full access on service requests." on public.service_requests;
drop policy if exists "Admins full access on extinguishers." on public.fire_extinguishers;

create policy "Users can view their own profile." on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id and role = 'user');

create policy "Admins can do everything on profiles." on public.profiles
  for all to authenticated
  using (auth.email() = 'r.guazzato@studenti.unibg.it')
  with check (auth.email() = 'r.guazzato@studenti.unibg.it');

create policy "Admins can do everything on users." on public.users
  for all to authenticated
  using (auth.email() = 'r.guazzato@studenti.unibg.it')
  with check (auth.email() = 'r.guazzato@studenti.unibg.it');

create policy "Authenticated users can read events." on public.events
  for select to authenticated using (auth.uid() = created_by);

create policy "Admins full access on events." on public.events
  for all to authenticated
  using (auth.email() = 'r.guazzato@studenti.unibg.it')
  with check (auth.email() = 'r.guazzato@studenti.unibg.it');

create policy "Users can read assigned activities." on public.activities
  for select to authenticated using (auth.uid() = assigned_user_id);

create policy "Admins full access on activities." on public.activities
  for all to authenticated
  using (auth.email() = 'r.guazzato@studenti.unibg.it')
  with check (auth.email() = 'r.guazzato@studenti.unibg.it');

create policy "Admins full access on documents." on public.documents
  for all to authenticated
  using (auth.email() = 'r.guazzato@studenti.unibg.it')
  with check (auth.email() = 'r.guazzato@studenti.unibg.it');

create policy "Admins full access on jobs." on public.jobs
  for all to authenticated
  using (auth.email() = 'r.guazzato@studenti.unibg.it')
  with check (auth.email() = 'r.guazzato@studenti.unibg.it');

create policy "Admins full access on service requests." on public.service_requests
  for all to authenticated
  using (auth.email() = 'r.guazzato@studenti.unibg.it')
  with check (auth.email() = 'r.guazzato@studenti.unibg.it');

create policy "Admins full access on extinguishers." on public.fire_extinguishers
  for all to authenticated
  using (auth.email() = 'r.guazzato@studenti.unibg.it')
  with check (auth.email() = 'r.guazzato@studenti.unibg.it');

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (
    new.id,
    new.email,
    case when lower(new.email) = 'r.guazzato@studenti.unibg.it' then 'admin' else 'user' end
  )
  on conflict (id) do update set email = excluded.email, role = excluded.role;

  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when lower(new.email) = 'r.guazzato@studenti.unibg.it' then 'admin' else 'user' end
  )
  on conflict (id) do update set email = excluded.email, role = excluded.role;

  return new;
end;
$$ language plpgsql security definer set search_path = public, auth;

insert into storage.buckets (id, name, public)
values ('docs', 'docs', true)
on conflict (id) do nothing;

drop policy if exists "Admins can manage docs storage." on storage.objects;

create policy "Admins can manage docs storage." on storage.objects
  for all to authenticated
  using (bucket_id = 'docs' and auth.email() = 'r.guazzato@studenti.unibg.it')
  with check (bucket_id = 'docs' and auth.email() = 'r.guazzato@studenti.unibg.it');

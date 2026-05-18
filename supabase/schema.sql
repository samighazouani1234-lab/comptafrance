-- ComptaFrance Supabase schema
-- À exécuter dans Supabase > SQL Editor > New query > Run

create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Mon entreprise',
  legal_form text default '',
  siret text default '',
  vat_number text default '',
  address text default '',
  iban text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  number text not null,
  client_name text not null,
  client_email text default '',
  description text not null,
  amount_ht numeric(12,2) not null default 0,
  vat_rate numeric(5,2) not null default 20,
  amount_vat numeric(12,2) generated always as (round(amount_ht * vat_rate / 100, 2)) stored,
  amount_ttc numeric(12,2) generated always as (round(amount_ht + (amount_ht * vat_rate / 100), 2)) stored,
  status text not null default 'Brouillon' check (status in ('Brouillon','Envoyée','Payée','En retard')),
  issue_date date not null default current_date,
  due_date date not null default (current_date + interval '30 days'),
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  supplier_name text not null,
  description text not null,
  account_code text default '6064',
  amount_ht numeric(12,2) not null default 0,
  vat_rate numeric(5,2) not null default 20,
  amount_vat numeric(12,2) generated always as (round(amount_ht * vat_rate / 100, 2)) stored,
  status text not null default 'À payer' check (status in ('À payer','Payée','À rapprocher')),
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;
alter table public.invoices enable row level security;
alter table public.expenses enable row level security;

create policy "companies select own" on public.companies for select using (auth.uid() = user_id);
create policy "companies insert own" on public.companies for insert with check (auth.uid() = user_id);
create policy "companies update own" on public.companies for update using (auth.uid() = user_id);
create policy "companies delete own" on public.companies for delete using (auth.uid() = user_id);

create policy "invoices select own" on public.invoices for select using (auth.uid() = user_id);
create policy "invoices insert own" on public.invoices for insert with check (auth.uid() = user_id);
create policy "invoices update own" on public.invoices for update using (auth.uid() = user_id);
create policy "invoices delete own" on public.invoices for delete using (auth.uid() = user_id);

create policy "expenses select own" on public.expenses for select using (auth.uid() = user_id);
create policy "expenses insert own" on public.expenses for insert with check (auth.uid() = user_id);
create policy "expenses update own" on public.expenses for update using (auth.uid() = user_id);
create policy "expenses delete own" on public.expenses for delete using (auth.uid() = user_id);

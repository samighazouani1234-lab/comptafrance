-- ComptaFrance : accès payant par virement bancaire + comptes gratuits
-- À exécuter APRÈS schema.sql, dans Supabase > SQL Editor > Run

-- 1. Comptes gratuits / administrateurs (le propriétaire)
create table if not exists public.free_accounts (
  email text primary key,
  note text default '',
  created_at timestamptz not null default now()
);
alter table public.free_accounts enable row level security;
-- aucune policy : modifiable uniquement depuis le tableau de bord Supabase

insert into public.free_accounts (email, note)
values ('sami.ghazouani1234@gmail.com', 'Propriétaire')
on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from auth.users u
    join public.free_accounts f on lower(f.email) = lower(u.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;

-- 2. Abonnements
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'none' check (status in ('none','pending','active','expired')),
  paid_until timestamptz,
  requested_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
drop policy if exists "subscriptions select own" on public.subscriptions;
create policy "subscriptions select own" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin());

create or replace function public.has_access()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.subscriptions s
    where s.user_id = auth.uid() and s.status = 'active' and s.paid_until > now()
  );
$$;

-- L'utilisateur signale qu'il a fait son virement
create or replace function public.request_activation()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  insert into public.subscriptions (user_id, status, requested_at, updated_at)
  values (auth.uid(), 'pending', now(), now())
  on conflict (user_id) do update
    set status = case when public.subscriptions.status = 'active' and public.subscriptions.paid_until > now()
                      then 'active' else 'pending' end,
        requested_at = now(), updated_at = now();
end;
$$;

-- Admin : liste des utilisateurs
create or replace function public.admin_list_users()
returns table (user_id uuid, email text, created_at timestamptz, status text, paid_until timestamptz, requested_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Accès refusé'; end if;
  return query
    select u.id, u.email::text, u.created_at,
           case when s.status = 'active' and s.paid_until <= now() then 'expired' else coalesce(s.status, 'none') end,
           s.paid_until, s.requested_at
    from auth.users u
    left join public.subscriptions s on s.user_id = u.id
    order by (s.status = 'pending') desc nulls last, u.created_at desc;
end;
$$;

-- Admin : activer N mois (prolonge à partir de la date de fin) ou couper l'accès (months = 0)
create or replace function public.admin_set_access(target uuid, months int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Accès refusé'; end if;
  if months > 0 then
    insert into public.subscriptions (user_id, status, paid_until, updated_at)
    values (target, 'active', now() + make_interval(months => months), now())
    on conflict (user_id) do update
      set status = 'active',
          paid_until = greatest(coalesce(public.subscriptions.paid_until, now()), now()) + make_interval(months => months),
          updated_at = now();
  else
    insert into public.subscriptions (user_id, status, paid_until, updated_at)
    values (target, 'none', null, now())
    on conflict (user_id) do update set status = 'none', paid_until = null, updated_at = now();
  end if;
end;
$$;

grant execute on function public.is_admin(), public.has_access(), public.request_activation(),
  public.admin_list_users(), public.admin_set_access(uuid, int) to authenticated;

-- 3. Paramètres de paiement (IBAN, prix...) — lisibles par les connectés, modifiables par l'admin
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  price_label text not null default '9,90 € / mois',
  account_holder text not null default '',
  iban text not null default '',
  bic text not null default '',
  instructions text not null default 'Indique bien la référence dans le libellé du virement. Ton accès est activé dès réception (24 à 48 h).',
  updated_at timestamptz not null default now()
);
insert into public.app_settings (id) values (1) on conflict (id) do nothing;
alter table public.app_settings enable row level security;
drop policy if exists "settings read" on public.app_settings;
drop policy if exists "settings admin update" on public.app_settings;
create policy "settings read" on public.app_settings for select to authenticated using (true);
create policy "settings admin update" on public.app_settings for update using (public.is_admin()) with check (public.is_admin());

-- 4. Factures, achats, entreprises : réservé aux comptes gratuits ou abonnés
do $$
declare t text; op text;
begin
  foreach t in array array['companies','invoices','expenses'] loop
    foreach op in array array['select','insert','update','delete'] loop
      execute format('drop policy if exists %I on public.%I', t || ' ' || op || ' own', t);
    end loop;
    execute format('create policy %I on public.%I for select using (auth.uid() = user_id and public.has_access())', t || ' select own', t);
    execute format('create policy %I on public.%I for insert with check (auth.uid() = user_id and public.has_access())', t || ' insert own', t);
    execute format('create policy %I on public.%I for update using (auth.uid() = user_id and public.has_access())', t || ' update own', t);
    execute format('create policy %I on public.%I for delete using (auth.uid() = user_id and public.has_access())', t || ' delete own', t);
  end loop;
end $$;

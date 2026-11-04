-- ComptaFrance : journal des paiements (à exécuter après paywall.sql)

create table if not exists public.payment_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  reference text,
  action text not null check (action in ('virement_signale','activation','coupure')),
  months int default 0,
  price_label text,
  paid_until timestamptz,
  created_at timestamptz not null default now()
);
alter table public.payment_log enable row level security;
drop policy if exists "payment_log admin read" on public.payment_log;
create policy "payment_log admin read" on public.payment_log for select using (public.is_admin());
-- pas d'insert/update/delete depuis le site : le journal est rempli uniquement par les fonctions ci-dessous

create or replace function public.log_payment(target uuid, act text, m int)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.payment_log (user_id, email, reference, action, months, price_label, paid_until)
  select u.id, u.email, 'CF-' || upper(left(replace(u.id::text, '-', ''), 8)), act, m,
         (select price_label from public.app_settings where id = 1),
         (select paid_until from public.subscriptions where user_id = u.id)
  from auth.users u where u.id = target;
end;
$$;
revoke all on function public.log_payment(uuid, text, int) from public, anon, authenticated;

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
  perform public.log_payment(auth.uid(), 'virement_signale', 0);
end;
$$;

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
    perform public.log_payment(target, 'activation', months);
  else
    insert into public.subscriptions (user_id, status, paid_until, updated_at)
    values (target, 'none', null, now())
    on conflict (user_id) do update set status = 'none', paid_until = null, updated_at = now();
    perform public.log_payment(target, 'coupure', 0);
  end if;
end;
$$;

grant execute on function public.request_activation(), public.admin_set_access(uuid, int) to authenticated;

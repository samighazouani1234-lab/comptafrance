-- ComptaFrance : informations de la société pour la facturation (à exécuter après paywall.sql)

alter table public.companies
  add column if not exists trade_name text default '',
  add column if not exists share_capital text default '',
  add column if not exists postal_code text default '',
  add column if not exists city text default '',
  add column if not exists country text default 'France',
  add column if not exists rcs text default '',
  add column if not exists ape_code text default '',
  add column if not exists email text default '',
  add column if not exists phone text default '',
  add column if not exists website text default '',
  add column if not exists bic text default '',
  add column if not exists bank_name text default '',
  add column if not exists vat_exempt boolean not null default false,
  add column if not exists payment_terms text default 'Paiement à 30 jours à réception de facture, par virement.',
  add column if not exists late_penalty text default 'En cas de retard de paiement : pénalités au taux de 3 fois le taux d''intérêt légal et indemnité forfaitaire pour frais de recouvrement de 40 € (art. L441-10 et D441-5 du Code de commerce). Pas d''escompte pour paiement anticipé.',
  add column if not exists invoice_footer text default '',
  add column if not exists updated_at timestamptz not null default now();

-- une seule fiche société par utilisateur
create unique index if not exists companies_user_id_key on public.companies(user_id);

-- adresse du client sur les factures (mention obligatoire)
alter table public.invoices add column if not exists client_address text default '';

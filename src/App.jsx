import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  Banknote,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  Landmark,
  LayoutDashboard,
  Lock,
  MailCheck,
  Menu,
  PackageCheck,
  Percent,
  Plus,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Upload,
  Users,
  WalletCards,
} from "lucide-react";

const company = {
  name: "ComptaFrance Demo",
  legal: "SAS au capital de 10 000 €",
  siret: "912 345 678 00014",
  vat: "FR12912345678",
  address: "10 rue de la République, 75011 Paris",
  iban: "FR76 3000 4000 0500 0012 3456 789",
};

const vatRates = [
  { label: "20%", value: 20, usage: "Taux normal" },
  { label: "10%", value: 10, usage: "Taux intermédiaire" },
  { label: "5,5%", value: 5.5, usage: "Taux réduit" },
  { label: "2,1%", value: 2.1, usage: "Taux particulier" },
  { label: "0%", value: 0, usage: "Exonéré / hors champ" },
];

const clients = [
  { name: "Atelier Martin", type: "Client", siren: "812345678", email: "contact@atelier-martin.fr", balance: 0, status: "OK" },
  { name: "SAS Lumière", type: "Client", siren: "523456789", email: "finance@saslumiere.fr", balance: 3840, status: "À relancer" },
  { name: "Boulangerie Nord", type: "Client", siren: "434567890", email: "gestion@boulangerienord.fr", balance: 858, status: "Brouillon" },
  { name: "Papeterie Pro", type: "Fournisseur", siren: "345678901", email: "factures@papeteriepro.fr", balance: -240, status: "À payer" },
];

const invoices = [
  { id: "FAC-2026-001", client: "Atelier Martin", ht: 1250, vatRate: 20, vat: 250, status: "Payée", date: "2026-05-03", due: "2026-06-02", channel: "PDF" },
  { id: "FAC-2026-002", client: "SAS Lumière", ht: 3200, vatRate: 20, vat: 640, status: "À encaisser", date: "2026-05-08", due: "2026-06-07", channel: "Plateforme agréée" },
  { id: "FAC-2026-003", client: "Boulangerie Nord", ht: 780, vatRate: 10, vat: 78, status: "Brouillon", date: "2026-05-12", due: "2026-06-11", channel: "Brouillon" },
];

const expenses = [
  { id: "ACH-2026-018", supplier: "Papeterie Pro", label: "Fournitures bureau", ht: 200, vat: 40, account: "6064", status: "À payer" },
  { id: "ACH-2026-019", supplier: "Hébergeur Cloud", label: "Serveur applicatif", ht: 89, vat: 17.8, account: "626", status: "Payée" },
  { id: "ACH-2026-020", supplier: "Cabinet Expert", label: "Mission comptable", ht: 450, vat: 90, account: "6226", status: "À rapprocher" },
];

const accounts = [
  { code: "101", name: "Capital", className: "Classe 1 - Capitaux" },
  { code: "401", name: "Fournisseurs", className: "Classe 4 - Tiers" },
  { code: "411", name: "Clients", className: "Classe 4 - Tiers" },
  { code: "44566", name: "TVA déductible", className: "Classe 4 - État" },
  { code: "44571", name: "TVA collectée", className: "Classe 4 - État" },
  { code: "512", name: "Banque", className: "Classe 5 - Financiers" },
  { code: "6064", name: "Fournitures administratives", className: "Classe 6 - Charges" },
  { code: "607", name: "Achats de marchandises", className: "Classe 6 - Charges" },
  { code: "6226", name: "Honoraires", className: "Classe 6 - Charges" },
  { code: "626", name: "Frais postaux et télécommunications", className: "Classe 6 - Charges" },
  { code: "706", name: "Prestations de services", className: "Classe 7 - Produits" },
  { code: "707", name: "Ventes de marchandises", className: "Classe 7 - Produits" },
];

const journal = [
  { date: "2026-05-03", piece: "FAC-2026-001", account: "411", label: "Facture client Atelier Martin", debit: 1500, credit: 0 },
  { date: "2026-05-03", piece: "FAC-2026-001", account: "706", label: "Prestation de services", debit: 0, credit: 1250 },
  { date: "2026-05-03", piece: "FAC-2026-001", account: "44571", label: "TVA collectée 20%", debit: 0, credit: 250 },
  { date: "2026-05-04", piece: "BQ-2026-008", account: "512", label: "Encaissement bancaire", debit: 1500, credit: 0 },
  { date: "2026-05-04", piece: "BQ-2026-008", account: "411", label: "Lettrage client", debit: 0, credit: 1500 },
  { date: "2026-05-11", piece: "ACH-2026-018", account: "6064", label: "Fournitures administratives", debit: 200, credit: 0 },
  { date: "2026-05-11", piece: "ACH-2026-018", account: "44566", label: "TVA déductible", debit: 40, credit: 0 },
  { date: "2026-05-11", piece: "ACH-2026-018", account: "401", label: "Dette fournisseur", debit: 0, credit: 240 },
];

const bankLines = [
  { date: "2026-05-04", label: "VIR ATELIER MARTIN", amount: 1500, match: "FAC-2026-001", status: "Rapproché" },
  { date: "2026-05-09", label: "CB HEBERGEUR CLOUD", amount: -106.8, match: "ACH-2026-019", status: "Rapproché" },
  { date: "2026-05-15", label: "VIR SAS LUMIERE", amount: 0, match: "FAC-2026-002", status: "Attendu" },
];

const compliance = [
  { label: "Plan comptable général 2026", status: "Prévu", icon: BookOpen },
  { label: "Numérotation chronologique des factures", status: "Prévu", icon: FileCheck2 },
  { label: "Mentions légales vendeur / client", status: "Prévu", icon: Building2 },
  { label: "TVA collectée et déductible", status: "Prévu", icon: Percent },
  { label: "Export FEC à développer", status: "À faire", icon: Download },
  { label: "Archivage probant à développer", status: "À faire", icon: Archive },
  { label: "Piste d’audit fiable à documenter", status: "À faire", icon: ShieldCheck },
  { label: "Connexion plateforme agréée à prévoir", status: "À faire", icon: MailCheck },
];

const modules = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "tiers", label: "Clients & fournisseurs", icon: Users },
  { id: "factures", label: "Factures", icon: Receipt },
  { id: "achats", label: "Achats", icon: CreditCard },
  { id: "banque", label: "Banque", icon: Banknote },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "conformite", label: "Conformité", icon: ShieldCheck },
  { id: "parametres", label: "Paramètres", icon: Settings },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

function Card({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ children, className = "", variant = "default", ...props }) {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-slate-950 text-white hover:bg-slate-800",
    outline: "border border-slate-200 bg-white text-slate-950 hover:bg-slate-100",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  };
  return <button className={`${base} ${variants[variant] || variants.default} ${className}`} {...props}>{children}</button>;
}

function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-blue-100 text-blue-700",
    dark: "bg-white/10 text-white",
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function StatCard({ icon: Icon, label, value, helper, tone = "default" }) {
  const toneClass = tone === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-950";
  return (
    <Card className={`rounded-3xl border border-slate-200 shadow-sm ${toneClass}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-sm ${tone === "dark" ? "text-slate-300" : "text-slate-500"}`}>{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            <p className={`mt-1 text-xs ${tone === "dark" ? "text-slate-400" : "text-slate-500"}`}>{helper}</p>
          </div>
          <div className={`rounded-2xl p-3 ${tone === "dark" ? "bg-white/10" : "bg-slate-100"}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function DataTable({ columns, rows, renderRow }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
          <tr>{columns.map((column) => <th key={column} className="p-3 font-semibold">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [selectedVat, setSelectedVat] = useState(20);
  const [amountHT, setAmountHT] = useState(1000);
  const [query, setQuery] = useState("");

  const amountTVA = useMemo(() => amountHT * (selectedVat / 100), [amountHT, selectedVat]);
  const amountTTC = useMemo(() => amountHT + amountTVA, [amountHT, amountTVA]);
  const salesHT = invoices.reduce((sum, invoice) => sum + invoice.ht, 0);
  const collectedVat = invoices.reduce((sum, invoice) => sum + invoice.vat, 0);
  const deductibleVat = expenses.reduce((sum, expense) => sum + expense.vat, 0);
  const openReceivables = invoices.filter((invoice) => invoice.status !== "Payée").reduce((sum, invoice) => sum + invoice.ht + invoice.vat, 0);
  const openPayables = expenses.filter((expense) => expense.status !== "Payée").reduce((sum, expense) => sum + expense.ht + expense.vat, 0);
  const vatToPay = collectedVat - deductibleVat;
  const totalDebit = journal.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = journal.reduce((sum, entry) => sum + entry.credit, 0);
  const filteredAccounts = accounts.filter((account) => `${account.code} ${account.name} ${account.className}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-2 text-white"><Landmark className="h-6 w-6" /></div>
            <div>
              <p className="text-lg font-black tracking-tight">ComptaFrance</p>
              <p className="text-xs text-slate-500">Comptabilité française · prototype SaaS</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Badge tone="info">PCG 2026</Badge>
            <Badge tone="warning">E-facturation 2026</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import</Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Créer</Button>
            <Button variant="ghost" className="md:hidden"><Menu className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-3">
              <nav className="grid gap-1">
                {modules.map((module) => {
                  const Icon = module.icon;
                  const isActive = active === module.id;
                  return (
                    <button
                      key={module.id}
                      onClick={() => setActive(module.id)}
                      className={`flex items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition ${isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
                    >
                      <span className="flex items-center gap-3"><Icon className="h-4 w-4" /> {module.label}</span>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          <Card className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3 text-amber-900">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p className="text-sm">Prototype non certifié. À valider par un expert-comptable avant production.</p>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-slate-950 p-7 text-white shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge tone="dark">Exercice 2026 · France</Badge>
                <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">Pilotez vos factures, votre TVA et vos écritures comptables.</h1>
                <p className="mt-4 max-w-2xl text-slate-300">Interface complète pour TPE/PME : clients, fournisseurs, factures, achats, banque, journal, conformité et exports à brancher côté serveur.</p>
              </div>
              <div className="grid min-w-[260px] gap-2 rounded-3xl bg-white/10 p-4 text-sm">
                <p className="font-semibold">{company.name}</p>
                <p className="text-slate-300">SIRET : {company.siret}</p>
                <p className="text-slate-300">TVA : {company.vat}</p>
              </div>
            </div>
          </motion.section>

          {(active === "dashboard" || active === "conformite") && (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={TrendingUp} label="CA HT" value={formatCurrency(salesHT)} helper="Factures émises" tone="dark" />
              <StatCard icon={Receipt} label="TVA collectée" value={formatCurrency(collectedVat)} helper="Ventes du mois" />
              <StatCard icon={Percent} label="TVA estimée à payer" value={formatCurrency(vatToPay)} helper="Collectée - déductible" />
              <StatCard icon={WalletCards} label="Trésorerie attendue" value={formatCurrency(openReceivables - openPayables)} helper="Créances - dettes ouvertes" />
            </section>
          )}

          {active === "dashboard" && (
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <SectionTitle icon={BarChart3} title="Résumé mensuel" subtitle="Vue rapide de l’activité et des points à traiter." />
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      ["Factures à encaisser", formatCurrency(openReceivables), "Relance client à prévoir"],
                      ["Achats à payer", formatCurrency(openPayables), "Validation fournisseur"],
                      ["Écritures journal", journal.length, totalDebit === totalCredit ? "Journal équilibré" : "Écart à corriger"],
                      ["Factures e-reporting", "À connecter", "Plateforme agréée requise"],
                    ].map(([label, value, helper]) => (
                      <div key={label} className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">{label}</p>
                        <p className="mt-1 text-2xl font-bold">{value}</p>
                        <p className="mt-1 text-xs text-slate-500">{helper}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <SectionTitle icon={Percent} title="Calculateur TVA" subtitle="Calcule HT, TVA et TTC." />
                  <label className="text-sm font-medium">Montant HT
                    <input type="number" value={amountHT} onChange={(event) => setAmountHT(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" />
                  </label>
                  <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
                    {vatRates.map((rate) => (
                      <button key={rate.label} onClick={() => setSelectedVat(rate.value)} className={`rounded-2xl border p-3 text-sm ${selectedVat === rate.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}>
                        <span className="block font-bold">{rate.label}</span>
                        <span className="block text-xs opacity-70">{rate.usage}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 rounded-2xl bg-slate-100 p-4 md:grid-cols-3">
                    <div><p className="text-xs text-slate-500">HT</p><p className="font-bold">{formatCurrency(amountHT)}</p></div>
                    <div><p className="text-xs text-slate-500">TVA</p><p className="font-bold">{formatCurrency(amountTVA)}</p></div>
                    <div><p className="text-xs text-slate-500">TTC</p><p className="font-bold">{formatCurrency(amountTTC)}</p></div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {active === "tiers" && (
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm"><CardContent className="p-6">
              <SectionTitle icon={Users} title="Clients & fournisseurs" subtitle="Fiches tiers avec SIREN, email, solde et statut." action={<Button><Plus className="mr-2 h-4 w-4" /> Nouveau tiers</Button>} />
              <DataTable columns={["Nom", "Type", "SIREN", "Email", "Solde", "Statut"]} rows={clients} renderRow={(item) => (
                <tr key={item.name}><td className="p-3 font-semibold">{item.name}</td><td className="p-3">{item.type}</td><td className="p-3">{item.siren}</td><td className="p-3">{item.email}</td><td className="p-3">{formatCurrency(item.balance)}</td><td className="p-3"><Badge tone={item.status === "OK" ? "success" : item.status === "À relancer" ? "warning" : "info"}>{item.status}</Badge></td></tr>
              )} />
            </CardContent></Card>
          )}

          {active === "factures" && (
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm"><CardContent className="p-6">
              <SectionTitle icon={Receipt} title="Factures de vente" subtitle="Numérotation, statut, échéance, TVA et canal de transmission." action={<Button><Plus className="mr-2 h-4 w-4" /> Nouvelle facture</Button>} />
              <DataTable columns={["N°", "Client", "Date", "Échéance", "HT", "TVA", "TTC", "Canal", "Statut"]} rows={invoices} renderRow={(invoice) => (
                <tr key={invoice.id}><td className="p-3 font-semibold">{invoice.id}</td><td className="p-3">{invoice.client}</td><td className="p-3">{invoice.date}</td><td className="p-3">{invoice.due}</td><td className="p-3">{formatCurrency(invoice.ht)}</td><td className="p-3">{formatCurrency(invoice.vat)}</td><td className="p-3">{formatCurrency(invoice.ht + invoice.vat)}</td><td className="p-3">{invoice.channel}</td><td className="p-3"><Badge tone={invoice.status === "Payée" ? "success" : invoice.status === "Brouillon" ? "warning" : "info"}>{invoice.status}</Badge></td></tr>
              )} />
            </CardContent></Card>
          )}

          {active === "achats" && (
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm"><CardContent className="p-6">
              <SectionTitle icon={CreditCard} title="Achats & dépenses" subtitle="Saisie fournisseur, compte de charge, TVA déductible et statut." action={<Button><Plus className="mr-2 h-4 w-4" /> Ajouter un achat</Button>} />
              <DataTable columns={["Pièce", "Fournisseur", "Libellé", "Compte", "HT", "TVA", "TTC", "Statut"]} rows={expenses} renderRow={(expense) => (
                <tr key={expense.id}><td className="p-3 font-semibold">{expense.id}</td><td className="p-3">{expense.supplier}</td><td className="p-3">{expense.label}</td><td className="p-3">{expense.account}</td><td className="p-3">{formatCurrency(expense.ht)}</td><td className="p-3">{formatCurrency(expense.vat)}</td><td className="p-3">{formatCurrency(expense.ht + expense.vat)}</td><td className="p-3"><Badge tone={expense.status === "Payée" ? "success" : "warning"}>{expense.status}</Badge></td></tr>
              )} />
            </CardContent></Card>
          )}

          {active === "banque" && (
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm"><CardContent className="p-6">
              <SectionTitle icon={Banknote} title="Banque & rapprochement" subtitle="Import bancaire, lettrage et suivi des règlements." action={<Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import CSV</Button>} />
              <DataTable columns={["Date", "Libellé bancaire", "Montant", "Pièce liée", "Statut"]} rows={bankLines} renderRow={(line) => (
                <tr key={`${line.date}-${line.label}`}><td className="p-3">{line.date}</td><td className="p-3 font-semibold">{line.label}</td><td className="p-3">{formatCurrency(line.amount)}</td><td className="p-3">{line.match}</td><td className="p-3"><Badge tone={line.status === "Rapproché" ? "success" : "warning"}>{line.status}</Badge></td></tr>
              )} />
            </CardContent></Card>
          )}

          {active === "journal" && (
            <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm"><CardContent className="p-6">
                <SectionTitle icon={BookOpen} title="Plan comptable" subtitle="Recherche dans les comptes usuels du prototype." />
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher : 411, TVA, banque..." className="w-full bg-transparent py-1 text-sm outline-none" />
                </div>
                <div className="grid max-h-[420px] gap-2 overflow-auto pr-1">
                  {filteredAccounts.map((account) => <div key={account.code} className="rounded-2xl border border-slate-100 bg-slate-50 p-3"><p className="font-semibold">{account.code} · {account.name}</p><p className="text-xs text-slate-500">{account.className}</p></div>)}
                </div>
              </CardContent></Card>
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm"><CardContent className="p-6">
                <SectionTitle icon={FileText} title="Journal comptable" subtitle={`Débit ${formatCurrency(totalDebit)} / Crédit ${formatCurrency(totalCredit)}`} action={<Badge tone={totalDebit === totalCredit ? "success" : "danger"}>{totalDebit === totalCredit ? "Équilibré" : "Déséquilibré"}</Badge>} />
                <DataTable columns={["Date", "Pièce", "Compte", "Libellé", "Débit", "Crédit"]} rows={journal} renderRow={(entry, index) => (
                  <tr key={`${entry.piece}-${entry.account}-${index}`}><td className="p-3">{entry.date}</td><td className="p-3">{entry.piece}</td><td className="p-3 font-semibold">{entry.account}</td><td className="p-3">{entry.label}</td><td className="p-3">{entry.debit ? formatCurrency(entry.debit) : "—"}</td><td className="p-3">{entry.credit ? formatCurrency(entry.credit) : "—"}</td></tr>
                )} />
              </CardContent></Card>
            </section>
          )}

          {active === "conformite" && (
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm"><CardContent className="p-6">
              <SectionTitle icon={ShieldCheck} title="Centre de conformité" subtitle="Points à prévoir pour une version française sérieuse." />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {compliance.map((item) => {
                  const Icon = item.icon;
                  return <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><Icon className="h-5 w-5 text-slate-700" /><p className="mt-3 font-semibold">{item.label}</p><p className="mt-2"><Badge tone={item.status === "Prévu" ? "success" : "warning"}>{item.status}</Badge></p></div>;
                })}
              </div>
              <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
                <div className="flex items-start gap-3"><Lock className="h-5 w-5 shrink-0" /><p className="text-sm text-slate-300"><strong className="text-white">À développer côté back-end :</strong> comptes utilisateurs, droits d’accès, base PostgreSQL, stockage pièces justificatives, génération PDF, export FEC, journal immuable, sauvegardes, logs d’audit, connexion future à une plateforme agréée.</p></div>
              </div>
            </CardContent></Card>
          )}

          {active === "parametres" && (
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm"><CardContent className="p-6">
              <SectionTitle icon={Settings} title="Paramètres entreprise" subtitle="Informations utilisées sur les factures et exports." action={<Button><BadgeCheck className="mr-2 h-4 w-4" /> Enregistrer</Button>} />
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries({ "Raison sociale": company.name, "Forme juridique": company.legal, "SIRET": company.siret, "TVA intracommunautaire": company.vat, "Adresse": company.address, "IBAN": company.iban }).map(([label, value]) => (
                  <label key={label} className="text-sm font-medium text-slate-700">{label}<input defaultValue={value} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950 outline-none focus:border-slate-950" /></label>
                ))}
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export FEC</Button>
                <Button variant="outline"><PackageCheck className="mr-2 h-4 w-4" /> Export factures</Button>
                <Button variant="outline"><CalendarDays className="mr-2 h-4 w-4" /> Clôture exercice</Button>
              </div>
            </CardContent></Card>
          )}
        </main>
      </div>
    </div>
  );
}

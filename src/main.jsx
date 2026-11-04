import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import './styles.css'

const demoInvoices = [
  { id: 'demo-1', number: 'FAC-2026-001', client_name: 'Atelier Martin', client_email: 'contact@atelier.fr', description: 'Prestation de conseil', amount_ht: 1250, vat_rate: 20, amount_vat: 250, amount_ttc: 1500, status: 'Payée', issue_date: '2026-05-03', due_date: '2026-06-02' },
  { id: 'demo-2', number: 'FAC-2026-002', client_name: 'SAS Lumière', client_email: 'finance@saslumiere.fr', description: 'Développement site web', amount_ht: 3200, vat_rate: 20, amount_vat: 640, amount_ttc: 3840, status: 'Envoyée', issue_date: '2026-05-08', due_date: '2026-06-07' },
  { id: 'demo-3', number: 'FAC-2026-003', client_name: 'Boulangerie Nord', client_email: 'gestion@boulangerienord.fr', description: 'Maintenance mensuelle', amount_ht: 780, vat_rate: 10, amount_vat: 78, amount_ttc: 858, status: 'Brouillon', issue_date: '2026-05-12', due_date: '2026-06-11' }
]

const demoExpenses = [
  { id: 'dep-1', supplier_name: 'Papeterie Pro', description: 'Fournitures bureau', account_code: '6064', amount_ht: 200, vat_rate: 20, amount_vat: 40, status: 'À payer' },
  { id: 'dep-2', supplier_name: 'Hébergeur Cloud', description: 'Serveur applicatif', account_code: '626', amount_ht: 89, vat_rate: 20, amount_vat: 17.8, status: 'Payée' }
]

const accounts = ['401 Fournisseurs', '411 Clients', '44566 TVA déductible', '44571 TVA collectée', '512 Banque', '6064 Fournitures', '6226 Honoraires', '706 Prestations', '707 Ventes']

function money(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n || 0))
}

function todayPlus(days) {
  const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0,10)
}

function download(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function invoiceHtml(invoice) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${invoice.number}</title><style>body{font-family:Arial;margin:40px;color:#111}.top{display:flex;justify-content:space-between}.box{border:1px solid #ddd;border-radius:14px;padding:18px;margin:20px 0}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border-bottom:1px solid #ddd;padding:12px;text-align:left}.total{font-size:24px;font-weight:800;text-align:right}.muted{color:#666}</style></head><body><div class="top"><div><h1>ComptaFrance</h1><p class="muted">Facture conforme démo</p></div><div><h2>${invoice.number}</h2><p>Date : ${invoice.issue_date}</p><p>Échéance : ${invoice.due_date}</p></div></div><div class="box"><strong>Client</strong><p>${invoice.client_name}</p><p>${invoice.client_email || ''}</p></div><table><thead><tr><th>Description</th><th>HT</th><th>TVA</th><th>TTC</th></tr></thead><tbody><tr><td>${invoice.description}</td><td>${money(invoice.amount_ht)}</td><td>${invoice.vat_rate}% - ${money(invoice.amount_vat)}</td><td>${money(invoice.amount_ttc)}</td></tr></tbody></table><p class="total">Total TTC : ${money(invoice.amount_ttc)}</p><p class="muted">Prototype : validation expert-comptable recommandée avant usage officiel.</p></body></html>`
}

function Login({ onSession }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')

  async function submit(e) {
    e.preventDefault()
    setMessage('')
    if (!isSupabaseConfigured) {
      setMessage('Supabase n’est pas encore configuré. Ajoute les variables Vercel.')
      return
    }
    const { data, error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
    if (error) setMessage(error.message)
    else {
      setMessage(mode === 'login' ? 'Connexion réussie.' : 'Compte créé. Vérifie ton email si la confirmation est activée.')
      if (data.session) onSession(data.session)
    }
  }

  return <div className="loginPage">
    <div className="loginCard">
      <div className="brand">ComptaFrance <span>Supabase</span></div>
      <h1>Comptabilité française connectée</h1>
      <p>Compte utilisateur, factures sauvegardées sur Supabase, exports et téléchargement de facture.</p>
      <form onSubmit={submit} className="form">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" type="password" required minLength="6" />
        <button>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</button>
      </form>
      <button className="linkBtn" onClick={()=>setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Créer un compte' : 'J’ai déjà un compte'}</button>
      {message && <p className="message">{message}</p>}
      {!isSupabaseConfigured && <p className="warning">Mode démo : renseigne VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sur Vercel.</p>}
    </div>
  </div>
}

function App() {
  const [session, setSession] = useState(null)
  const [invoices, setInvoices] = useState(demoInvoices)
  const [expenses, setExpenses] = useState(demoExpenses)
  const [tab, setTab] = useState('dashboard')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ client_name: '', client_email: '', description: '', amount_ht: 1000, vat_rate: 20, status: 'Brouillon', due_date: todayPlus(30) })

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const [access, setAccess] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [settings, setSettings] = useState(null)

  async function checkAccess() {
    const [{ data: ok, error: e1 }, { data: admin }, { data: sub }, { data: conf }] = await Promise.all([
      supabase.rpc('has_access'),
      supabase.rpc('is_admin'),
      supabase.from('subscriptions').select('*').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('app_settings').select('*').eq('id', 1).maybeSingle()
    ])
    setIsAdmin(Boolean(admin))
    setSubscription(sub || null)
    setSettings(conf || null)
    setAccess(e1 ? false : Boolean(ok))
    if (ok) loadData()
  }

  useEffect(() => {
    if (session) { setAccess(null); checkAccess() }
    else { setAccess(null); setIsAdmin(false); setInvoices(demoInvoices); setExpenses(demoExpenses) }
  }, [session])

  async function loadData() {
    const { data: inv } = await supabase.from('invoices').select('*').order('created_at', { ascending: false })
    const { data: dep } = await supabase.from('expenses').select('*').order('created_at', { ascending: false })
    if (inv) setInvoices(inv)
    if (dep) setExpenses(dep)
  }

  async function createInvoice(e) {
    e.preventDefault()
    const number = `FAC-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3,'0')}`
    const base = { ...form, number, issue_date: new Date().toISOString().slice(0,10), amount_ht: Number(form.amount_ht), vat_rate: Number(form.vat_rate) }
    setSaving(true)
    if (session && isSupabaseConfigured) {
      const { data, error } = await supabase.from('invoices').insert({ ...base, user_id: session.user.id }).select().single()
      if (!error && data) setInvoices([data, ...invoices])
      else alert(error?.message || 'Erreur création facture')
    } else {
      const amount_vat = Math.round(base.amount_ht * base.vat_rate) / 100
      setInvoices([{ id: crypto.randomUUID(), ...base, amount_vat, amount_ttc: base.amount_ht + amount_vat }, ...invoices])
    }
    setSaving(false)
    setForm({ client_name: '', client_email: '', description: '', amount_ht: 1000, vat_rate: 20, status: 'Brouillon', due_date: todayPlus(30) })
  }

  async function signOut() {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    setSession(null)
  }

  const stats = useMemo(() => {
    const ca = invoices.reduce((s,i)=>s+Number(i.amount_ht||0),0)
    const tva = invoices.reduce((s,i)=>s+Number(i.amount_vat||0),0)
    const deductible = expenses.reduce((s,e)=>s+Number(e.amount_vat||0),0)
    const receivables = invoices.filter(i=>i.status!=='Payée').reduce((s,i)=>s+Number(i.amount_ttc||0),0)
    return { ca, tva, due: tva-deductible, receivables }
  }, [invoices, expenses])

  function exportCsv() {
    const rows = [['Numero','Client','Email','Description','HT','TVA','TTC','Statut','Date','Echeance'], ...invoices.map(i=>[i.number,i.client_name,i.client_email,i.description,i.amount_ht,i.amount_vat,i.amount_ttc,i.status,i.issue_date,i.due_date])]
    download('factures-comptafrance.csv', rows.map(r=>r.map(v=>`"${String(v ?? '').replaceAll('"','""')}"`).join(';')).join('\n'), 'text/csv')
  }

  if (!session && isSupabaseConfigured) return <Login onSession={setSession} />
  if (session && access === null) return <div className="loginPage"><div className="loginCard"><p>Chargement de ton espace…</p></div></div>
  if (session && access === false) return <Paywall session={session} subscription={subscription} settings={settings} onRefresh={checkAccess} onSignOut={signOut} />

  const tabs = ['dashboard','factures','achats','journal','conformite','compte', ...(isAdmin ? ['admin'] : [])]

  return <div>
    <header className="topbar">
      <div><strong>ComptaFrance</strong><span>Production Supabase</span></div>
      <nav>{tabs.map(t=><button key={t} className={tab===t?'active':''} onClick={e=>{setTab(t); e.currentTarget.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})}}>{t}</button>)}</nav>
      <button onClick={signOut} className="ghost">Déconnexion</button>
    </header>

    <main className="container">
      <section className={`hero ${tab !== 'dashboard' ? 'heroSub' : ''}`}>
        <div><span className="pill">France · PCG · TVA · Supabase</span><h1>Comptabilité française premium avec compte et factures sauvegardées.</h1><p>Crée, stocke, exporte et télécharge tes factures depuis un espace connecté Supabase.</p></div>
        <div className="heroCard"><b>Statut</b><p>{isSupabaseConfigured ? 'Supabase configuré' : 'Mode démo local'}</p><small>{session?.user?.email || 'Aucune session connectée'}</small></div>
      </section>

      {tab === 'dashboard' && <>
        <section className="stats">
          <Card title="CA HT" value={money(stats.ca)} text="Factures émises" />
          <Card title="TVA collectée" value={money(stats.tva)} text="Selon factures" />
          <Card title="TVA estimée" value={money(stats.due)} text="Collectée - déductible" />
          <Card title="À encaisser TTC" value={money(stats.receivables)} text="Créances ouvertes" />
        </section>
        <section className="panel"><h2>Production</h2><p>Cette version est prête à être connectée à Supabase : Auth, tables sécurisées RLS, factures, achats, export CSV et téléchargement HTML imprimable PDF.</p></section>
      </>}

      {tab === 'factures' && <section className="grid2">
        <div className="panel"><h2>Créer une facture</h2><form onSubmit={createInvoice} className="form wide">
          <input placeholder="Client" value={form.client_name} onChange={e=>setForm({...form, client_name:e.target.value})} required />
          <input placeholder="Email client" value={form.client_email} onChange={e=>setForm({...form, client_email:e.target.value})} />
          <input placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required />
          <input type="number" placeholder="Montant HT" value={form.amount_ht} onChange={e=>setForm({...form, amount_ht:e.target.value})} required />
          <select value={form.vat_rate} onChange={e=>setForm({...form, vat_rate:e.target.value})}><option>20</option><option>10</option><option>5.5</option><option>2.1</option><option>0</option></select>
          <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}><option>Brouillon</option><option>Envoyée</option><option>Payée</option><option>En retard</option></select>
          <input type="date" value={form.due_date} onChange={e=>setForm({...form, due_date:e.target.value})} />
          <button disabled={saving}>{saving ? 'Enregistrement...' : 'Créer et sauvegarder'}</button>
        </form></div>
        <div className="panel"><div className="panelHead"><h2>Factures</h2><button onClick={exportCsv}>Exporter CSV</button></div><Table invoices={invoices} /></div>
      </section>}

      {tab === 'achats' && <section className="panel"><h2>Achats</h2><table><thead><tr><th>Fournisseur</th><th>Description</th><th>Compte</th><th>HT</th><th>TVA</th><th>Statut</th></tr></thead><tbody>{expenses.map(e=><tr key={e.id}><td>{e.supplier_name}</td><td>{e.description}</td><td>{e.account_code}</td><td>{money(e.amount_ht)}</td><td>{money(e.amount_vat)}</td><td>{e.status}</td></tr>)}</tbody></table></section>}
      {tab === 'journal' && <section className="panel"><h2>Plan comptable & journal</h2><div className="accountGrid">{accounts.map(a=><div key={a}>{a}</div>)}</div><p className="muted">Journal réel à générer côté serveur à partir des factures, achats et règlements.</p></section>}
      {tab === 'conformite' && <section className="panel"><h2>Conformité française</h2><div className="checks"><span>✓ RLS Supabase</span><span>✓ Auth utilisateur</span><span>✓ TVA française</span><span>✓ Numérotation facture</span><span>À faire : PDF serveur</span><span>À faire : export FEC</span><span>À faire : archivage probant</span><span>À faire : plateforme agréée e-facturation</span></div></section>}
      {tab === 'compte' && <section className="panel"><h2>Mon compte</h2><p>Email : {session?.user?.email || 'Mode démo'}</p><p>Abonnement : {isAdmin ? 'Compte gratuit (propriétaire)' : subscription?.paid_until ? `actif jusqu'au ${frDate(subscription.paid_until)}` : '—'}</p><p>Projet Supabase : {isSupabaseConfigured ? 'connecté' : 'non configuré'}</p><button onClick={signOut}>Déconnexion</button></section>}
      {tab === 'admin' && isAdmin && <AdminPanel settings={settings} onSettings={setSettings} />}
    </main>
  </div>
}

function frDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '—'
}

function payRef(userId) {
  return 'CF-' + String(userId || '').replace(/-/g, '').slice(0, 8).toUpperCase()
}

function Paywall({ session, subscription, settings, onRefresh, onSignOut }) {
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const ref = payRef(session.user.id)
  const pending = subscription?.status === 'pending'
  const expired = subscription?.paid_until && new Date(subscription.paid_until) <= new Date()

  async function declare() {
    setSending(true); setMessage('')
    const { error } = await supabase.rpc('request_activation')
    setSending(false)
    if (error) setMessage(error.message)
    else { setMessage('Merci ! Ton virement est signalé. Ton accès sera activé dès réception.'); onRefresh() }
  }

  return <div className="loginPage">
    <div className="loginCard">
      <div className="brand">ComptaFrance <span>Abonnement</span></div>
      <h1>{expired ? 'Ton abonnement a expiré' : 'Active ton accès'}</h1>
      <p>Abonnement : <b>{settings?.price_label || '9,90 € / mois'}</b>, à régler par virement bancaire.</p>
      {settings?.iban
        ? <div className="payBox">
            <p><span>Titulaire</span><b>{settings.account_holder}</b></p>
            <p><span>IBAN</span><b>{settings.iban}</b></p>
            {settings.bic && <p><span>BIC</span><b>{settings.bic}</b></p>}
            <p><span>Référence à indiquer</span><b>{ref}</b></p>
          </div>
        : <p className="warning">Les coordonnées bancaires seront bientôt affichées ici.</p>}
      <p className="muted">{settings?.instructions}</p>
      {pending
        ? <p className="message">Virement signalé le {frDate(subscription.requested_at)} : activation en attente de réception.</p>
        : <button disabled={sending} onClick={declare}>{sending ? 'Envoi…' : "J'ai fait le virement"}</button>}
      <button className="linkBtn" onClick={onRefresh}>Actualiser</button>
      <button className="linkBtn" onClick={onSignOut}>Déconnexion ({session.user.email})</button>
      {message && <p className="message">{message}</p>}
    </div>
  </div>
}

function AdminPanel({ settings, onSettings }) {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState(settings || {})
  const [saved, setSaved] = useState('')

  const [log, setLog] = useState([])

  async function load() {
    const { data, error } = await supabase.rpc('admin_list_users')
    if (error) setError(error.message); else { setError(''); setUsers(data || []) }
    const { data: entries } = await supabase.from('payment_log').select('*').order('created_at', { ascending: false }).limit(1000)
    setLog(entries || [])
  }

  const actionLabels = { virement_signale: 'Virement signalé', activation: 'Activation', coupure: 'Accès coupé' }

  function exportLog() {
    const rows = [['Date', 'Email', 'Référence', 'Action', 'Mois', 'Tarif', 'Accès jusqu’au'],
      ...log.map(l => [new Date(l.created_at).toLocaleString('fr-FR'), l.email, l.reference, actionLabels[l.action] || l.action, l.months || '', l.price_label || '', frDate(l.paid_until)])]
    download('journal-paiements-comptafrance.csv', '﻿' + rows.map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(';')).join('\n'), 'text/csv')
  }
  useEffect(() => { load() }, [])
  useEffect(() => { if (settings) setForm(settings) }, [settings])

  async function setAccess(id, months) {
    if (months === 0 && !confirm('Couper l’accès de cet utilisateur ?')) return
    const { error } = await supabase.rpc('admin_set_access', { target: id, months })
    if (error) alert(error.message); else load()
  }

  async function saveSettings(e) {
    e.preventDefault(); setSaved('')
    const { price_label, account_holder, iban, bic, instructions } = form
    const { data, error } = await supabase.from('app_settings')
      .update({ price_label, account_holder, iban: (iban || '').replace(/\s+/g, ' ').trim(), bic, instructions, updated_at: new Date().toISOString() })
      .eq('id', 1).select().single()
    if (error) setSaved(error.message); else { onSettings(data); setSaved('Enregistré.') }
  }

  const labels = { none: 'Aucun', pending: 'Virement signalé', active: 'Actif', expired: 'Expiré' }
  const pendingCount = users.filter(u => u.status === 'pending').length

  return <section className="grid2">
    <div className="panel">
      <div className="panelHead"><h2>Utilisateurs {pendingCount > 0 && <span className="badge">{pendingCount} en attente</span>}</h2><button onClick={load}>Actualiser</button></div>
      {error && <p className="warning">{error}</p>}
      <div className="tableWrap"><table><thead><tr><th>Email</th><th>Référence</th><th>Statut</th><th>Payé jusqu'au</th><th>Actions</th></tr></thead><tbody>
        {users.map(u => <tr key={u.user_id}>
          <td>{u.email}</td><td>{payRef(u.user_id)}</td>
          <td><span className="badge">{labels[u.status] || u.status}</span></td>
          <td>{frDate(u.paid_until)}</td>
          <td className="actions"><button onClick={() => setAccess(u.user_id, 1)}>+1 mois</button><button onClick={() => setAccess(u.user_id, 12)}>+12 mois</button><button className="danger" onClick={() => setAccess(u.user_id, 0)}>Couper</button></td>
        </tr>)}
      </tbody></table></div>
    </div>
    <div className="panel">
      <h2>Paiement par virement</h2>
      <form onSubmit={saveSettings} className="form wide">
        <input placeholder="Prix affiché (ex. 9,90 € / mois)" value={form.price_label || ''} onChange={e => setForm({ ...form, price_label: e.target.value })} />
        <input placeholder="Titulaire du compte" value={form.account_holder || ''} onChange={e => setForm({ ...form, account_holder: e.target.value })} />
        <input placeholder="IBAN" value={form.iban || ''} onChange={e => setForm({ ...form, iban: e.target.value })} />
        <input placeholder="BIC" value={form.bic || ''} onChange={e => setForm({ ...form, bic: e.target.value })} />
        <input placeholder="Consignes" value={form.instructions || ''} onChange={e => setForm({ ...form, instructions: e.target.value })} />
        <button>Enregistrer</button>
      </form>
      {saved && <p className="message">{saved}</p>}
    </div>
    <div className="panel fullRow">
      <div className="panelHead"><h2>Journal des paiements</h2><button onClick={exportLog} disabled={!log.length}>Exporter CSV</button></div>
      <p className="muted">{log.filter(l => l.action === 'activation').length} activation(s) · {log.filter(l => l.action === 'activation').reduce((s, l) => s + (l.months || 0), 0)} mois payés au total</p>
      <div className="tableWrap"><table><thead><tr><th>Date</th><th>Email</th><th>Référence</th><th>Action</th><th>Mois</th><th>Tarif</th><th>Accès jusqu'au</th></tr></thead><tbody>
        {log.length === 0 && <tr><td colSpan="7" className="muted">Aucun mouvement pour l’instant.</td></tr>}
        {log.map(l => <tr key={l.id}>
          <td>{new Date(l.created_at).toLocaleString('fr-FR')}</td><td>{l.email}</td><td>{l.reference}</td>
          <td><span className="badge">{actionLabels[l.action] || l.action}</span></td>
          <td>{l.months || ''}</td><td>{l.price_label}</td><td>{frDate(l.paid_until)}</td>
        </tr>)}
      </tbody></table></div>
    </div>
  </section>
}

function Card({ title, value, text }) { return <div className="stat"><p>{title}</p><strong>{value}</strong><span>{text}</span></div> }

function Table({ invoices }) { return <div className="tableWrap"><table><thead><tr><th>N°</th><th>Client</th><th>HT</th><th>TVA</th><th>TTC</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{invoices.map(i=><tr key={i.id}><td>{i.number}</td><td>{i.client_name}</td><td>{money(i.amount_ht)}</td><td>{money(i.amount_vat)}</td><td>{money(i.amount_ttc)}</td><td><span className="badge">{i.status}</span></td><td><button onClick={()=>download(`${i.number}.html`, invoiceHtml(i), 'text/html')}>Télécharger</button></td></tr>)}</tbody></table></div> }

// Sur téléphone, les tableaux s'affichent en cartes : chaque cellule reçoit le nom de sa colonne
function labelTableCells() {
  document.querySelectorAll('table').forEach(table => {
    const heads = [...table.querySelectorAll('thead th')].map(th => th.textContent.trim())
    if (!heads.length) return
    table.querySelectorAll('tbody tr').forEach(tr => {
      [...tr.children].forEach((td, i) => { if (!td.hasAttribute('colspan') && td.dataset.label !== heads[i]) td.dataset.label = heads[i] || '' })
    })
  })
}
new MutationObserver(labelTableCells).observe(document.getElementById('root'), { childList: true, subtree: true })

createRoot(document.getElementById('root')).render(<App />)

import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const format = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

const invoices = [
  { id: 'FAC-2026-001', client: 'Atelier Martin', ht: 1250, tva: 250, status: 'Payée' },
  { id: 'FAC-2026-002', client: 'SAS Lumière', ht: 3200, tva: 640, status: 'À encaisser' },
  { id: 'FAC-2026-003', client: 'Boulangerie Nord', ht: 780, tva: 78, status: 'Brouillon' },
]

const expenses = [
  { id: 'ACH-2026-018', fournisseur: 'Papeterie Pro', ht: 200, tva: 40, status: 'À payer' },
  { id: 'ACH-2026-019', fournisseur: 'Hébergeur Cloud', ht: 89, tva: 17.8, status: 'Payée' },
]

const accounts = [
  ['401', 'Fournisseurs'], ['411', 'Clients'], ['44566', 'TVA déductible'], ['44571', 'TVA collectée'], ['512', 'Banque'], ['6064', 'Fournitures administratives'], ['706', 'Prestations de services'], ['707', 'Ventes de marchandises']
]

const salesHT = invoices.reduce((s, i) => s + i.ht, 0)
const collectedVat = invoices.reduce((s, i) => s + i.tva, 0)
const deductibleVat = expenses.reduce((s, e) => s + e.tva, 0)
const receivables = invoices.filter(i => i.status !== 'Payée').reduce((s, i) => s + i.ht + i.tva, 0)

function App() {
  const [amountHT, setAmountHT] = React.useState(1000)
  const [rate, setRate] = React.useState(20)
  const tva = amountHT * rate / 100
  const ttc = amountHT + tva

  return (
    <main>
      <header className="hero">
        <nav>
          <strong>ComptaFrance</strong>
          <span>Prototype React/Vite prêt Vercel</span>
        </nav>
        <section>
          <p className="badge">France · PCG · TVA · Facturation électronique</p>
          <h1>Site de comptabilité française pour TPE/PME</h1>
          <p className="lead">Tableau de bord, factures, achats, TVA, journal comptable, plan comptable et conformité.</p>
          <div className="actions"><a href="#factures">Voir les factures</a><a href="#conformite">Conformité</a></div>
        </section>
      </header>

      <section className="grid stats">
        <article><small>Chiffre d'affaires HT</small><strong>{format(salesHT)}</strong><span>Factures émises</span></article>
        <article><small>TVA collectée</small><strong>{format(collectedVat)}</strong><span>À déclarer selon régime</span></article>
        <article><small>TVA estimée</small><strong>{format(collectedVat - deductibleVat)}</strong><span>Collectée - déductible</span></article>
        <article><small>À encaisser TTC</small><strong>{format(receivables)}</strong><span>Créances ouvertes</span></article>
      </section>

      <section className="two-cols">
        <div className="card">
          <h2>Calculateur TVA</h2>
          <label>Montant HT<input type="number" value={amountHT} onChange={e => setAmountHT(Number(e.target.value))} /></label>
          <div className="rates">{[20,10,5.5,2.1,0].map(r => <button className={rate===r?'active':''} onClick={() => setRate(r)} key={r}>{r}%</button>)}</div>
          <div className="result"><p>HT <b>{format(amountHT)}</b></p><p>TVA <b>{format(tva)}</b></p><p>TTC <b>{format(ttc)}</b></p></div>
        </div>
        <div className="card">
          <h2>Plan comptable</h2>
          <div className="accounts">{accounts.map(([code, name]) => <p key={code}><b>{code}</b> {name}</p>)}</div>
        </div>
      </section>

      <section id="factures" className="card">
        <h2>Factures clients</h2>
        <table><thead><tr><th>N°</th><th>Client</th><th>HT</th><th>TVA</th><th>TTC</th><th>Statut</th></tr></thead><tbody>
          {invoices.map(i => <tr key={i.id}><td>{i.id}</td><td>{i.client}</td><td>{format(i.ht)}</td><td>{format(i.tva)}</td><td>{format(i.ht+i.tva)}</td><td><span className="pill">{i.status}</span></td></tr>)}
        </tbody></table>
      </section>

      <section className="card">
        <h2>Achats fournisseurs</h2>
        <table><thead><tr><th>Pièce</th><th>Fournisseur</th><th>HT</th><th>TVA</th><th>TTC</th><th>Statut</th></tr></thead><tbody>
          {expenses.map(e => <tr key={e.id}><td>{e.id}</td><td>{e.fournisseur}</td><td>{format(e.ht)}</td><td>{format(e.tva)}</td><td>{format(e.ht+e.tva)}</td><td><span className="pill">{e.status}</span></td></tr>)}
        </tbody></table>
      </section>

      <section id="conformite" className="card compliance">
        <h2>Checklist conformité France</h2>
        <div className="checklist">
          {['Plan comptable général', 'Numérotation chronologique des factures', 'Taux de TVA français', 'Journal débit/crédit', 'Export FEC à développer', 'Archivage probant à développer', 'Connexion plateforme agréée à prévoir', 'Validation expert-comptable recommandée'].map(x => <p key={x}>✓ {x}</p>)}
        </div>
        <p className="warning">Prototype non certifié : à faire valider avant usage officiel.</p>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)

# ComptaFrance Site

Prototype front-end React/Vite d'un site de comptabilité orienté France.

## Fonctions incluses

- Tableau de bord comptable
- Clients et fournisseurs
- Factures de vente
- Achats et dépenses
- Banque et rapprochement
- Journal comptable
- Plan comptable avec recherche
- Calculateur TVA
- Centre de conformité
- Paramètres entreprise

## Installation locale

```bash
npm install
npm run dev
```

Puis ouvre l'URL affichée dans le terminal, souvent :

```bash
http://localhost:5173
```

## Déploiement GitHub

```bash
git init
git add .
git commit -m "Initial commit ComptaFrance"
git branch -M main
git remote add origin https://github.com/TON-UTILISATEUR/TON-REPO.git
git push -u origin main
```

## Déploiement Vercel

1. Connecte ton compte GitHub à Vercel.
2. Importe le repository.
3. Framework preset : Vite.
4. Build command : `npm run build`.
5. Output directory : `dist`.

## Important

Ce projet est un prototype front-end. Pour une vraie utilisation comptable, il faut ajouter un back-end, une base de données, l'authentification, la génération PDF, l'export FEC, l'archivage probant, les journaux immuables et une validation par expert-comptable.

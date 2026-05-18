# ComptaFrance Supabase

Version React/Vite connectée à Supabase : compte utilisateur, factures sauvegardées, exports CSV, téléchargement de facture HTML imprimable PDF.

## Installation locale

```bash
npm install
cp .env.example .env
npm run dev
```

## Configuration Supabase

1. Créer un projet sur Supabase.
2. Aller dans **SQL Editor**.
3. Copier/coller le contenu de `supabase/schema.sql` puis exécuter.
4. Aller dans **Project Settings > API**.
5. Copier :
   - Project URL
   - anon public key
6. Dans Vercel, ajouter les variables :

```txt
VITE_SUPABASE_URL=https://TON-PROJET.supabase.co
VITE_SUPABASE_ANON_KEY=TON_ANON_KEY
```

## Vercel

- Framework : Vite
- Install Command : `npm install`
- Build Command : `npm run build`
- Output Directory : `dist`

## Production à ajouter ensuite

- Génération PDF serveur
- Stockage des PDF dans Supabase Storage
- Export FEC complet
- Journal comptable immuable
- Piste d'audit fiable
- Connexion plateforme agréée facturation électronique

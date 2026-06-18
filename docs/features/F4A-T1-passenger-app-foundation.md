# F4A-T1 — Passenger App Foundation

Ticket : fondation application convoyeur SharingGO.

## Objectif

Créer une application React/Vite dédiée aux convoyeurs, abonnés Mosolf et futurs passagers — **sans impact** sur le cockpit admin (`frontend/` racine).

## Audit architecture existante (pré-ticket)

| Élément | État |
|---------|------|
| `frontend/` | Application admin unique (Vite, port **5173**) |
| `frontend/apps/` | **Absent** avant F4A-T1 |
| `turbo.json` | **Absent** — pas de monorepo Turborepo |
| Packages partagés (`packages/*`) | **Absents** |
| Workspace npm racine | **Absent** — admin et passenger sont des apps **indépendantes** |

L’admin reste à `frontend/` (inchangé). La passenger app vit dans `frontend/apps/passenger/` (port dev **5174**).

## Architecture cible

```text
frontend/apps/passenger/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  eslint.config.js
  tailwind.config.js
  postcss.config.js
  .env.example
  src/
    app/           # App shell, router, QueryClient
    api/           # Réservé F4A-T2+ (vide)
    components/
      layout/      # PassengerLayout, header, bottom nav
      ui/          # Design system minimal
    features/      # Modules métier futurs
    hooks/
    lib/           # cn, env
    pages/         # Écrans route-level
    styles/
    types/         # routes, ui
```

## Routes

| Path | Page | Layout | Statut F4A-T1 |
|------|------|--------|---------------|
| `/` | Accueil | PassengerLayout + bottom nav | Placeholder |
| `/login` | Connexion | AuthLayout (sans bottom nav) | Placeholder |
| `/register` | Inscription | AuthLayout | Placeholder |
| `/trips` | Trajets | PassengerLayout | Placeholder |
| `/bookings` | Réservations | PassengerLayout | Placeholder |
| `/boarding-pass` | Boarding pass | PassengerLayout | Placeholder |
| `/profile` | Profil | PassengerLayout | Placeholder |
| `*` | 404 | Standalone | Terminé |

Constantes : `src/types/routes.ts`.

## Navigation (bottom bar)

Onglets visibles (mobile-first, touch ≥ 44px) :

1. **Accueil** → `/`
2. **Trajets** → `/trips`
3. **Réservations** → `/bookings`
4. **Profil** → `/profile`

`/boarding-pass` est routé mais **hors** bottom nav (accès futur depuis réservations).

## Layout

- **PassengerLayout** : header sticky, contenu `max-w-lg` centré, bottom navigation fixe avec `safe-area-inset`.
- **AuthLayout** : header minimal, pas de bottom nav (login/register).

## Design system

Composants UI (`src/components/ui/`) :

- `Button` — variantes primary/secondary/ghost/destructive, tailles touch-friendly
- `Card`
- `Badge`
- `EmptyState`
- `PageHeader`

Palette : fond `#000000`, texte `#ffffff`, primaire `#22c55e` (aligné CDC / admin).

## TanStack Query

- `src/app/query-client.ts` — client configuré, provider dans `App.tsx`
- **Aucune query métier** en F4A-T1

## Environment

Fichier `frontend/apps/passenger/.env.example` :

```env
VITE_API_URL=http://localhost:3000
```

Aligné sur le backend SharingGO (`PORT=3000`). Port dev passenger : **5174**.

## Limites (scope F4A-T1)

**Non inclus** (tickets suivants) :

- Authentification (Google OAuth, session)
- Liste trajets publics (`GET /api/trips`)
- Réservation / pending 2 min
- Paiement Stripe Checkout
- Affichage QR boarding
- Historique réservations
- Profil complet
- Turnstile / honeypot
- Modification backend
- Modification cockpit admin
- Docker Compose / nginx multi-app (à traiter infra)

## Prochains tickets suggérés

| Ticket | Contenu |
|--------|---------|
| F4A-T2 | Auth convoyeur (Google OAuth, session cookie, guards) |
| F4A-T3 | Liste trajets publics + détail places |
| F4A-T4 | Réservation pending 2 min |
| F4A-T5 | Paiement Stripe Checkout ticket |
| F4A-T6 | QR boarding pass |
| F4A-T7 | Historique réservations + profil |
| F4A-INFRA | CORS `5174`, nginx route `/app` ou sous-domaine, Compose service passenger |

## Commandes dev

```bash
cd frontend/apps/passenger
cp .env.example .env   # optionnel — défaut localhost:3000 dans env.ts
npm install
npm run dev            # http://localhost:5174
npm run lint
npm run build
```

L’admin continue sur `cd frontend && npm run dev` (port **5173**).

## DoD F4A-T1

- [x] Passenger app créée sous `frontend/apps/passenger`
- [x] React Router + TanStack Query
- [x] Layout mobile-first + bottom navigation
- [x] Pages placeholder
- [x] Design system minimal
- [x] Aucun fichier modifié dans `frontend/src` (admin)
- [x] Documentation

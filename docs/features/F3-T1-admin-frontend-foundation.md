# F3-T1 — Admin Frontend Foundation

## Objectif

Poser la fondation du cockpit admin SharingGO : architecture React/Vite/TS, routing, data fetching, auth guards, layout noir/vert et pages placeholder.

## Architecture

```text
frontend/src/
  app/           # App shell, router, QueryClient
  api/           # http client + auth/admin API modules
  components/    # layout + ui design system
  constants/     # routes, roles, navigation, query keys, colors, statuses
  features/      # dossiers métier (F3-T2+)
  guards/        # RequireAuth, RequireRole
  hooks/         # useCurrentUser
  lib/           # cn, env, formatters, query helpers
  pages/         # route-level screens
  types/         # shared TypeScript contracts
```

## Routes

| Path | Page | Accès |
|------|------|-------|
| `/login` | Login | Public |
| `/` | Dashboard | ADMIN, SUPER_ADMIN |
| `/trips` | Trips | ADMIN, SUPER_ADMIN |
| `/reservations` | Reservations | ADMIN, SUPER_ADMIN |
| `/payments` | Payments | ADMIN, SUPER_ADMIN |
| `/subscriptions` | Subscriptions | ADMIN, SUPER_ADMIN |
| `/boarding` | Boarding | ADMIN, SUPER_ADMIN |
| `/settings` | Settings | ADMIN, SUPER_ADMIN |

Constantes : `src/constants/routes.ts`.

## Auth & guards

- Session **cookie HttpOnly** (`credentials: "include"`) — **aucun token** en `localStorage` / `sessionStorage`.
- `GET /api/auth/me` via `useCurrentUser` (TanStack Query).
- `RequireAuth` : redirige vers `/login` si 401.
- `RequireRole` : générique `allowedRoles={["ADMIN", "SUPER_ADMIN"]}`.

Rôles **interdits** sur le cockpit admin global : `DRIVER`, `CONVOYEUR`, `PASSENGER` (message « Accès refusé », extensible vers apps dédiées).

## API client

- `src/api/http.ts` : `fetch` + `VITE_API_URL` + parsing erreurs `{ error: { message, code, requestId } }`.
- `src/api/auth.api.ts` : `getMe`, `login`, `logout`.
- `src/api/admin.api.ts` : stub pour tickets F3-T2+.

## Design system

Composants UI minimaux : `Button`, `Card`, `Badge`, `Input`, `PageHeader`, `EmptyState`.

Thème Tailwind : fond `#000000`, primaire `#22c55e` (voir `tailwind.config.js` et `constants/colors.ts`).

## Structure `lib/` & `types/`

- **lib/** : `cn`, `env`, `format-date`, `query` (invalidation auth), `utils` (displayName, initials).
- **types/** : `auth.types`, `api.types`, `pagination.types`, `ui.types`.

## Constantes (ajustement CTO)

- `constants/routes.ts`
- `constants/roles.ts`
- `constants/navigation.ts`
- `constants/query-keys.ts`
- `constants/colors.ts`
- `constants/statuses.ts`

## Limites F3-T1

- Pas de tables métier complètes ni analytics réels.
- Pas de modification backend.
- Pas de React Hook Form (login avec Zod + state local).
- Pas de grosse UI library.

## Prochains tickets

- **F3-T2+** : tables admin (trips, reservations, payments), filtres, détail, actions.
- App **DRIVER** séparée (scan QR).
- Portail convoyeur / B2B si besoin produit.

## Démarrage local

```bash
cd frontend
npm install
npm run dev
```

`.env` racine ou frontend : `VITE_API_URL=http://localhost:3000`

Compte demo admin : `admin@sharinggo.demo` / `DemoPassword123!`

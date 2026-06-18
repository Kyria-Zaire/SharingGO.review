# F4A-T3 — Public Trips Discovery

Ticket : page `/trips` branchée sur les trajets publics — découverte sans réservation.

## Objectifs UX

Permettre à un convoyeur de **voir les vrais trajets** : ligne, date, horaires, places restantes, prix ticket 8 €, statut — **sans** réserver ni payer.

## Endpoint utilisé

**API publique existante** (aucune auth, rate limit public read) :

| Méthode | Path | Usage |
|---------|------|--------|
| `GET` | `/api/trips` | Liste trajets (`date`, `lineId`, `limit`, `offset`) |
| `GET` | `/api/trips/:id` | Détail (préparé dans `trips.api.ts`, page détail hors scope) |

Source backend : `backend/src/modules/trips/public-trips.routes.ts`  
OpenAPI : `docs/api/openapi.json` → tags **Public Trips**

**Pas d’API admin** utilisée côté passenger.

### Limite backend connue

- Les trajets **désactivés** admin (`disable` → `deletedAt` renseigné) sont **exclus** de l’API publique.
- Le champ `isDisabled` n’existe pas dans `TripPublic` — statut **Indisponible** réservé pour un futur champ backend.
- Filtre date : param `date=YYYY-MM-DD` interprété en **Europe/Paris** (aligné backend `parisDayBoundsUtc`).

## Structure UI (`TripsPage`)

```text
PageHeader
TripsRouteSummary      — ligne Châlons ↔ Vatry (depuis 1er trajet ou libellé statique)
TripsDateFilter        — Aujourd'hui / Demain / Date manuelle → query API
Pricing hint           — Ticket 8 € + abonnements bientôt
TripsTrustBlock        — 4 rappels confiance
TripsList / skeleton / ErrorState / EmptyState
  └── TripCard × N
```

## Composants

| Composant | Rôle |
|-----------|------|
| `TripCard` | Départ, arrivée, places, 8 €, badge, CTA désactivé |
| `TripAvailabilityBadge` | Badge statut |
| `TripsDateFilter` | Filtre date → `usePublicTrips` |
| `TripsRouteSummary` | Bandeau ligne |
| `TripsTrustBlock` | Réservation / places / QR / paiement |

## Règles disponibilité (`deriveTripAvailability`)

Ordre d’évaluation :

| Condition | Statut | Badge | CTA |
|-----------|--------|-------|-----|
| `isDisabled === true` (futur) | `unavailable` | Indisponible | Indisponible (disabled) |
| `departureTime < now` | `past` | Passé | Passé (disabled) |
| `isFull` ou `remainingSeats <= 0` | `full` | Complet | Complet (disabled) |
| `remainingSeats` 1–2 | `almost_full` | Bientôt complet | Réserver bientôt (disabled) |
| `remainingSeats > 2` | `available` | Disponible | Réserver bientôt (disabled) |

Aucun CTA ne lance de réservation en F4A-T3.

## TanStack Query

- Hook : `usePublicTrips(dateFilter)`
- `staleTime` : **30 000 ms**
- États : loading (skeleton), error (retry), empty, success

## Mobile-first

- Liste en **cards** uniquement (pas de tableau)
- Touch targets ≥ 44px sur filtres date et CTA
- Grille 2 colonnes infos dans `TripCard`
- Shell `max-w-lg` (F4A-T1)

Viewports cibles : 375, 390, 768 px.

## Fichiers clés

```text
src/api/http.ts
src/api/trips.api.ts
src/types/trips.types.ts
src/hooks/usePublicTrips.ts
src/lib/trip-availability.ts
src/lib/format-date.ts          # Europe/Paris date keys
src/features/trips/components/*
src/pages/TripsPage.tsx
```

## Limites V1

- Pas de réservation / paiement / Stripe / QR / auth
- Pas de page `/trips/:tripId` (API prête)
- Pas de mock : données **API réelle** ou error state
- **CORS dev** : voir section ci-dessous (fix F4A-T3 reserve)

## CORS dev (réserve CTO — obligatoire)

Le passenger app tourne sur **`http://localhost:5174`**. Sans cette origine dans `CORS_ORIGIN`, le navigateur bloque `fetch` → « Failed to fetch ».

**Backend** (depuis fix reserve) : `CORS_ORIGIN` accepte plusieurs origines **comma-separated** :

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

Mettre à jour **votre `.env` local** (non versionné) + redémarrer l’API :

```bash
docker compose -f docker-compose.dev.yml up -d --build backend
# ou npm run dev dans backend/
```

**Passenger** :

```env
VITE_API_URL=http://localhost:3000
```

Validation locale attendue :

- `/trips` affiche des **TripCard** (seed demo), **ou**
- `/trips` affiche **EmptyState** « Aucun trajet pour cette date » — **jamais** « Failed to fetch »

## Prochain ticket suggéré

**F4A-T4 — Reservation pending 2 min** : activer CTA « Réserver » sur trajets disponibles.

## Commandes

```bash
cd frontend/apps/passenger
npm run dev    # :5174 — backend :3000 requis pour données réelles
npm run lint
npm run build
```

## DoD F4A-T3

- [x] `/trips` remplace placeholder
- [x] API publique `GET /api/trips`
- [x] TripCard + TripAvailabilityBadge
- [x] Filtre date + états loading/error/empty
- [x] Prix 8 € + trust block
- [x] Aucune API admin
- [x] Lint + build

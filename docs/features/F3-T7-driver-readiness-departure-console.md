# F3-T7 — Driver Readiness & Departure Console

## Objectif

Console opérationnelle de préparation départ : readiness UX, métriques boarding, incidents heuristiques, tri par priorité. Frontend uniquement — aucune écriture DB, aucune nouvelle API.

## Endpoints consommés (existants)

| API | Usage |
|-----|--------|
| `GET /api/admin/trips` | Liste trajets (filtres ligne, upcoming, disabled) |
| `GET /api/admin/trips/:id/occupancy` | Par trajet — confirmed / used / occupied |
| `GET /api/admin/reservations` | Contexte réservations (limit 100, même fenêtre) |

Occupancy chargée en parallèle (`Promise.allSettled`) — échec unitaire → UNKNOWN pour ce trajet.

## Readiness heuristics (UX only)

| Statut | Condition |
|--------|-----------|
| `EMPTY` | `occupiedSeats === 0` |
| `WAITING_PASSENGERS` | `usedSeats === 0` et (confirmed ou pending actifs) |
| `BOARDING_IN_PROGRESS` | `usedSeats > 0` et `confirmedSeats > 0` |
| `READY` | `usedSeats > 0` et `confirmedSeats === 0` |
| `UNKNOWN` | Occupancy indisponible ou état indéterminé |

### READY stabilization guard

Jamais `READY` si `boardedCount === 0` — basculer vers `WAITING_PASSENGERS`.

## Priority sorting

1. BOARDING_IN_PROGRESS  
2. WAITING_PASSENGERS  
3. READY  
4. EMPTY  
5. UNKNOWN  

À égalité : `departureTime` asc.

## Métriques affichées

- `boardedCount` = `usedSeats`
- `remainingBoardingCount` = `confirmedSeats`
- `percentBoarded` = used / occupied
- **Boarding complete** si `occupiedSeats === boardedCount > 0`

## Near departure

Badge **Soon** + bordure légère si départ dans **< 15 min** (futur : countdown via `formatDepartureCountdownLabel`).

## Incidents heuristiques

Severities extensibles : `info` | `warning` | `critical` (futur alerting).

Exemples V1 :
- Departure soon
- Full but passengers not boarded
- Boarding started late
- No passengers
- Unknown readiness

## Composants

| Composant | Rôle |
|-----------|------|
| `DepartureProgressCard` | Carte opérationnelle trajet |
| `DepartureReadinessBadge` | Statut readiness |
| `BoardingProgressBar` | Progression % |
| `DepartureIncidentBadge` | Warning visuel |
| `NearDepartureBadge` | Soon (V2 countdown) |
| `DeparturesFilters` | Filtres + refresh |

Utils : `departure-readiness.ts`, `departure-time.ts`, `departure-board.ts`

## TanStack Query

- `staleTime: 15_000`
- Refresh manuel + cooldown **~2s**
- Last updated `HH:mm:ss` (réutilise `MonitoringLastUpdated`)

## Route

- `/departures` — Sidebar **Departures** (icône PlaneTakeoff)

## Limitations

- Pas de websocket / realtime / dispatch DB
- Heuristiques frontend non contractuelles
- N+1 occupancy par trajet (API existante)
- Pas de statut lifecycle futur implémenté (types `DepartureReadinessStatusFuture` préparés)

## No boarding activity (micro-ajustement CTO)

Si `occupiedSeats > 0`, `boardedCount === 0` et départ **< 15 min** :
- incident **No boarding activity** (severity `warning`)

## Futur lifecycle states (types préparés)

`DepartureReadinessStatusFuture` : `DEGRADED`, `DELAYED`, `INCIDENT`, `CLOSED`

## Futur UI

- App chauffeur DRIVER réutilisant composants métier
- Countdown « Départ dans X min » (remplace badge Soon)
- Animation légère progress bar boarding
- Incident severity critical + alerting
- Realtime occupancy / dispatch

## Test manuel

1. Seed demo + admin login
2. `/departures` — cartes triées, readiness, progress
3. Consommer boarding → BOARDING_IN_PROGRESS puis READY
4. Refresh + cooldown + Last updated

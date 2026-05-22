# S1-T2 — API publique lecture trajets

Ticket : exposition des trajets disponibles (lecture seule). Aucune réservation, locking, ni paiement.

## Objectif

Permettre au futur frontend/mobile de lister et consulter les trajets actifs avec une **disponibilité de base** (`reservedSeats`, `remainingSeats`, `isFull`).

## Routes publiques (sans auth)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/trips` | Liste paginée |
| GET | `/api/trips/:id` | Détail |

Justification CTO : voir les horaires avant inscription (friction réduite). La réservation future exigera l’auth.

## Filtres query (`GET /api/trips`)

| Param | Règle |
|-------|--------|
| `lineId` | Filtre par ligne |
| `date` | `YYYY-MM-DD` — journée **Europe/Paris** sur `departureTime` (UTC en base) |
| `from` / `to` | ISO datetime — borne sur `departureTime` |
| `limit` | Défaut 50, max 100 |
| `offset` | Défaut 0 |

Combinaison : filtres en **ET**. Si `date` + `from`/`to`, intersection des plages.

**Défaut** (sans `date`/`from`/`to`) : `departureTime >=` début du jour courant à Paris.

Tri : `departureTime` asc. Exclut `deletedAt != null`.

## Fuseau horaire `date`

Exemple `date=2026-06-15` → trajets dont `departureTime` (UTC) tombe entre  
`2026-06-15 00:00:00` et `2026-06-15 23:59:59.999` en **Europe/Paris**, converti en UTC via `backend/src/lib/paris-time.ts` (sans dépendance externe).

## Disponibilité basique

```
reservedSeats = count(Reservation WHERE status IN (CONFIRMED, USED))
remainingSeats = totalSeats - reservedSeats
isFull = remainingSeats <= 0
```

**Non compté** : `PENDING`, `CANCELED`, `EXPIRED`, `PendingReservation`.

Pas de locking dans ce ticket — le moteur de réservation traitera pending/FOR UPDATE plus tard.

## Performance

`prisma.reservation.groupBy({ by: ['tripId'], ... })` sur la page courante — évite N+1.

## Réponse item

```json
{
  "id": "...",
  "line": { "id", "name", "startCity", "endCity" },
  "departureTime": "ISO",
  "arrivalTime": "ISO|null",
  "totalSeats": 8,
  "reservedSeats": 3,
  "remainingSeats": 5,
  "isFull": false
}
```

Liste : `{ "trips": [...], "limit": 50, "offset": 0 }`.

## Erreurs

- `VALIDATION_ERROR` (400) — query invalide, `limit` > 100, `from` >= `to`
- `TRIP_NOT_FOUND` (404) — id absent ou trajet désactivé (`deletedAt`)

## Hors scope

Réservation, pending, Stripe, QR, frontend, routes admin modifiées.

## Exemples curl

```bash
curl.exe http://localhost:3000/api/trips
curl.exe "http://localhost:3000/api/trips?date=2026-06-15&limit=10"
curl.exe http://localhost:3000/api/trips/TRIP_ID
```

## Module

`backend/src/modules/trips/` (séparé de `modules/transport/` admin).

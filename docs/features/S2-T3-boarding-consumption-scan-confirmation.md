# S2-T3 — Boarding Consumption / Scan Confirmation

Ticket : consommation irréversible du billet boarding (première étape scan opérationnel côté backend).

## Endpoint

`POST /api/boarding/consume`

| Exigence | Détail |
|----------|--------|
| Auth | Cookie session |
| RBAC | `ADMIN` / `SUPER_ADMIN` |
| Body | `{ "boardingToken": "JWT_SIGNED" }` |

## Flow

1. Vérification JWT (`verifyBoardingToken`)
2. Chargement réservation + trip + payment
3. Si `USED` + JWT lié (sub/uid/tid/bt, trip actif) → **200** `{ valid: true, consumed: false, reason: BOARDING_ALREADY_USED }`
4. Si `USED` + JWT non lié → vraie raison d’invalidité (ex. `TOKEN_REVOKED`)
5. Si `CONFIRMED` + éligible → transaction `FOR UPDATE` → `status=USED`, `usedAt`, `usedByUserId`

## Transaction & anti double scan

```sql
SELECT id FROM "Reservation" WHERE id = $1 FOR UPDATE
```

Deux scans simultanés : un seul `consumed=true`, l’autre `BOARDING_ALREADY_USED`.

## Champs DB (migration)

- `Reservation.usedAt`
- `Reservation.usedByUserId` → admin ayant scanné

## Réponses

**Succès** : `valid: true`, `consumed: true`, reservation `USED`, trip, passenger (sans email).

**Déjà utilisé** : `valid: true`, `consumed: false`, `reason: BOARDING_ALREADY_USED`.

**Échec** : `valid: false`, `consumed: false`, `reason` (liste `BOARDING_CONSUMPTION_REASONS`).

HTTP **200** pour tout le métier ; **401/403** auth/RBAC ; **400** body Zod.

## Audit

- `BOARDING_CONSUMED`
- `BOARDING_ALREADY_USED`
- `BOARDING_CONSUMPTION_FAILED`
- `BOARDING_CONSUMPTION_ERROR`

Jamais : JWT complet, `bt`, token opaque DB.

## Limites V1

Pas de caméra, UI scan, offline, websocket, passage hors API.

## Futur

S2+ : scan mobile, QR image, rôle chauffeur dédié.

## Tests

```bash
node backend/scripts/s2-t3-boarding-consumption-test.mjs
```

Inclut test de **concurrence** (2 POST parallèles).

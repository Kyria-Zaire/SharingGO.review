# S1-T3 — Fondation réservation (Pending Reservation Engine)

Ticket : verrouillage transactionnel 2 minutes, sans paiement Stripe. Zone critique anti-overbooking.

## Architecture

```
Utilisateur authentifié
    → POST /api/reservations/pending { tripId }
    → prisma.$transaction
        → SELECT Trip FOR UPDATE
        → DELETE pending expirées (trip)
        → COUNT occupied (CONFIRMED + USED + pending actives)
        → CREATE PendingReservation (expiresAt = now + 2 min)
    → 201 { pendingReservationId, expiresAt, remainingSeats }
```

## Pourquoi PendingReservation

- Bloque une place **temporairement** avant Stripe Checkout (futur)
- N’est pas une réservation confirmée (`Reservation` CONFIRMED viendra après paiement)
- Expire en 2 minutes sans cron (nettoyage à l’écriture / lecture)

## FOR UPDATE

PostgreSQL row lock sur `Trip` dans la transaction :

```sql
SELECT ... FROM "Trip" WHERE id = $1 FOR UPDATE
```

Garantit que deux requêtes concurrentes sur le **dernier siège** ne créent qu’**une** pending : la seconde voit le comptage à jour après lock.

Implémentation : `backend/src/modules/reservations/reservation-locking.ts`

## Disponibilité (source de vérité)

Occupied = `Reservation` (CONFIRMED, USED) + `PendingReservation` (non expirée, `consumedAt` null).

Partagé via `backend/src/lib/trip-occupancy.ts` :

- Moteur réservation (transaction)
- API publique `GET /api/trips` (S1-T2 mis à jour — `reservedSeats` inclut désormais les pending actives)

**Important** : le chiffre public est indicatif ; la réservation ne doit jamais se fier uniquement au frontend — le lock transactionnel fait foi.

## Routes (auth obligatoire)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/reservations/pending` | Créer pending |
| GET | `/api/reservations/pending/:id` | Détail (owner only) |
| DELETE | `/api/reservations/pending/:id` | Annuler (204, idempotent) |

## Règles métier

| Cas | Code HTTP |
|-----|-----------|
| Trip introuvable | 404 `TRIP_NOT_FOUND` |
| Trip désactivé (`deletedAt`) | 400 `TRIP_DISABLED` |
| Trip passé | 400 `TRIP_PAST` |
| Complet | 409 `TRIP_FULL` |
| Pending active même user/trip | 409 `PENDING_ALREADY_EXISTS` |
| Pending expirée (GET) | 410 `PENDING_EXPIRED` |
| Autre utilisateur | 403 `FORBIDDEN` |

## Expiration

- TTL fixe : **2 minutes** (`PENDING_TTL_MS` dans le service)
- Pas de cron / worker V1
- Suppression `expiresAt < now()` avant comptage en transaction
- GET expiré → 410 + audit `PENDING_RESERVATION_EXPIRED`

## Audit logs

`PENDING_RESERVATION_CREATED`, `PENDING_RESERVATION_REJECTED_FULL`, `PENDING_RESERVATION_CANCELED`, `PENDING_RESERVATION_EXPIRED` — échec audit → warn only (CTO).

## Limites actuelles

- Pas de Stripe / CONFIRMED auto / QR / websocket
- Pas de limite globale « une pending par user tous trips » (seulement par trip)
- TTL non configurable via env (constant 2 min)

## Futur Stripe

1. Checkout session
2. Webhook succès → créer `Reservation` CONFIRMED, `consumedAt` sur pending
3. Échec / abandon → pending expire ou DELETE

## Test concurrence (obligatoire review)

```bash
cd backend
node scripts/test-pending-concurrency.mjs
```

Attendu : sur le dernier siège, **1× 201** et **1× 409 TRIP_FULL**.

## Exemples curl

```bash
# Login (cookie jar)
curl.exe -c cookies.txt -H "Content-Type: application/json" \
  --data-binary "@login.json" http://localhost:3000/api/auth/login

curl.exe -b cookies.txt -H "Content-Type: application/json" \
  -d "{\"tripId\":\"TRIP_ID\"}" http://localhost:3000/api/reservations/pending

curl.exe -b cookies.txt http://localhost:3000/api/reservations/pending/PENDING_ID
curl.exe -b cookies.txt -X DELETE http://localhost:3000/api/reservations/pending/PENDING_ID
```

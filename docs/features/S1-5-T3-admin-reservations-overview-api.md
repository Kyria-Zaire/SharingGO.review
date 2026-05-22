# S1.5-T3 — Admin Reservations Overview API

Ticket : visibilité opérationnelle **lecture seule** pour ADMIN / SUPER_ADMIN.

## Objectif

Superviser réservations, paiements, pending et occupation par trajet — sans mutation métier.

## RBAC

Toutes les routes :

- `requireAuth`
- `requireRole(ADMIN, SUPER_ADMIN)`

| Rôle | Accès |
|------|--------|
| Non connecté | 401 |
| CONVOYEUR | 403 |
| ADMIN / SUPER_ADMIN | 200 |

## Routes (`/api/admin`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/reservations` | Liste réservations (filtres) |
| GET | `/reservations/:id` | Détail réservation |
| GET | `/payments` | Liste paiements |
| GET | `/pending-reservations` | Pending actives / expirées / consommées |
| GET | `/trips/:id/occupancy` | Remplissage détaillé d’un trajet |

Routes transport existantes inchangées : `/lines`, `/trips` (CRUD).

## Filtres principaux

### Reservations

`status`, `userId`, `tripId`, `lineId`, `from`, `to` (sur `trip.departureTime`), `limit`, `offset`

### Payments

`status`, `type`, `userId`, `reservationId`, `from`, `to` (sur `createdAt`), `limit`, `offset`

### Pending

`active`, `expired`, `includeConsumed`, `userId`, `tripId`, `limit`, `offset`

- Défaut : pending non consommées (`consumedAt` null), actives + expirées
- `active=true` + `expired=true` → 400

### Occupancy

- `confirmedSeats` = réservations CONFIRMED
- `usedSeats` = réservations USED
- `activePendingSeats` = pending non expirées, non consommées
- `occupiedSeats` = somme des trois
- `remainingSeats` = `totalSeats - occupiedSeats`
- `isFull` = `remainingSeats <= 0`

## Serializers admin safe

**Exposé** : user minimal (`id`, `email`, `firstName`, `lastName`), trip, line, payment métier, refs Stripe **courtes** (`pi_xxx...abcd`)

**Jamais exposé** : `passwordHash`, tokens session, IDs Stripe complets, `boardingToken`, payloads webhook

## Exemples curl

```powershell
# Promouvoir un user en ADMIN (dev)
docker exec sharinggo-postgres-dev psql -U postgres -d sharinggo -c "UPDATE \"User\" SET \"userType\" = 'ADMIN' WHERE email = 'admin@example.com';"

curl.exe -c cookies.txt -d "{\"email\":\"admin@example.com\",\"password\":\"TestPass123!\"}" http://localhost:3000/api/auth/login
curl.exe -b cookies.txt http://localhost:3000/api/admin/reservations
curl.exe -b cookies.txt http://localhost:3000/api/admin/payments?status=SUCCEEDED
curl.exe -b cookies.txt http://localhost:3000/api/admin/pending-reservations?active=true
curl.exe -b cookies.txt http://localhost:3000/api/admin/trips/TRIP_ID/occupancy
```

## Fichiers

`backend/src/modules/admin/*` — monté via `adminOperationsRouter` dans `app.ts`

## Limites V1

- Lecture seule
- Pas d’annulation / remboursement / export
- Pas de dashboard frontend

# S2-T1 — QR Boarding Token Foundation

Ticket : fondation cryptographique du droit d'embarquement. **Pas d'image QR**, pas de scan chauffeur, pas de mobile.

## Objectif produit

Après réservation confirmée et paiement réussi, le passager peut produire une **preuve d'embarquement transportable** (JWT signé) que le passager présentera plus tard sous forme de QR code.

## Architecture JWT boarding

```
Passager auth → GET /api/boarding/:id/token → BoardingService
  1. ownership + CONFIRMED + Payment SUCCEEDED
  2. departureTime + 10 min >= now
  3. opaque token → Reservation.boardingToken (DB) si absent
  4. JWT HS256 avec claim bt = opaque token
  5. retour JWT (jamais stocké en DB)
```

### Source de vérité révocable

| Artefact | Rôle |
|----------|------|
| `Reservation.boardingToken` | Token opaque **en DB** — révocation future |
| JWT signé | Preuve transportable — **jamais persisté** |
| Claim `bt` | Lie le JWT au token opaque DB |

Future validation chauffeur : JWT → comparer `bt` à `Reservation.boardingToken`.

### Payload JWT (HS256)

`sub`, `typ=boarding`, `uid`, `tid`, `bt`, `iat`, `exp` — sans email, nom, payment, rôles.

### Expiration

`exp` = `departureTime + 10 minutes`. Si fenêtre passée → `BOARDING_EXPIRED` (410).

## Endpoint

`GET /api/boarding/:reservationId/token` — auth cookie, owner only.

## Codes d'erreur

| Code | HTTP |
|------|------|
| `RESERVATION_NOT_FOUND` | 404 |
| `RESERVATION_NOT_CONFIRMED` | 409 |
| `BOARDING_NOT_AVAILABLE` | 409 |
| `BOARDING_EXPIRED` | 410 |

## Sécurité

- `BOARDING_JWT_SECRET` ≥ 32 caractères
- Logs : reservationId, tripId, userId — jamais JWT, bt, secret

## Limitations V1

Pas de QR image, scan, consommation boarding, rate limit dédié.

## Tests

```bash
node backend/scripts/s2-t1-boarding-token-test.mjs
```

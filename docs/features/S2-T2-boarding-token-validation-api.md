# S2-T2 — Boarding Token Validation API

Ticket : validation serveur du JWT boarding — base du futur scan QR chauffeur.

## Endpoint

`POST /api/boarding/validate`

| Exigence | Détail |
|----------|--------|
| Auth | Cookie session (`requireAuth`) |
| RBAC | `ADMIN` ou `SUPER_ADMIN` uniquement (pas de rôle chauffeur V1) |
| Rate limit | `adminLimiter` |

### Body

```json
{ "boardingToken": "JWT_SIGNED" }
```

`boardingToken` = JWT HS256 (pas le token opaque DB).

## Flow validation

1. Zod body → **400** si invalide
2. `verifyBoardingToken(jwt)` → si échec : **200** `{ valid: false, reason }`
3. Charger `Reservation` par `sub` (+ user, trip.line, payment)
4. Contrôles métier :
   - `userId` / `tripId` cohérents avec JWT
   - `boardingToken` DB === claim `bt`
   - `CONFIRMED`, trip non supprimé, fenêtre departure+10min, payment `SUCCEEDED`
5. Succès → **200** `{ valid: true, reservation, trip, passenger }`

## HTTP 200 pour invalid métier

Les échecs de validation (token révoqué, expiré, etc.) retournent **200** avec `valid: false` pour un contrat stable pour le futur scanner. Seuls **401/403** (auth/RBAC) et **400** (body) utilisent les codes d’erreur classiques.

## Reasons (`BOARDING_VALIDATION_REASONS`)

| Reason | Cas |
|--------|-----|
| `INVALID_TOKEN` | Signature / JWT malformé |
| `EXPIRED_TOKEN` | `exp` JWT dépassé |
| `INVALID_TYPE` | `typ` ≠ boarding |
| `INVALID_PAYLOAD` | Claims manquants |
| `RESERVATION_NOT_FOUND` | `sub` inconnu |
| `TOKEN_REVOKED` | `bt` ≠ DB ou incohérence uid/tid |
| `RESERVATION_NOT_CONFIRMED` | Statut ≠ CONFIRMED |
| `TRIP_DISABLED` | `trip.deletedAt` renseigné |
| `BOARDING_WINDOW_EXPIRED` | departure + 10 min < now (contrôle DB) |
| `PAYMENT_NOT_SUCCEEDED` | Pas de payment ou statut ≠ SUCCEEDED |
| `INTERNAL_VALIDATION_ERROR` | Erreur technique inattendue (pas de stacktrace client) |

## Révocation anti-rejeu

Rotation ou suppression de `Reservation.boardingToken` invalide tous les JWT précédents → `TOKEN_REVOKED`.

## Audit

| Action | Quand |
|--------|-------|
| `BOARDING_VALIDATION_SUCCESS` | valid true |
| `BOARDING_VALIDATION_FAILED` | invalid métier général |
| `BOARDING_TOKEN_REVOKED` | TOKEN_REVOKED |
| `BOARDING_TOKEN_EXPIRED` | EXPIRED_TOKEN / BOARDING_WINDOW_EXPIRED |
| `BOARDING_INTERNAL_VALIDATION_ERROR` | fallback technique |

Métadonnées : `adminUserId`, `reservationId`, `tripId`, `reason`, `requestId` — jamais JWT, `bt`, ni token opaque.

## Limites V1

- Pas de passage `USED`
- Pas de consommation scan
- Pas de QR image / mobile / offline

## Futur S2-T3

Scan + consommation + statut `USED` sur base de cette validation.

## Tests

```bash
node backend/scripts/s2-t2-boarding-validation-test.mjs
```

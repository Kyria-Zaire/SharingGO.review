# S1.5-T1 — Reservation Retrieval + User History API

Ticket : lecture seule des réservations confirmées (et statuts) pour l’utilisateur connecté. Base « Mes trajets / Mes réservations » avant QR et mobile.

## Objectifs

- Lister les réservations du user (`GET /api/reservations`)
- Détail d’une réservation + paiement safe (`GET /api/reservations/:id`)
- Owner only — jamais de données d’un autre utilisateur
- Aucune exposition Stripe interne ni `boardingToken`

## Relation avec S1-T3 / S1-T4

| Étape | Ticket |
|-------|--------|
| Pending 2 min | S1-T3 |
| Checkout + webhook → CONFIRMED | S1-T4 |
| **Lecture historique** | S1.5-T1 (ce ticket) |

Ce ticket **ne modifie pas** le moteur pending, Stripe, ni les webhooks.

## Routes

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/reservations` | `requireAuth` | Liste paginée, filtres |
| GET | `/api/reservations/:id` | `requireAuth` | Détail owner only |

Routes pending inchangées : `POST/GET/DELETE /api/reservations/pending…`

## Ownership

- Filtre Prisma `userId = req.user.id`
- Détail : `findFirst({ id, userId })` → **404 `RESERVATION_NOT_FOUND`** si absent ou autre user (pas de 403 pour éviter la fuite d’existence)

## Query params — `GET /api/reservations`

| Param | Type | Défaut | Règles |
|-------|------|--------|--------|
| `status` | enum ReservationStatus | — | Optionnel |
| `upcoming` | `true` / `false` | — | `trip.departureTime >= now`, tri départ **asc** |
| `past` | `true` / `false` | — | `trip.departureTime < now`, tri départ **desc** |
| `limit` | 1–100 | 50 | Max 100 |
| `offset` | ≥ 0 | 0 | Pagination |

- `upcoming=true` **et** `past=true` → **400 `VALIDATION_ERROR`**
- Sans filtre temps : tri `trip.departureTime` **desc** (historique récent en premier)

## Serializers safe

### Payment (`reservations.serializers.ts`)

Exposé : `id`, `status`, `type`, `amount`, `currency`, `createdAt`

**Non exposé** : `stripePaymentIntentId`, `stripeCheckoutSessionId`, `stripeInvoiceId`, `stripeSubscriptionId`, metadata Stripe

### Reservation

Exposé : `id`, `status`, `trip` (+ `line`), `payment`, `createdAt` (liste) / `updatedAt` (détail)

**Non exposé** : `boardingToken`, user complet, champs Stripe

## QR / boardingToken

Volontairement **absent** de la réponse — ticket QR ultérieur.

## Erreurs

| Code | HTTP |
|------|------|
| `UNAUTHORIZED` | 401 |
| `VALIDATION_ERROR` | 400 |
| `RESERVATION_NOT_FOUND` | 404 |

## Exemples curl

```powershell
# Login
curl.exe -c cookies.txt -H "Content-Type: application/json" `
  -d "{\"email\":\"user@example.com\",\"password\":\"TestPass123!\"}" `
  http://localhost:3000/api/auth/login

# Liste
curl.exe -b cookies.txt http://localhost:3000/api/reservations
curl.exe -b cookies.txt "http://localhost:3000/api/reservations?status=CONFIRMED&upcoming=true&limit=10"

# Détail
curl.exe -b cookies.txt http://localhost:3000/api/reservations/RESERVATION_ID

# Sans cookie → 401
curl.exe http://localhost:3000/api/reservations
```

## Fichiers

- `backend/src/modules/reservations/reservations.serializers.ts`
- `backend/src/modules/reservations/reservations.schemas.ts` (query list)
- `backend/src/modules/reservations/reservations.service.ts` (list/get)
- `backend/src/modules/reservations/reservations.controller.ts`
- `backend/src/modules/reservations/reservations.routes.ts`

## Limites V1

- Pas de pending dans cette liste (modèle `Reservation` uniquement)
- Pas de remboursement / annulation / QR
- Pas de route admin historique global

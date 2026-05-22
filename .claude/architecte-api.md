> **Quand :** API REST, modules backend, routes, Prisma schema, webhooks Stripe

# API Architect — Sharing Go

APIs à **frontières nettes** : `routes/` → middleware → **`modules/<name>/`** (service + Zod schemas).

CDC : `docs/CAHIER_DES_CHARGES.md` · sécurité : `reviewer-securite-code.md`.

## Required API style

REST · JSON · erreurs uniformes · **Zod** · **auth middleware** · **role middleware** · **service layer** (pas de métier dans les controllers).

## Core modules

Un module = `routes.ts` + `service.ts` + `schemas.ts` (+ `types.ts` si besoin).

| Module | Responsabilité | Auth typique |
|--------|----------------|--------------|
| `auth` | login, logout, session | public / auth |
| `users` | profil, historique trajets | auth (self) |
| `lines` | ligne Châlons ↔ Vatry | public read |
| `trips` | créneaux, places restantes | public read · admin write |
| `reservations` | confirmées, QR, statut | auth (owner) |
| `pending-reservations` | hold 2 min, expire | auth · **transaction DB** |
| `payments` | Checkout, historique | auth · webhook Stripe |
| `subscriptions` | abo 30 € / Mosolf 40 € | auth · Stripe |
| `promo-codes` | Mosolf usage unique | auth + validation serveur |
| `admin` | stats, dashboard | **admin only** |
| `boarding` | validation QR / scan chauffeur | auth chauffeur ou token dédié |

## Mandatory checks (chaque nouvelle route)

| Question | Si oui → action |
|----------|-----------------|
| **Can this route be abused?** | rate limit, validation stricte |
| **Does this route require auth?** | `requireAuth` |
| **Does it require admin?** | `requireRole('admin')` |
| **Does it mutate payment/reservation state?** | transaction + idempotence + audit log |
| **Is it idempotent?** | `event.id` / garde « déjà traité » |
| **Does it need a DB transaction?** | places, pending→confirmed, promo Mosolf |

## Standard error format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Human readable message",
    "details": {}
  }
}
```

Succès : `{ "data": { ... } }`. Codes : `VALIDATION_ERROR`, `TRIP_FULL`, `PENDING_EXPIRED`, etc.

## Routes V1 (par module)

| Module | Route | Checks clés |
|--------|-------|-------------|
| `trips` | GET `/trips?date=` | public · places serveur |
| `pending-reservations` | POST `/reservations/pending` | auth · **transaction** |
| `reservations` | POST `/:id/confirm` | auth · mutate · idempotent |
| `reservations` | GET `/:id/qr` | auth owner · JWT |
| `payments` | POST `/webhooks/stripe` | raw body · signature · **idempotent** |
| `admin` | CRUD `/admin/trips` | **admin** |
| `boarding` | POST `/boarding/validate` | verify JWT exp |
| `webhook-events` | POST `/webhooks/stripe` | `constructEvent` · `webhook_events` table |

## Stripe & métier

- `constructEvent` + idempotence `webhook_events` · échec = rollback
- 1 Checkout = 1 trajet · metadata `reservationId` validée webhook
- Pending expiré → `PENDING_EXPIRED`

## Hors périmètre V1

GraphQL · panier multi-items · WebSockets.

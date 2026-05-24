# S2-T8C — Subscription Booking Bypass

## Objectif

Permettre à un utilisateur avec **abonnement actif** (`SubscriptionStatus.ACTIVE` et `currentPeriodEnd` > maintenant) de réserver un trajet **sans** Stripe Checkout ticket, tout en conservant la même sécurité réservation que le flux ticket (capacité, verrou `FOR UPDATE`, anti-surbooking, audit).

## Relation S2-T8A / S2-T8B

| Ticket | Rôle |
|--------|------|
| S2-T8A | Modèle `Subscription`, `hasActiveSubscription()`, `GET /api/subscriptions/me` |
| S2-T8B | Checkout Stripe Billing, webhooks, cycle de vie abonnement |
| **S2-T8C** | **Utilisation** de l'abonnement pour réserver (bypass paiement ticket uniquement) |

## Route dédiée

`POST /api/reservations/book-with-subscription`

**Pourquoi une route séparée (pas `/pending`)** : le flux pending est couplé au TTL et au checkout ticket. Mélanger abonnement et pending rendrait le moteur ambigu (expiration, consommation webhook). La route explicite documente l'intention produit : réservation confirmée immédiate.

### Request

```json
{ "tripId": "<uuid>" }
```

### Response (201)

```json
{
  "reservation": { "id": "...", "status": "CONFIRMED" },
  "payment": {
    "id": "...",
    "type": "SUBSCRIPTION_ACCESS",
    "status": "SUCCEEDED",
    "amount": "0.00",
    "currency": "eur"
  },
  "remainingSeats": 7
}
```

## Payment `SUBSCRIPTION_ACCESS`

- `PaymentType.SUBSCRIPTION_ACCESS` (enum Prisma)
- `amount = 0.00`, `currency = eur`, `status = SUCCEEDED`
- Pas de `stripePaymentIntentId` ni `stripeCheckoutSessionId`
- Trace uniforme pour historique utilisateur / admin

## Sécurité transactionnelle

Dans `prisma.$transaction()` :

1. `lockTripForUpdate` (PostgreSQL `FOR UPDATE`)
2. `deleteExpiredPendingForTrip`
3. Re-vérification abonnement actif **dans** la transaction (race expiration)
4. Refus si pending active même user/trip → `PENDING_ALREADY_EXISTS`
5. Refus si réservation CONFIRMED/USED existe → `RESERVATION_ALREADY_EXISTS`
6. `countOccupiedSeats` (CONFIRMED + USED + pending actives)
7. Si plein → `TRIP_FULL`
8. Création `Reservation` CONFIRMED + `Payment` SUBSCRIPTION_ACCESS

Pré-contrôle `hasActiveSubscription()` hors transaction pour message rapide ; la transaction refait la requête subscription.

## Règle absolue

```text
On bypass le paiement Stripe ticket,
pas la sécurité réservation.
```

## Codes d'erreur

| Code | HTTP | Cas |
|------|------|-----|
| `SUBSCRIPTION_REQUIRED` | 403 | Pas d'abonnement actif (ou expiré) |
| `TRIP_NOT_FOUND` | 404 | Trip inexistant |
| `TRIP_DISABLED` | 400 | `deletedAt` renseigné |
| `TRIP_PAST` | 400 | Départ passé (alias doc `TRIP_IN_PAST`) |
| `TRIP_FULL` | 409 | Capacité atteinte |
| `RESERVATION_ALREADY_EXISTS` | 409 | Déjà CONFIRMED/USED sur ce trip |
| `PENDING_ALREADY_EXISTS` | 409 | Pending active sur ce trip |

## Audit

- `SUBSCRIPTION_BOOKING_CONFIRMED`
- `SUBSCRIPTION_BOOKING_REJECTED_NO_ACTIVE_SUBSCRIPTION`
- `SUBSCRIPTION_BOOKING_REJECTED_FULL`
- `SUBSCRIPTION_BOOKING_REJECTED_DUPLICATE`
- `SUBSCRIPTION_ACCESS_PAYMENT_CREATED`

## Limites V1

- Pas de remboursement / annulation abonnement booking
- Pas de frontend / mobile
- Pas de modification boarding QR (identique au ticket une fois CONFIRMED)
- Un seul siège par user/trip (CONFIRMED ou USED)
- Pas de cron abonnement dans ce ticket

## Tests

```bash
node backend/scripts/s2-t8c-subscription-booking-bypass-test.mjs
```

Inclut test critique : deux abonnés, dernier siège en parallèle → un succès, un `TRIP_FULL`.

## Fichiers principaux

- `backend/src/modules/reservations/subscription-booking.service.ts`
- `backend/src/modules/reservations/reservations.routes.ts`
- `backend/prisma/migrations/20260523140000_add_subscription_access_payment_type/`

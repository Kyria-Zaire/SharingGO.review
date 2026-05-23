# S2-T8B — Stripe Subscription Checkout + Webhook Lifecycle

Ticket : brancher Stripe Billing (checkout + webhooks) sans bypass réservation.

## Objectif

- Lancer un checkout **abonnement** Stripe (`mode: subscription`)
- Maintenir `Subscription` via webhooks
- Exposer l’état via `GET /api/subscriptions/me`
- **Ne pas** modifier le flux ticket unitaire ni créer de réservation gratuite (S2-T8C)

## Variables d’environnement

```env
STRIPE_PRICE_MOSOLF_MONTHLY=price_...
STRIPE_PRICE_CONVOYEUR_MONTHLY=price_...
STRIPE_SUBSCRIPTION_SUCCESS_URL=http://localhost:5173/subscription/success
STRIPE_SUBSCRIPTION_CANCEL_URL=http://localhost:5173/subscription/cancel
```

Créer les **Price** récurrents dans le Dashboard Stripe (test mode).

## API

### `POST /api/subscriptions/checkout`

Body : `{ "type": "MOSOLF_MONTHLY" | "CONVOYEUR_MONTHLY" }`

| Code | Raison |
|------|--------|
| 409 | `SUBSCRIPTION_ALREADY_ACTIVE` |
| 403 | `SUBSCRIPTION_NOT_ELIGIBLE` (Mosolf) |
| 502 | `CHECKOUT_CREATE_FAILED` |

### Mosolf eligibility V1

- `CONVOYEUR_MONTHLY` : tout utilisateur connecté
- `MOSOLF_MONTHLY` : `@mosolf.com` ou `@sharinggo.demo` (seed/dev)
- Code promo complet : ticket futur

## Webhooks (idempotence `WebhookEvent`)

| Event | Action |
|-------|--------|
| `checkout.session.completed` + `mode=subscription` | Upsert `Subscription` ACTIVE (retrieve Stripe subscription) |
| `checkout.session.completed` + `mode=payment` | Flux ticket existant (inchangé) |
| `customer.subscription.created` | Upsert |
| `customer.subscription.updated` | MAJ status + périodes |
| `customer.subscription.deleted` | `CANCELED` + `canceledAt` |

Mapping Stripe → `SubscriptionStatus` :

| Stripe | Local |
|--------|-------|
| active, trialing | ACTIVE |
| past_due, unpaid, paused | PAST_DUE |
| canceled | CANCELED |
| incomplete | INCOMPLETE |
| incomplete_expired | EXPIRED |

## `currentPeriodEnd`

Toujours depuis `subscription.current_period_end` Stripe (pas de `expiresAt` local).

## Double abonnement

- Checkout : bloqué si actif (`hasActiveSubscription`)
- Webhook : warn si autre ACTIVE existe — Stripe reste source de vérité (dette documentée)

## Tests locaux

```bash
node backend/scripts/s2-t8b-stripe-subscription-lifecycle-test.mjs
```

Stripe CLI (checkout réel) :

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Puis compléter un checkout abonnement test.

## Exclusions

- Pas de `Payment SUBSCRIPTION_ACCESS`
- Pas de bypass pending/réservation
- Pas de portail client / prorata / coupons Mosolf complets

## Suite

- **S2-T8C** — utiliser `hasActiveSubscription()` pour réservation sans paiement unitaire

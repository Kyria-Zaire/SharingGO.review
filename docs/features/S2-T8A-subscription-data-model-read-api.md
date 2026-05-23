# S2-T8A — Subscription Data Model + Read API

Ticket : fondation données abonnement + API lecture — **sans** Stripe Billing ni bypass réservation.

## Objectif

Répondre de façon fiable à : **« cet utilisateur a-t-il un abonnement actif ? »**

Prérequis avant S2-T8B (checkout abonnement) et S2-T8C (accès récurrent / bypass ticket).

## Modèle `Subscription`

| Champ | Rôle |
|-------|------|
| `type` | `MOSOLF_MONTHLY` \| `CONVOYEUR_MONTHLY` |
| `status` | `ACTIVE`, `PAST_DUE`, `CANCELED`, `EXPIRED`, `INCOMPLETE` |
| `currentPeriodStart` | Optionnel (début période Stripe) |
| `currentPeriodEnd` | **Source d'expiration** (aligné Stripe) |
| `stripeSubscriptionId` | Unique, nullable — **non exposé** API lecture |
| `stripeCustomerId` | Nullable — **non exposé** |
| `canceledAt` | Nullable |

Pas de champ `expiresAt` local : utiliser `currentPeriodEnd`.

## Règle active V1

```text
status = ACTIVE
AND currentPeriodEnd > now()
```

Helpers :

- `getActiveSubscriptionForUser(userId)`
- `hasActiveSubscription(userId)`
- `isSubscriptionActive(subscription)`

Si plusieurs abonnements ACTIVE : le plus récent (`createdAt desc`). S2-T8B devra empêcher les doubles abonnements actifs au checkout.

## API

```http
GET /api/subscriptions/me
```

Auth : `requireAuth`.

| Cas | Réponse |
|-----|---------|
| Aucun abonnement | `{ "subscription": null, "isActive": false }` |
| Actif | `subscription` + `isActive: true` |
| Expiré / inactif | `subscription` + `isActive: false` |

## Mosolf (note)

Éligibilité Mosolf (code personnel, whitelist email, `@mosolf.com`) = **service dédié futur**. Ce ticket stocke seulement le type `MOSOLF_MONTHLY`.

## Seed demo

| Email | Type | Status | `currentPeriodEnd` |
|-------|------|--------|-------------------|
| `mosolf-active@sharinggo.demo` | MOSOLF_MONTHLY | ACTIVE | now + 30j |
| `mosolf-expired@sharinggo.demo` | MOSOLF_MONTHLY | EXPIRED | now - 1j |
| `convoyeur-monthly@sharinggo.demo` | CONVOYEUR_MONTHLY | ACTIVE | now + 30j |

Mot de passe : `DemoPassword123!`

## Exclusions (respectées)

- Pas de Stripe Subscription Checkout
- Pas de webhook subscription
- Pas de bypass réservation / `SUBSCRIPTION_ACCESS`
- Pas de changement ticket / boarding

## Prochains tickets

- **S2-T8B** — Stripe Subscription checkout + webhooks
- **S2-T8C** — Réservation gratuite / accès récurrent via abonnement actif

## Tests

```bash
node backend/scripts/s2-t8a-subscription-read-api-test.mjs
```

## Migration

`20260523120000_subscription_model_enhancements` — `EXPIRED`, `stripeCustomerId`, `canceledAt`, `currentPeriodStart` optionnel.

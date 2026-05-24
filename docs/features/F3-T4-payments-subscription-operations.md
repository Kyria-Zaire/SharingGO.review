# F3-T4 — Payments & Subscription Operations

## Objectif

Supervision financière admin : liste paginée des paiements (ticket, abonnement, accès abonnement à 0 €) et page abonnements V1 informative en attendant l’API admin subscriptions.

Frontend uniquement — aucune modification backend.

## Endpoints consommés

| Méthode | Route | Usage |
|---------|-------|--------|
| GET | `/api/admin/payments` | Liste avec filtres + `limit` / `offset` |

Query params : `status`, `type`, `userId`, `reservationId`, `from`, `to`, `limit`, `offset`.

**Pas de** `GET /api/admin/payments/:id` — informations suffisantes dans la table (pas de drawer fake).

## Backend follow-up

```
GET /api/admin/subscriptions
```

Préparer plus tard :

- abonnements actifs / expirés / canceled / past_due
- filtrage status / type
- détail client

## Composants

| Composant | Rôle |
|-----------|------|
| `PaymentsTable` | Table opérationnelle |
| `PaymentsFilters` | Statut, type, dates, limite, pagination |
| `PaymentsPageKpis` | Compteurs page courante |
| `PaymentContextBadge` | Contexte paiement déductible des données API |
| `SubscriptionsPage` | V1 informative Mosolf / Convoyeur |

Fichiers : `api/admin-payments.api.ts`, `types/payments.types.ts`, `lib/format-currency.ts`.

## formatCurrency()

Helper centralisé `frontend/src/lib/format-currency.ts` :

- `formatCurrency(amount, currency)` — locale `fr-FR`, `eur` → `EUR`
- `parseCurrencyAmount()` — somme KPIs page courante
- SUBSCRIPTION_ACCESS affiché `0,00 €`

## PaymentContextBadge

Déduction depuis `AdminPayment` (sans inventer) :

| Condition | Label |
|-----------|--------|
| `type === SUBSCRIPTION_ACCESS` | Accès abonnement |
| `reservationId` présent | Réservation liée |
| `type === SUBSCRIPTION next` | Abonnement Stripe |
| Sinon | — |

Pas de « Trip linked » — l’API admin payments ne retourne pas le trajet (seulement `reservationId`).

## KPIs

Compteurs dérivés **uniquement** de la page courante :

- Total paiements
- Réussis (SUCCEEDED)
- Échoués (FAILED)
- Montant réussi (somme SUCCEEDED)

Label obligatoire : **« Sur la page affichée »** — jamais présenté comme total global.

## Pagination

- `limit` (défaut 50), `offset` (défaut 0)
- Page préc. / Page suiv.

## TanStack Query

- Liste paiements : `staleTime: 30_000`
- Query key : `queryKeys.admin.payments.list(filters)`

## SubscriptionsPage V1

Page informative structurée (non cassée) :

- Mosolf Monthly / Convoyeur Monthly
- Lifecycle Stripe backend documenté
- Limitations admin actuelles
- Lien vers `/payments`
- Note backend follow-up `GET /api/admin/subscriptions`

## Données sensibles

**Non affichées** : Stripe PaymentIntent / CheckoutSession / Subscription IDs complets, secrets, metadata brute.

**Autorisées** si API : `stripePaymentIntentRef`, `stripeCheckoutSessionRef` (refs courtes — non exposées en table V1).

## Limitations F3-T4

- Pas de remboursement / portail Stripe / webhook UI
- Pas de détail paiement (endpoint absent)
- Pas de liste admin abonnements
- Pas d’export CSV / graphiques

## Prochains tickets

- `GET /api/admin/subscriptions` + table abonnements
- Détail abonnement client
- Remboursement admin (si backend)
- Code-splitting bundle admin

## Test manuel

1. Backend + seed, login admin
2. `/payments` : liste, filtres type/status, SUBSCRIPTION_ACCESS à 0,00 €, KPIs
3. `/subscriptions` : contenu informatif crédible
4. DRIVER / CONVOYEUR interdits via guard admin

# F4A-T7 — Passenger Stripe Checkout Redirect & Return

Ticket : activer le paiement Hosted Checkout depuis la page pending, pages retour success/cancel, polling confirmation webhook.

## Flow utilisateur

```text
PendingReservationPage (non expirée)
  → clic « Payer maintenant »
  → POST /api/payments/checkout { pendingReservationId }
  → sessionStorage sharinggo_last_checkout { pendingReservationId, stripeCheckoutSessionId, tripId, startedAt }
  → window.location.href = checkoutUrl (Stripe Hosted)

Stripe success
  → redirect STRIPE_SUCCESS_URL → /bookings/payment/success?session_id=cs_...
  → PaymentSuccessPage poll backend (max 60 s)
  → Payment SUCCEEDED + Reservation CONFIRMED → succès affiché
  → clear sharinggo_last_checkout

Stripe cancel
  → redirect STRIPE_CANCEL_URL → /bookings/payment/cancel
  → PaymentCancelPage → retour pending si sessionStorage connu
  → pending NON annulée automatiquement
```

**Aucune confirmation optimiste** — la page success attend le webhook via polling API.

## Endpoints utilisés

| Fonction client | Méthode | Route |
|-----------------|---------|-------|
| `createCheckoutSession(pendingReservationId)` | POST | `/api/payments/checkout` |
| `listPayments({ type: "TICKET" })` | GET | `/api/payments` |
| `getPayment(id)` | GET | `/api/payments/:id` |
| `listUserReservations()` | GET | `/api/reservations` |

Toutes les requêtes : `credentials: "include"`.

## Contrat checkout

**Request :**

```json
{ "pendingReservationId": "string" }
```

**Response (200) :**

```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "stripeCheckoutSessionId": "cs_..."
}
```

Pas de `paymentId` côté réponse — le polling identifie la confirmation via `tripId` + statuts.

## sessionStorage (non-auth)

Clé : `sharinggo_last_checkout`

```json
{
  "pendingReservationId": "...",
  "stripeCheckoutSessionId": "cs_...",
  "tripId": "...",
  "startedAt": "ISO8601"
}
```

Autorisé uniquement pour reprendre le flux checkout/cancel — **jamais** pour l’auth.

## Stratégie polling (PaymentSuccessPage)

Intervalle : **3 s** · durée max : **60 s**

1. `GET /api/payments?type=TICKET&limit=20` — chercher `SUCCEEDED` + `reservation.status === CONFIRMED` + `trip.id === tripId` + `createdAt >= startedAt`
2. Fallback : `GET /api/reservations?limit=20` — même critères sur liste réservations

États UX :

| État | Affichage |
|------|-----------|
| `confirming` | « Paiement reçu, confirmation en cours… » + spinner |
| `confirmed` | « Réservation confirmée » + CTAs |
| `timeout` | « Paiement en cours de confirmation » (pas d’échec brutal) |

## Erreurs checkout gérées

| Code | Message / action |
|------|------------------|
| `401` | Redirect login + `state.from` |
| `PENDING_EXPIRED` | Message inline page pending |
| `PENDING_NOT_FOUND` | Message inline |
| `PENDING_ALREADY_CONSUMED` | Message inline |
| `FORBIDDEN` | Message inline |
| `TRIP_FULL` / `TRIP_PAST` / `TRIP_DISABLED` | Message inline |
| `RATE_LIMITED_CHECKOUT` | Message inline |
| `CHECKOUT_CREATE_FAILED` | Message inline |

## Routes passenger

| Path | Page | Auth |
|------|------|------|
| `/bookings/payment/success` | `PaymentSuccessPage` | `RequireAuth` |
| `/bookings/payment/cancel` | `PaymentCancelPage` | `RequireAuth` |

## Configuration env recommandée (dev)

Dans `.env` backend (pas de modification code backend) :

```env
STRIPE_SUCCESS_URL=http://localhost:5174/bookings/payment/success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=http://localhost:5174/bookings/payment/cancel
```

Prérequis locaux :

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copier whsec_… → STRIPE_WEBHOOK_SECRET → restart backend
```

Passenger app : `5174` · Backend : `3000` · CORS inclut `:5174`.

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `api/payments.api.ts` | Checkout + list/get payments |
| `hooks/useCreateCheckoutSession.ts` | Mutation + redirect Stripe |
| `hooks/usePaymentConfirmationPoll.ts` | Polling confirmation |
| `lib/checkout-session-storage.ts` | sessionStorage checkout context |
| `pages/PendingReservationPage.tsx` | CTA paiement actif |
| `pages/PaymentSuccessPage.tsx` | Retour success + poll |
| `pages/PaymentCancelPage.tsx` | Retour cancel |

## Limites hors scope

- Stripe Elements / publishable key frontend
- Abonnement Mosolf bypass (`book-with-subscription`)
- QR boarding pass
- Historique réservations complet → **F4A-T8**
- Backend webhook / Prisma
- `GET /api/payments` ne filtre pas par `stripeCheckoutSessionId` (API user-safe)

## Risque connu V1

Pending TTL **2 min** : si l’utilisateur dépasse ce délai sur Stripe, le webhook peut rejeter (`PENDING_EXPIRED`) alors que Stripe a débité — remboursement manuel (documenté S1-T4).

## Dépendances

- F4A-T6A — page pending + countdown
- S1-T4 — backend checkout + webhook

## Prochain ticket

**F4A-T8** — historique réservations passenger (`GET /api/reservations` UI).

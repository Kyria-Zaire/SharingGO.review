# S1-T4 — Stripe Checkout Integration

Ticket : paiement ticket unique (8 EUR) pour transformer une `PendingReservation` valide en `Reservation` CONFIRMED. **Le webhook Stripe est la seule source de vérité** — le frontend ne confirme jamais une réservation.

## Flow cible

```
1. POST /api/reservations/pending { tripId }     → pending 2 min
2. POST /api/payments/checkout { pendingReservationId }  → Stripe Checkout + Payment PENDING
3. Utilisateur paie sur Stripe Hosted Checkout
4. Stripe → POST /api/webhooks/stripe (checkout.session.completed)
5. Backend (transaction + FOR UPDATE) :
   - idempotence WebhookEvent
   - vérif pending (owner, non expirée, non consommée)
   - vérif capacité
   - Reservation CONFIRMED
   - Payment PENDING → SUCCEEDED (même enregistrement via stripeCheckoutSessionId)
   - PendingReservation.consumedAt
6. GET /api/trips → disponibilité mise à jour
```

## Prix V1

| Paramètre | Valeur |
|-----------|--------|
| Montant | 8,99 EUR |
| Centimes Stripe | `STRIPE_TICKET_PRICE_CENTS=899` |
| Devise | `eur` uniquement |
| Type | `PaymentType.TICKET` |

Pas d’abonnement, coupon, Mosolf, QR, remboursement auto.

## Variables d’environnement

Voir `.env.example` :

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL`
- `STRIPE_TICKET_PRICE_CENTS` (entier positif)
- `STRIPE_CURRENCY=eur`

## Raw body webhook (critique)

La route webhook est montée **avant** `express.json()` :

```http
POST /api/webhooks/stripe
```

Middleware : `express.raw({ type: 'application/json' })`.

Vérification signature :

```ts
stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
```

## Idempotence

Modèle `WebhookEvent` avec `@@unique([provider, eventId])`.

- Premier `event.id` : traitement métier puis création `WebhookEvent` **dans la même transaction** que la confirmation.
- Doublon `event.id` : détection avant transaction → `200` + audit `STRIPE_WEBHOOK_DUPLICATE`.
- Race concurrente : contrainte unique `P2002` → `200` sans doublon réservation.

## Lien Payment PENDING → SUCCEEDED (évite doublon)

Décision CTO : pas de `pendingReservationId` sur `Payment` en V1.

| Étape | Payment |
|-------|---------|
| Checkout | `PENDING`, `stripeCheckoutSessionId` = session Stripe, `reservationId` null |
| Webhook | **UPDATE** du même Payment → `SUCCEEDED`, `reservationId` renseigné |

Metadata Stripe : `pendingReservationId`, `userId`, `tripId` + `client_reference_id`.

Champ ajouté au schéma : `Payment.stripeCheckoutSessionId` (unique) — nécessaire pour retrouver l’enregistrement PENDING sans `pendingReservationId` en colonne.

## Routes

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/payments/checkout` | Oui | Crée session Checkout + Payment PENDING |
| POST | `/api/webhooks/stripe` | Signature Stripe | Fulfillment `checkout.session.completed` |

Pas de route statut paiement en V1 — le frontend pourra s’appuyer plus tard sur `/api/auth/me` + endpoints réservations.

## Codes d’erreur

| Code | Contexte |
|------|----------|
| `PENDING_NOT_FOUND` | Pending introuvable |
| `PENDING_EXPIRED` | Checkout refusé si expirée |
| `PENDING_ALREADY_CONSUMED` | Déjà payée / consommée |
| `CHECKOUT_CREATE_FAILED` | Erreur Stripe API |
| `STRIPE_SIGNATURE_INVALID` | Webhook non authentifié |
| `WEBHOOK_METADATA_INVALID` | Metadata session incomplète |

## Pending expirée au webhook

- Pas de `Reservation` CONFIRMED
- Payment PENDING → `FAILED`
- Audit `PAYMENT_REJECTED_PENDING_EXPIRED`
- HTTP **200** (évite retries infinis Stripe) — remboursement manuel documenté pour S1-T5/S2

## Audit logs

`CHECKOUT_CREATED`, `CHECKOUT_CREATE_FAILED`, `STRIPE_WEBHOOK_RECEIVED`, `STRIPE_WEBHOOK_DUPLICATE`, `PAYMENT_SUCCEEDED`, `RESERVATION_CONFIRMED`, `PAYMENT_REJECTED_PENDING_EXPIRED`.

Jamais loggués : secrets Stripe, webhook secret, raw body complet, données carte, URL checkout complète.

## Tests E2E CTO (obligatoires avant commit)

### Prérequis

1. Clés test dans `.env` : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (pas de placeholder)
2. Stripe CLI : `winget install Stripe.StripeCli`
3. Terminal A (laisser ouvert) :

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. Copier le `whsec_…` dans `.env`, puis :

```bash
docker compose -f docker-compose.dev.yml restart backend
```

### Script automatisé (4 tests)

```powershell
.\scripts\run-s1-t4-e2e.ps1
```

Ou : `node backend/scripts/s1-t4-stripe-e2e.mjs`

| Test | Vérification |
|------|----------------|
| 1 Checkout réel | `stripe checkout sessions pay` → Payment SUCCEEDED, Reservation CONFIRMED, `consumedAt` |
| 2 Duplicate | `stripe events resend` → 0 nouvelle Reservation/Payment, audit duplicate |
| 3 Pending expirée | SQL expire pending → pay → Payment FAILED, 0 Reservation |
| 4 Disponibilité | `remainingSeats` diminue après TEST 1 |

### Tests manuels (carte 4242)

```bash
# pending → POST /api/payments/checkout → ouvrir checkoutUrl
# Carte test : 4242 4242 4242 4242
```

## Limitations V1

- Pas d’abonnements / Mosolf / coupons / QR
- Pas de remboursement automatique
- Pas de notification email
- Pas de confirmation côté frontend
- Pas de `GET /api/payments/:id` (optionnel reporté)

## Fichiers principaux

- `backend/src/modules/payments/`
- `backend/src/app.ts` (raw body webhook)
- `backend/prisma/schema.prisma` (`WebhookEvent`, `Payment.stripeCheckoutSessionId`)
- `backend/src/config/env.ts`

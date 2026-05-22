# Runbook — Échecs / anomalies webhook Stripe

> **Scope** : `POST /api/webhooks/stripe` (Checkout `checkout.session.completed`).  
> **Pas de modification DB en production** sans procédure validée.

## Cas : pending expirée au moment du webhook

### Comportement actuel (attendu)

1. Stripe envoie `checkout.session.completed` après paiement utilisateur.
2. Le backend charge la `PendingReservation` via metadata (`pendingReservationId`, `userId`, `tripId`).
3. Si `expiresAt <= now` et `consumedAt` est null :
   - `Payment` lié à la session → **`FAILED`**
   - **Aucune** `Reservation` CONFIRMED créée
   - `WebhookEvent` enregistré (idempotence)
   - Réponse HTTP **200** `{ "received": true }` (Stripe ne doit pas retry indéfiniment pour ce cas métier)

### Logs à consulter

| Message | Niveau | Champs utiles |
|---------|--------|----------------|
| `Payment rejected: pending expired at webhook` | warn | `pendingReservationId`, `eventId` |
| `Webhook: pending not found` | warn | `eventId` |
| `Stripe webhook signature verification failed` | warn | *(aucune signature)* |

**Ne pas chercher** : raw body, `Stripe-Signature`, IDs Stripe complets en info (refs courtes `demo_pi_...` / `cs_...abcd` en debug seulement).

### Vérifications base (lecture seule)

```sql
-- Remplacer SESSION_ID par stripeCheckoutSessionId (table Payment)
SELECT id, status, "reservationId", "userId", "createdAt"
FROM "Payment"
WHERE "stripeCheckoutSessionId" = 'SESSION_ID';

SELECT id, "expiresAt", "consumedAt", "tripId", "userId"
FROM "PendingReservation"
WHERE id = 'PENDING_ID';
```

Attendu si pending expirée : `Payment.status = FAILED`, pas de ligne `Reservation` pour ce parcours.

### Vérification Stripe Dashboard

1. Paiements → session Checkout / Payment Intent associé.
2. Confirmer si le montant a été **capturé** malgré l’échec métier.
3. Webhooks → livraison de l’événement (code 200).

### Actions manuelles possibles

| Situation | Action |
|-----------|--------|
| Paiement **non capturé** | Aucune action métier ; informer le passager (nouvelle pending + checkout). |
| Paiement **capturé** sans réservation | **Remboursement manuel** via Stripe Dashboard (procédure support / finance). Ne pas « rejouer » le webhook sans analyse. |
| Pending encore valide côté produit | Vérifier décalage horaire serveur / TTL 2 min ; corriger process, pas la DB. |

### Interdits

- Rejouer aveuglément un événement Stripe en production.
- Créer manuellement une `Reservation` sans tracer l’incident.
- Supprimer des `WebhookEvent` pour « forcer » un retraitement.
- Modifier `Payment` / `Reservation` en SQL sans ticket incident.

## Autres cas rapides

| Symptôme | Piste |
|----------|--------|
| `STRIPE_SIGNATURE_INVALID` (400) | Secret `STRIPE_WEBHOOK_SECRET` / `stripe listen` désaligné |
| Doublon `event.id` | Normal — log debug `Stripe webhook duplicate ignored` |
| Trajet plein au webhook | warn `Payment rejected: trip over capacity` — Payment FAILED |
| Pending déjà consommée | warn `Webhook received for already consumed pending` — 200, pas de double réservation |

## Références

- `docs/features/S1-T4-stripe-checkout-integration.md`
- `docs/features/S1-5-T7-logging-normalization-review.md`

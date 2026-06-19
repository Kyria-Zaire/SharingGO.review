# QA-02C — Webhook Replay / Idempotence

**Ticket :** QA-02C  
**Feature :** FEATURE-QA-02 — Passenger Edge Cases & Hardening  
**Phase BMAD :** VERIFY  
**Date de validation :** 2026-06-19  
**Environnement :** local Windows · backend Docker `:3000` · Stripe test (`STRIPE_WEBHOOK_SECRET`)  
**Verdict :** **PASS** — review CTO approuvée  
**Risque :** **faible** (replay même `event.id`)  
**Code modifié :** aucun

---

## 1. Résumé exécutif

```text
1er checkout.session.completed
→ Payment SUCCEEDED
→ Reservation CONFIRMED
→ pending consommée
→ WebhookEvent enregistré

Replay même event.id ×5
→ 200 {"received":true}
→ aucun doublon
→ STRIPE_WEBHOOK_DUPLICATE audité (×5)
```

**Conclusion :** l’idempotence webhook est solide. Le backend répond **200** à Stripe (évite retries infinis) tout en neutralisant le doublon métier.

---

## 2. Événement Stripe utilisé

| Champ | Valeur |
|-------|--------|
| **event.id** | `evt_qa02c_1781866006781` |
| **type** | `checkout.session.completed` |
| **mode** | `payment` (ticket) |
| **session.id** | `cs_test_a1U7T0Wj21XfWEYoOTh6xMcpNdLgPJk7eC7gQgMVHip596wY9YwB3LzlQY` |
| **pendingId** | `cmqkt0ho70024qo0t0g8xlt2d` |
| **userId** | `cmqkt0hbs001yqo0tqutvmx6b` |
| **tripId** | `cmqj9ltpv002rlh5i6up1j79w` |
| **reservationId** (créée) | `cmqkt0jqy002eqo0tuwl9s9oi` |

---

## 3. Requêtes exécutées

| # | Requête | HTTP |
|---|---------|------|
| 1 | `POST /api/reservations/pending` | 201 |
| 2 | `POST /api/payments/checkout` | 200 |
| 3 | `POST /api/webhooks/stripe` (1er envoi) | 200 |
| 4–8 | `POST /api/webhooks/stripe` (replay ×5, payload identique) | 200 ×5 |

---

## 4. État DB avant / après

| Métrique | Avant 1er webhook | Après 1er webhook | Après 5 replays |
|----------|-------------------|-------------------|-----------------|
| **Reservation CONFIRMED** | 0 | 1 | **1** |
| **Payment SUCCEEDED** | 0 | 1 | **1** |
| **WebhookEvent** (`eventId`) | 0 | 1 | **1** |
| **Payment** (session) | PENDING | SUCCEEDED + `reservationId` | inchangé |
| **pending.consumedAt** | null | set | inchangé |
| **Audit `STRIPE_WEBHOOK_DUPLICATE`** | 0 | 0 | **5** |

**Delta total :** +1 CONFIRMED · +1 SUCCEEDED · +1 WebhookEvent (sur 6 envois).

---

## 5. Protections identifiées

| # | Mécanisme | Emplacement |
|---|-----------|-------------|
| 1 | `ignoreDuplicateStripeWebhook(event.id)` — early return | `stripe-webhook-idempotency.ts` |
| 2 | `WebhookEvent @@unique([provider, eventId])` | `schema.prisma` |
| 3 | `existingSucceeded` sur `stripeCheckoutSessionId` (session déjà fulfillie) | `stripe-ticket-webhook.service.ts` L88-103 |
| 4 | `pending.consumedAt` — no-op si pending déjà consommée | L126-132 |
| 5 | Catch `P2002` (race insert WebhookEvent) | L256-258 |

**Flux ticket sur replay :**

```text
handleTicketCheckoutSessionCompleted
→ ignoreDuplicateStripeWebhook? → audit STRIPE_WEBHOOK_DUPLICATE + return
→ sinon traitement transactionnel + recordStripeWebhookEventInTx
```

---

## 6. Scénarios PRD

| Scénario | Résultat |
|----------|----------|
| **A** Replay même `event.id` | PASS — aucun changement métier |
| **B** Replay ×5 | PASS — stabilité · 5 audits duplicate |
| **C** Table `WebhookEvent` + unicité | PASS |
| **D** Intégrité (1 SUCCEEDED · 1 CONFIRMED) | PASS |
| **E** Logs / audit duplicate | PASS — `STRIPE_WEBHOOK_DUPLICATE` |

---

## 7. Niveau de risque

| Dimension | Niveau |
|-----------|--------|
| **Replay même `event.id`** | **Faible** ✅ |
| **Complément QA-02B** | Risque moyen si 2 `event.id` différents (2 sessions) — atténué par `pending.consumedAt` |

---

## 8. Observations (non bloquantes)

- `ignoreDuplicateStripeWebhook` écrit `SUBSCRIPTION_WEBHOOK_IGNORED` pour le chemin générique ; le chemin **ticket** ajoute `STRIPE_WEBHOOK_DUPLICATE` — comportement correct observé.
- Réponse HTTP toujours **200** — conforme attente Stripe (pas de retry storm).

---

## 9. Références

- `docs/qa/QA-02-edge-cases-checklist.md` (QA-02C)
- `docs/qa/QA-02A-pending-expiration.md`
- `docs/qa/QA-02B-double-payment-checkout.md`
- `backend/src/modules/payments/stripe-webhook-idempotency.ts`
- `backend/src/modules/payments/stripe-ticket-webhook.service.ts`
- `backend/scripts/s1-t4-stripe-e2e.mjs` (TEST 2 duplicate)

**Prochain QA :** QA-02D — Webhook Late Replay / Pending Expired

---

*QA-02C — APPROUVÉ CTO · commit `docs(qa): validate webhook replay idempotence`.*

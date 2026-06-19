# QA-02D — Late Webhook / Expired Pending

**Ticket :** QA-02D  
**Feature :** FEATURE-QA-02 — Passenger Edge Cases & Hardening  
**Phase BMAD :** VERIFY  
**Date de validation :** 2026-06-19  
**Environnement :** local Windows · backend Docker `:3000` · Stripe test (`STRIPE_WEBHOOK_SECRET`)  
**Verdict :** **PASS** — review CTO approuvée  
**Risque :** **faible** (webhook tardif après expiration pending)  
**Code modifié :** aucun

---

## 1. Résumé exécutif

```text
Paiement initié (checkout Stripe)
↓
Pending expire (> 2 min, attente réelle)
↓
checkout.session.completed arrive après
↓
Payment FAILED
↓
Aucune Reservation CONFIRMED
↓
Aucune place consommée
```

**Conclusion :** un webhook tardif ne peut pas créer de réservation confirmée ni consommer une place. Les deux risques Stripe majeurs sont couverts :

| Risque | Ticket | Statut |
|--------|--------|--------|
| Webhook replay | QA-02C | ✅ PASS |
| Webhook tardif | QA-02D | ✅ PASS |

---

## 2. Données de test (run principal)

| Champ | Valeur |
|-------|--------|
| **event.id** | `evt_qa02d_late_1781866758368` |
| **type** | `checkout.session.completed` |
| **mode** | `payment` (ticket) |
| **session.id** | `cs_test_a1UAv8HjhljlPx4KEPLSHnY7amgyrqmlR5q14UHJ5D2OP8OoNS4cdaFgST` |
| **pendingId** | `cmqktglmi004pqo0tkk1ox7a8` |
| **userId** | `cmqktgl81004jqo0t5suzn4p8` |
| **tripId** | `cmqj9ltqn0037lh5iremynqhb` |
| **expiresAt** | `2026-06-19T11:01:17.740Z` |
| **Attente réelle** | ~125 670 ms (TTL 2 min + buffer 8 s) |

---

## 3. Requêtes exécutées

| # | Requête | HTTP |
|---|---------|------|
| 1 | `POST /api/auth/register` + `login` | 200 |
| 2 | `POST /api/reservations/pending` | 201 |
| 3 | `POST /api/payments/checkout` | 200 |
| 4 | Attente expiration (> 2 min, sans webhook) | — |
| 5 | `POST /api/webhooks/stripe` (1er envoi) | 200 |
| 6–10 | `POST /api/webhooks/stripe` (replay ×5, payload identique) | 200 ×5 |

### Variante observée (run complémentaire)

Avant le webhook tardif, appel `GET /api/reservations/pending/:id` après expiration :

- **410** `PENDING_EXPIRED` → pending supprimée côté API
- Webhook tardif → **même résultat métier** (`FAILED`, 0 CONFIRMED)

---

## 4. État DB avant / après

| Métrique | Avant expiration | Après expiration, avant webhook | Après 1er webhook | Après 5 replays |
|----------|------------------|----------------------------------|-------------------|-----------------|
| **Payment** | PENDING, `reservationId` null | PENDING | **FAILED**, `reservationId` null | inchangé |
| **Reservation CONFIRMED** (user) | 0 | 0 | **0** | **0** |
| **Places occupées** (trajet) | 1 | 1 | **1** | **1** |
| **WebhookEvent** (`eventId`) | 0 | 0 | **1** | **1** |
| **Audit `STRIPE_WEBHOOK_DUPLICATE`** | 0 | 0 | 0 | **5** |

**Delta total :** 0 CONFIRMED · Payment PENDING→FAILED · +1 WebhookEvent (sur 6 envois).

---

## 5. Logs & audits observés

### Logs backend

```text
WARN  Webhook: pending not found — eventId=evt_qa02d_late_1781866758368
DEBUG Stripe webhook duplicate ignored ×5
```

### AuditLog (run principal)

| Action | Notes |
|--------|-------|
| `CHECKOUT_CREATED` | session créée |
| `STRIPE_WEBHOOK_RECEIVED` | 1er webhook |
| `STRIPE_WEBHOOK_DUPLICATE` | ×5 (replays) |
| `SUBSCRIPTION_WEBHOOK_IGNORED` | ×5 (`reason: duplicate`) |

**Absents :** `RESERVATION_CONFIRMED`, `PAYMENT_SUCCEEDED`

---

## 6. Chemin code effectif

Ordre dans `stripe-ticket-webhook.service.ts` :

```text
handleTicketCheckoutSessionCompleted
→ deleteExpiredPendingForTrip (supprime pending expirées)
→ findFirst pending par id → null
→ AppError PENDING_NOT_FOUND
→ catch: markPaymentFailedBySessionGlobal → Payment FAILED
→ recordStripeWebhookEvent → 200 {"received":true}
```

La branche `PAYMENT_REJECTED_PENDING_EXPIRED` (L135–146) existe mais n’est pas empruntée sur le chemin nominal : `deleteExpiredPendingForTrip` retire la pending avant la recherche. **Impact sécurité : nul** — les deux chemins refusent la confirmation.

Alignement avec `backend/scripts/s1-t4-stripe-e2e.mjs` (TEST 3 — pending expirée + webhook → `FAILED`, 0 reservation).

---

## 7. Scénarios PRD

| Scénario | Résultat |
|----------|----------|
| **A** Pending expire, webhook tardif | PASS — Payment FAILED, 0 CONFIRMED |
| **B** Aucune place consommée | PASS — occupation trajet inchangée |
| **C** Webhook replay ×5 sur pending expirée | PASS — 1 WebhookEvent, idempotence stable |
| **D** Réponse HTTP maîtrisée | PASS — 200 (pas de retry storm Stripe) |
| **E** Variante GET pending 410 avant webhook | PASS — même invariant métier |

---

## 8. Niveau de risque

| Dimension | Niveau |
|-----------|--------|
| **Webhook tardif après expiration** | **Faible** ✅ |
| **Observabilité audit** | Note non bloquante — chemin nominal log `pending not found` plutôt que `PAYMENT_REJECTED_PENDING_EXPIRED` |

---

## 9. Chaîne QA validée (QA-02A → QA-02D)

```text
QA-02A  Pending expirée → checkout refusé → aucune réservation
QA-02C  Webhook replay → ignoré → aucun doublon
QA-02D  Paiement initié → pending expire → webhook tardif → FAILED, 0 CONFIRMED
```

---

## 10. Références

- `docs/qa/QA-02-edge-cases-checklist.md` (QA-02D)
- `docs/qa/QA-02A-pending-expiration.md`
- `docs/qa/QA-02B-double-payment-checkout.md`
- `docs/qa/QA-02C-webhook-replay-idempotence.md`
- `backend/src/modules/payments/stripe-ticket-webhook.service.ts`
- `backend/src/lib/trip-occupancy.ts` (`deleteExpiredPendingForTrip`)
- `backend/scripts/s1-t4-stripe-e2e.mjs` (TEST 3)

**Prochain QA :** QA-02E — Concurrent Seat Booking

---

*QA-02D — APPROUVÉ CTO · commit `docs(qa): validate late webhook expired pending behavior`.*

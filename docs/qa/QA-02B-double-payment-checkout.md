# QA-02B — Double Payment / Double Click Checkout

**Ticket :** QA-02B  
**Feature :** FEATURE-QA-02 — Passenger Edge Cases & Hardening  
**Phase BMAD :** VERIFY  
**Date de validation :** 2026-06-19  
**Environnement :** local Windows · backend Docker `:3000` · Stripe test  
**Verdict :** **PASS** (risque résiduel **moyen**) — review CTO approuvée  
**Code modifié :** aucun

---

## 1. Résumé exécutif

```text
2 checkout sessions possibles (race parallèle)
↓
mais 1 seule Reservation CONFIRMED
↓
1 seule place consommée
↓
2e webhook neutralisé
```

**Intégrité métier (siège / réservation) :** le système tient.

**Risque financier résiduel :** 2 paiements Stripe possibles → 1 seul billet → remboursement manuel potentiel. Non bloquant MVP ; **hardening P0 avant production réelle**.

---

## 2. Environnement

| Composant | Configuration |
|-----------|---------------|
| **Backend** | `http://localhost:3000` |
| **Stripe** | Mode test · `STRIPE_WEBHOOK_SECRET` configuré |
| **User test** | `qa02b-{timestamp}@example.com` (créé à l’exécution) |
| **Pending ID** | `cmqksj7z70015qo0tyxgue47v` |
| **Trip ID** | `cmqj9ltp3002blh5ik92y464v` |

---

## 3. Scénarios exécutés

### A — Double clic immédiat (2 POST parallèles)

```http
POST /api/payments/checkout  (×2 simultané, même pendingReservationId)
→ 200 + 200
```

| Requête | `stripeCheckoutSessionId` |
|---------|---------------------------|
| Req 1 | `cs_test_a1iCWCuge8UYukMowDlgJo4CKvOAsKaV40PHjDpkrWwPBjDx5foRrtDQvf` |
| Req 2 | `cs_test_a1np3k2RH4B5rTSWgJiiK0eRUiumocWDXTUJJ2TqZw8k7V59YM7mGRm71g` |

**Résultat :** `sameSession: false` — **2 sessions Stripe** · **2 Payment PENDING** en DB.

### B — Deux onglets navigateur

Équivalent API : 2 POST simultanés avec le même cookie session.

**Checkout séquentiel (3ᵉ appel) :**

```http
POST /api/payments/checkout
→ 200 — même session que req 1 (idempotence séquentielle OK)
```

### C — Webhook double (même `event.id`)

| Envoi | HTTP |
|-------|------|
| 1er `checkout.session.completed` | 200 |
| 2e même `event.id` | 200 |

- `WebhookEvent` : **1** ligne (`@@unique([provider, eventId])`)
- `CONFIRMED` : +1 uniquement
- `SUCCEEDED` : +1 uniquement

### C bis — Webhook 2ᵉ session (pending déjà consommée)

Webhook sur `cs_test_a1np3k2...` après consommation pending :

- HTTP 200
- **Aucune** nouvelle `CONFIRMED` · compteur inchangé

### D — État final

| Métrique | Valeur |
|----------|--------|
| Payment PENDING créés (race) | 2 |
| Payment SUCCEEDED | **1** |
| Reservation CONFIRMED | **1** |
| pending `consumedAt` | renseigné |
| Checkout post-consume | **409** `PENDING_ALREADY_CONSUMED` |

---

## 4. Protections identifiées

| Couche | Mécanisme | Fichier / règle | Efficacité |
|--------|-----------|-----------------|------------|
| Checkout séquentiel | Réutilise session Stripe `open` même metadata | `payments.service.ts` L70-99 | ✅ |
| Checkout parallèle | Aucun verrou | — | ⚠️ 2 sessions possibles |
| Webhook idempotence | `ignoreDuplicateStripeWebhook` | `stripe-webhook-idempotency.ts` | ✅ |
| Webhook event unique | `WebhookEvent @@unique([provider, eventId])` | `schema.prisma` | ✅ |
| Pending consume | `consumedAt` → 2ᵉ webhook no-op | `stripe-ticket-webhook.service.ts` L126-132 | ✅ |
| Post-consume checkout | `PENDING_ALREADY_CONSUMED` | `payments.service.ts` L44-46 | ✅ |
| Frontend 1 onglet | `isCheckoutPending` désactive bouton | `PendingReservationPage.tsx` | ✅ |

---

## 5. Checklist PRD

| ID | Critère | Verdict |
|----|---------|---------|
| **B1** | Double clic checkout | ⚠️ 2 sessions si requêtes **simultanées** |
| **B2** | 1 CONFIRMED · 1 place | ✅ |
| **B3** | Pas de double redirect incohérent | ✅ (séquentiel = même URL) |

---

## 6. Risque & niveau

| Dimension | Niveau | Détail |
|-----------|--------|--------|
| **Intégrité siège / réservation** | Faible | Max 1 CONFIRMED · pending consommée une fois |
| **Risque financier** | **Moyen** | 2 paiements Stripe possibles · 1 billet · remboursement manuel |
| **Verdict global QA-02B** | **PASS** | Acceptable MVP · hardening requis pré-prod |

---

## 7. Backlog — ticket correctif futur

**P0-HARDENING — Single Active Checkout Per Pending Reservation**

Objectif :

```text
pendingReservationId
↓
max 1 Payment PENDING / open checkout
↓
verrou transactionnel ou contrainte DB
```

> Hors scope immédiat — cadrage CTO requis avant implémentation.

---

## 8. Bugs / findings

| Finding | Sévérité | Action |
|---------|----------|--------|
| Race checkout parallèle → 2 sessions Stripe | Moyen | Backlog P0-HARDENING |
| Mitigation webhook empêche 2ᵉ CONFIRMED | — | Documenté · suffisant MVP |

---

## 9. Références

- `docs/qa/QA-02-edge-cases-checklist.md`
- `docs/prd/active/PRD-FEATURE-QA-02-passenger-edge-cases-hardening.md`
- `backend/src/modules/payments/payments.service.ts`
- `backend/src/modules/payments/stripe-ticket-webhook.service.ts`
- `docs/qa/QA-02A-pending-expiration.md`

**Prochain QA :** QA-02C — Webhook Replay / Idempotence

---

*QA-02B — APPROUVÉ CTO · commit `docs(qa): validate double checkout behavior`.*

# QA-02E — Concurrent Seat Booking / Capacity Race

**Ticket :** QA-02E  
**Feature :** FEATURE-QA-02 — Passenger Edge Cases & Hardening  
**Phase BMAD :** VERIFY  
**Date de validation :** 2026-06-19  
**Environnement :** local Windows · backend Docker `:3000` · Stripe test (`STRIPE_WEBHOOK_SECRET`)  
**Verdict :** **PASS** — review CTO approuvée  
**Risque :** **faible** (course concurrente sur dernière place)  
**Code modifié :** aucun

---

## 1. Résumé exécutif

```text
Capacité = 8 · Places occupées = 7 · Places restantes = 1

User A — POST /pending → 201
User B — POST /pending → 409 TRIP_FULL

Webhook gagnant → 8e CONFIRMED · Payment SUCCEEDED
Nouvelle tentative → TRIP_FULL

Jamais 9/8 · Jamais oversell · Jamais double siège
```

**Conclusion :** le moteur de réservation refuse toute sur-capacité à deux niveaux — création pending (`FOR UPDATE` + comptage) et confirmation webhook (`occupied > totalSeats`). Test le plus critique du noyau transactionnel V1 après Stripe.

---

## 2. Données de test (run principal — scénario A)

| Champ | Valeur |
|-------|--------|
| **tripId** | `qa02etrip1781869088280` |
| **totalSeats** | 8 |
| **CONFIRMED seed** | 7 (passengers demo 01–07) |
| **User A** | `passenger08@sharinggo.demo` |
| **User B** | `passenger09@sharinggo.demo` (gagnant) |
| **pendingId** (gagnant) | `cmqkuumo9006dqo0tr47hh7m8` |
| **event.id** (webhook) | `evt_qa02e_win_*` |

---

## 3. Requêtes exécutées

| # | Requête | HTTP | Code / note |
|---|---------|------|-------------|
| 1 | Préparation trip SQL (8 places, 7 CONFIRMED) | — | 1 place restante |
| 2 | `POST /api/reservations/pending` (A ∥ B) | 409 / **201** | A `TRIP_FULL` · B créé |
| 3 | `POST /api/payments/checkout` (gagnant) | **200** | session Stripe test |
| 4 | `POST /api/webhooks/stripe` (1er) | **200** | `{"received":true}` |
| 5 | `POST /api/webhooks/stripe` (replay ×3) | **200** ×3 | idempotent |
| 6 | `POST /api/reservations/pending` (perdant retente) | **409** | `TRIP_FULL` |

### Scénarios complémentaires

| Scénario | Requête | HTTP | Code |
|----------|---------|------|------|
| **B** — 0 place | `POST /pending` (passenger10) | **409** | `TRIP_FULL` |
| **C** — expiration | pending D → expire SQL → pending E | **201** | place libérée |
| **D** — 6 CONFIRMED, 2 restantes | pending F + G parallèle | **201** / **201** | 8/8 virtuel (conforme) |
| **Supplément** — 7 CONFIRMED + 2 pending SQL + webhooks ∥ | checkout ×2 · webhook ×2 | **200** | 2× Payment **FAILED** · 7 CONFIRMED |

---

## 4. État DB avant / après (scénario A)

| Métrique | Avant course | Après pending | Après webhook |
|----------|--------------|---------------|---------------|
| **CONFIRMED** | 7 | 7 | **8** |
| **Payment SUCCEEDED** | 0 | 0 | **1** |
| **Active pending** | 0 | 1 | 0 |
| **Occupation** | 7/8 | 8/8 (virtuel) | **8/8** |
| **Oversell** | non | non | **non** |

### Supplément — double pending forcée + webhooks parallèles

| Métrique | Valeur |
|----------|--------|
| CONFIRMED | **7** (stable) |
| Payment SUCCEEDED | **0** |
| Payment FAILED | **2** |
| Oversell | **non** |

---

## 5. Protections identifiées (deux couches)

### Couche 1 — Pending

```text
lockTripForUpdate (SELECT … FOR UPDATE)
↓
deleteExpiredPendingForTrip
↓
countOccupiedSeats()  — CONFIRMED/USED + pending actives
↓
occupied >= totalSeats → 409 TRIP_FULL
```

| Mécanisme | Emplacement |
|-----------|-------------|
| `lockTripForUpdate` | `reservation-locking.ts` |
| `prisma.$transaction` | `reservations.service.ts` |
| `countOccupiedSeats` | `trip-occupancy.ts` |
| `TRIP_FULL` | `createPendingReservation` L111–141 |

### Couche 2 — Webhook

```text
lockTripForUpdate
↓
countOccupiedSeats()
↓
occupied > totalSeats → markPaymentFailed → aucune CONFIRMED
```

| Mécanisme | Emplacement |
|-----------|-------------|
| Garde-fou capacité | `stripe-ticket-webhook.service.ts` L149–158 |
| `pending.consumedAt` | idempotence (QA-02C) |
| Idempotence `WebhookEvent` | `stripe-webhook-idempotency.ts` |

**Alignement scripts existants :** `backend/scripts/test-pending-concurrency.mjs` · `s2-t8c-subscription-booking-bypass-test.mjs` (même pattern sur abonnement).

---

## 6. Scénarios PRD

| Scénario | Attendu | Observé |
|----------|---------|---------|
| **A** 1 place · 2 users simultanés | 1 succès · 1 refus | ✅ |
| **B** 0 place restante | refus immédiat | ✅ `TRIP_FULL` |
| **C** pending expirée libère place | nouvelle résa possible | ✅ |
| **D** replays webhook gagnant | stabilité | ✅ 3× 200, 1 CONFIRMED |
| **Supplément** 2 pendings anormales | pas d'oversell | ✅ 2 FAILED, 7 CONFIRMED |

---

## 7. Niveau de risque

| Dimension | Niveau |
|-----------|--------|
| **Course pending dernière place** | **Faible** ✅ |
| **Webhook parallèle avec double pending (SQL)** | **Faible** ✅ — pas d'oversell ; double FAILED (UX à surveiller, hors scope capacité) |

---

## 8. Noyau transactionnel V1 — synthèse QA-02

| Ticket | Sujet | Verdict |
|--------|-------|---------|
| QA-02A | Pending expiration | ✅ PASS |
| QA-02B | Double checkout | ✅ PASS (risque moyen documenté) |
| QA-02C | Webhook replay | ✅ PASS |
| QA-02D | Late webhook | ✅ PASS |
| **QA-02E** | **Capacity race** | **✅ PASS** |

```text
Réservation + Paiement + Boarding : cœur transactionnel V1 validé
Prochaines phases : QA-03 Mobile/UX · QA-04 Admin · QA-05 Production Readiness
```

---

## 9. Références

- `docs/qa/QA-02-edge-cases-checklist.md`
- `docs/qa/QA-02A-pending-expiration.md` … `QA-02D-late-webhook-expired-pending.md`
- `backend/src/modules/reservations/reservation-locking.ts`
- `backend/src/modules/reservations/reservations.service.ts`
- `backend/src/lib/trip-occupancy.ts`
- `backend/src/modules/payments/stripe-ticket-webhook.service.ts`
- `backend/scripts/test-pending-concurrency.mjs`

---

*QA-02E — APPROUVÉ CTO · commit `docs(qa): validate concurrent seat booking protection`.*

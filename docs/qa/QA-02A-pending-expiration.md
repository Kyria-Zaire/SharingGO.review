# QA-02A — Pending Reservation Expiration

**Ticket :** QA-02A  
**Feature :** FEATURE-QA-02 — Passenger Edge Cases & Hardening  
**Phase BMAD :** VERIFY  
**Date de validation :** 2026-06-19  
**Environnement :** local Windows · backend Docker `:3000`  
**Verdict :** **PASS** — review CTO approuvée  
**Code modifié :** aucun

---

## 1. Résumé exécutif

Scénario critique validé :

```text
Pending créée
↓
Expiration > 2 min
↓
Checkout refusé en 410 PENDING_EXPIRED
↓
Aucune Payment SUCCEEDED
↓
Aucune Reservation CONFIRMED
↓
Nettoyage pending OK
```

**Conclusion :** une pending expirée ne peut pas déclencher de paiement ni de réservation confirmée. Le TTL 2 minutes (CDC V1) est respecté côté API.

---

## 2. Environnement

| Composant | Configuration |
|-----------|---------------|
| **Backend** | Docker Compose · `http://localhost:3000` |
| **TTL pending** | `PENDING_TTL_MS = 2 * 60 * 1000` (`reservations.service.ts`) |
| **Compte test** | `passenger06@sharinggo.demo` |
| **Attente réelle** | 127 s (expiresAt + 8 s buffer) |

---

## 3. Données test

| Champ | Valeur |
|-------|--------|
| **Pending ID** | `cmqkrr5vj000uqo0tv7js0ivd` |
| **Trip ID** | `cmqj9ltob001vlh5ivw640vtd` |
| **expiresAt** | `2026-06-19T10:13:31.290Z` |
| **Création** | `POST /api/reservations/pending` → **201** |

---

## 4. Étapes exécutées

| # | Action | HTTP | Code erreur |
|---|--------|------|-------------|
| 1 | `POST /api/reservations/pending` | 201 | — |
| 2 | Attente > 2 min | — | — |
| 3 | `POST /api/payments/checkout` | **410** | `PENDING_EXPIRED` |
| 4 | `GET /api/reservations/pending/:id` | **410** | `PENDING_EXPIRED` |
| 5 | Contrôle DB | — | — |

**Ordre des appels :** checkout **avant** GET (pending encore en DB au moment du checkout).

---

## 5. Réponses API

### Création pending

```json
{
  "pendingReservationId": "cmqkrr5vj000uqo0tv7js0ivd",
  "expiresAt": "2026-06-19T10:13:31.290Z",
  "remainingSeats": 6
}
```

### Checkout (pending expirée)

```json
{
  "error": {
    "message": "Pending reservation has expired",
    "code": "PENDING_EXPIRED"
  }
}
```

### GET pending (expirée)

```json
{
  "error": {
    "message": "Pending reservation has expired",
    "code": "PENDING_EXPIRED"
  }
}
```

---

## 6. État DB

| Entité | Avant | Après checkout | Après GET |
|--------|-------|----------------|-----------|
| **PendingReservation** (id test) | 1 | 1 | **0** (supprimée) |
| **Reservation CONFIRMED** (user) | 4 | 4 | 4 |
| **Payment SUCCEEDED** (user) | 4 | 4 | 4 |
| **Nouvelle CONFIRMED** (user + trip) | — | 0 | 0 |

**Nettoyage :** `getPendingReservation` appelle `deleteExpiredPendingForTrip` après détection expiration (`trip-occupancy.ts`).

---

## 7. UI passager (contrat)

Page `PendingReservationPage.tsx` — alignée API :

| Critère | Comportement |
|---------|--------------|
| État expiré | Carte « Verrouillage expiré » · countdown `00:00` ou réponse 410 |
| Bouton paiement | `disabled` si `isExpired` |
| Retour trajets | CTA « Voir les trajets » |
| Erreur checkout | `PENDING_EXPIRED` → message 2 minutes écoulées (`useCreateCheckoutSession`) |

Validation UI par audit code + contrat API (pas de capture navigateur live).

---

## 8. Checklist PRD

| ID | Critère | Verdict |
|----|---------|---------|
| **A1** | > 2 min sans payer → pending nettoyée | PASS |
| **A2** | Payer après expiration → pas de CONFIRMED | PASS |
| **A3** | UI pending / message expiration | PASS |
| **A4** | Pas de réservation fantôme | PASS |

---

## 9. Observations (non bloquantes)

| Observation | Décision CTO |
|-------------|--------------|
| Si `GET` expiré appelé **avant** `checkout`, pending déjà supprimée → checkout peut retourner `404 PENDING_NOT_FOUND` au lieu de `410 PENDING_EXPIRED` | Acceptable — paiement toujours refusé |
| Webhook Stripe tardif sur pending expirée | Hors scope QA-02A · couvert **QA-02D** (`stripe-ticket-webhook.service.ts` rejette `PENDING_EXPIRED`) |

---

## 10. Références

- `docs/qa/QA-02-edge-cases-checklist.md`
- `docs/prd/active/PRD-FEATURE-QA-02-passenger-edge-cases-hardening.md`
- `backend/src/modules/reservations/reservations.service.ts`
- `backend/src/modules/payments/payments.service.ts`

---

*QA-02A — APPROUVÉ CTO · commit `docs(qa): validate pending reservation expiration`.*

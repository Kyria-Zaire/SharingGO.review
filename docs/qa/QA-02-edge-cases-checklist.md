# QA-02 — Checklist exécution (Edge Cases & Hardening)

**Feature :** FEATURE-QA-02  
**PRD :** [`docs/prd/active/PRD-FEATURE-QA-02-passenger-edge-cases-hardening.md`](../prd/active/PRD-FEATURE-QA-02-passenger-edge-cases-hardening.md)  
**Prérequis :** QA-01 PASS · ngrok webhook actif · Stripe test

> Cocher **PASS / FAIL / BLOCKED / SKIP** · noter date + observateur · joindre IDs (Payment, Reservation, event Stripe) sans secrets.

---

## Légende

| Verdict | Signification |
|---------|---------------|
| **PASS** | Comportement conforme PRD |
| **FAIL** | Écart métier ou UX — bug à corriger |
| **BLOCKED** | Environnement / outil indisponible |
| **SKIP** | Hors scope session (documenter pourquoi) |

---

## QA-02A — Pending expirée

- [ ] **A1** Attendre > 2 min sans payer → pending supprimée
- [ ] **A2** Payer après expiration → pas de CONFIRMED
- [ ] **A3** UI pending / message expiration
- [ ] **A4** `/bookings` vide

**Verdict :** ☐ PASS ☐ FAIL ☐ BLOCKED  
**Notes :**

---

## QA-02B — Double clic paiement

- [ ] **B1** Double clic CTA checkout
- [ ] **B2** Une seule CONFIRMED · une place
- [ ] **B3** Pas de double redirect incohérent

**Verdict :** ☐ PASS ☐ FAIL ☐ BLOCKED  
**Notes :**

---

## QA-02C — Double webhook (duplicate delivery)

- [ ] **C1** Même event 2× → 2× 200
- [ ] **C2** Une seule Reservation
- [ ] **C3** Idempotence WebhookEvent

**Verdict :** ☐ PASS ☐ FAIL ☐ BLOCKED  
**Notes :**

---

## QA-02D — Replay webhook (Dashboard)

- [ ] **D1** Replay event traité → no-op 200
- [ ] **D2** Replay pending expirée → 4xx métier
- [ ] **D3** Log duplicate explicite

**Verdict :** ☐ PASS ☐ FAIL ☐ BLOCKED  
**Notes :**

---

## QA-02E — QR expiré

- [ ] **E1** UI QR masqué après expiration
- [ ] **E2** API 410 si applicable
- [ ] **E3** Countdown → 0 cohérent
- [ ] **E4** Actualiser sans crash

**Verdict :** ☐ PASS ☐ FAIL ☐ BLOCKED  
**Notes :**

---

## QA-02F — Plus de places

- [ ] **F1** Trajet complet → CTA disabled
- [ ] **F2** Concurrence dernière place
- [ ] **F3** Compteur places exact

**Verdict :** ☐ PASS ☐ FAIL ☐ BLOCKED  
**Notes :**

---

## QA-02G — Utilisateur déconnecté

- [ ] **G1** `/bookings` → login + return URL
- [ ] **G2** `/bookings/:id` → login
- [ ] **G3** Boarding pass → login
- [ ] **G4** Réserver sans session → login
- [ ] **G5** API 401 sans fuite

**Verdict :** ☐ PASS ☐ FAIL ☐ BLOCKED  
**Notes :**

---

## QA-02H — Réseau coupé checkout

- [ ] **H1** Polling success offline → retry
- [ ] **H2** Timeout 60 s → message + CTA
- [ ] **H3** Retour online → recovery
- [ ] **H4** Login offline → message réseau

**Verdict :** ☐ PASS ☐ FAIL ☐ BLOCKED  
**Notes :**

---

## QA-02I — Mobile Safari

- [ ] **I1** OAuth Google
- [ ] **I2** Stripe Checkout
- [ ] **I3** Safe area / bottom nav
- [ ] **I4** QR scannable

**Verdict :** ☐ PASS ☐ FAIL ☐ BLOCKED  
**Notes :**

---

## QA-02J — Android Chrome

- [ ] **J1** OAuth Google
- [ ] **J2** Stripe Checkout
- [ ] **J3** Layout responsive
- [ ] **J4** QR OK

**Verdict :** ☐ PASS ☐ FAIL ☐ BLOCKED  
**Notes :**

---

## Régression QA-01 (obligatoire)

- [ ] Happy path E2E complet PASS (OAuth → QR)

**Verdict :** ☐ PASS ☐ FAIL

---

## Synthèse finale

| Ticket | Verdict |
|--------|---------|
| QA-02A | |
| QA-02B | |
| QA-02C | |
| QA-02D | |
| QA-02E | |
| QA-02F | |
| QA-02G | |
| QA-02H | |
| QA-02I | |
| QA-02J | |

**FEATURE-QA-02 global :** ☐ PASS ☐ FAIL ☐ PARTIAL  
**Date :**  
**Validé par :**

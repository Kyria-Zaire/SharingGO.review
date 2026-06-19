# PRD — FEATURE-QA-02 · Passenger Edge Cases & Hardening

**Status :** DISCOVER  
**Owner :** QA / Engineering  
**Last updated :** 2026-06-19  
**Version :** v1.0  
**Prérequis :** FEATURE-QA-01 PASS · WEB-QA-01 PASS

> Contexte : [`docs/CAHIER_DES_CHARGES.md`](../../CAHIER_DES_CHARGES.md) · Validation E2E : [`docs/qa/QA-01-passenger-e2e-validation.md`](../qa/QA-01-passenger-e2e-validation.md)

---

# 1. Executive Summary

Le MVP passager fonctionne en happy path (OAuth → pending → Stripe → webhook → CONFIRMED → QR). **FEATURE-QA-02** durcit le produit contre les cas limites, erreurs réseau, concurrence et replays webhook avant préproduction.

**Objectif :** prouver que le système se comporte de manière **prévisible, sûre et rassurante** lorsque quelque chose ne se passe pas comme prévu.

**Hors scope V1 :** multi-lignes, notifications push, admin embarquement complet (→ FEATURE-ADMIN-V1).

---

# 2. Product Goals

## Primary goals

- Aucune double réservation ni double débit sur actions utilisateur répétées.
- Webhooks idempotents — replay sans effet de bord.
- UX claire sur pending expirée, timeout paiement, QR expiré, déconnexion.
- Comportement acceptable sur mobile Safari et Android Chrome.

## Non-goals

- Refonte UI complète.
- Tests de charge / stress.
- Paiement live PROD (Stripe test uniquement).
- Module chauffeur / scan (S2-T2+) — sauf mention explicite dans un scénario.

---

# 3. Scénarios & critères d'acceptation

Chaque scénario = ticket exécutable · verdict **PASS / FAIL / BLOCKED**.

## QA-02A — Pending expirée

**Contexte :** TTL pending = **2 min**. Webhook ou paiement après expiration.

| # | Critère | Attendu |
|---|---------|---------|
| A1 | Pending créée, attente > 2 min sans paiement | Pending supprimée · places libérées |
| A2 | Paiement Stripe réussi **après** expiration pending | Webhook → `PENDING_EXPIRED` ou équivalent · **pas** de CONFIRMED |
| A3 | UI pending page | Message expiration clair · CTA retour trajets |
| A4 | `/bookings` | Aucune réservation fantôme |

**Preuves :** logs backend · statut Payment · absence Reservation.

---

## QA-02B — Double clic paiement

**Contexte :** utilisateur clique plusieurs fois « Payer maintenant » ou refresh checkout.

| # | Critère | Attendu |
|---|---------|---------|
| B1 | Double clic rapide sur CTA checkout | Une seule session checkout active ou réutilisation idempotente |
| B2 | Deux sessions checkout pour même pending | Une seule CONFIRMED · une seule place consommée |
| B3 | UI | Pas de double redirect incohérent |

---

## QA-02C — Double webhook (livraison duplicate)

**Contexte :** Stripe renvoie le même `checkout.session.completed` deux fois (retry Stripe).

| # | Critère | Attendu |
|---|---------|---------|
| C1 | Même `event.id` reçu 2× | 2× HTTP 200 |
| C2 | DB | Une seule Reservation CONFIRMED |
| C3 | `WebhookEvent` | Idempotence enregistrée · pas de double audit métier |

---

## QA-02D — Replay webhook (renvoi manuel Dashboard)

**Contexte :** opérateur ou dev renvoie un event depuis Stripe Dashboard.

| # | Critère | Attendu |
|---|---------|---------|
| D1 | Replay event déjà traité | 200 · no-op |
| D2 | Replay event pending expirée | 4xx métier attendu · pas de CONFIRMED |
| D3 | Logs | `STRIPE_WEBHOOK_DUPLICATE` ou ignore explicite |

---

## QA-02E — QR expiré

**Contexte :** JWT QR exp = départ + 10 min (backend).

| # | Critère | Attendu |
|---|---------|---------|
| E1 | Accès boarding pass après expiration | QR masqué · message « Billet expiré » |
| E2 | API `GET /api/boarding/:id/qr` | 410 `BOARDING_EXPIRED` si applicable |
| E3 | Countdown UI | Atteint 0 → état expiré cohérent |
| E4 | CTA Actualiser | Refetch sans crash |

---

## QA-02F — Plus de places disponibles

**Contexte :** 8 places/trajet · concurrence ou complet.

| # | Critère | Attendu |
|---|---------|---------|
| F1 | Trajet complet (0 place) | CTA réserver disabled · badge complet |
| F2 | Dernière place prise pendant pending autre user | Second user → erreur métier · pas de surbooking |
| F3 | UI liste trajets | Places restantes exactes (backend) |

---

## QA-02G — Utilisateur déconnecté

**Contexte :** session cookie expirée ou absente.

| # | Critère | Attendu |
|---|---------|---------|
| G1 | Accès `/bookings` sans session | Redirect `/login` · `state.from` préservé |
| G2 | Accès `/bookings/:id` | Idem |
| G3 | Accès boarding pass | Idem |
| G4 | CTA Réserver sans session | Redirect login puis retour trajet |
| G5 | API 401 | Pas de fuite de données · message générique |

---

## QA-02H — Réseau coupé pendant checkout

**Contexte :** offline / latence pendant redirect Stripe ou polling success.

| # | Critère | Attendu |
|---|---------|---------|
| H1 | Polling success sans réseau | Continue retry · pas de crash |
| H2 | Timeout 60 s sans CONFIRMED | Message rassurant · CTA réservations |
| H3 | Retour online | Poll détecte CONFIRMED ou guide utilisateur |
| H4 | Login offline | Message réseau explicite |

---

## QA-02I — Mobile Safari (iOS)

**Contexte :** iPhone · Safari · viewport ~390px.

| # | Critère | Attendu |
|---|---------|---------|
| I1 | OAuth Google popup / redirect | Connexion OK |
| I2 | Stripe Checkout redirect | Paiement test OK |
| I3 | Bottom nav + safe area | Pas de chevauchement contenu |
| I4 | QR boarding pass | Scannable · pas de scroll horizontal |

---

## QA-02J — Android Chrome

**Contexte :** Android · Chrome · viewport variable.

| # | Critère | Attendu |
|---|---------|---------|
| J1 | OAuth Google | Connexion OK |
| J2 | Stripe Checkout | Paiement test OK |
| J3 | Responsive WEB-QA-01 | Layout utilisable |
| J4 | QR | Affichage correct |

---

# 4. Environnement de test

| Composant | Config |
|-----------|--------|
| Backend | Docker local `:3000` |
| Passenger | Vite `:5174` |
| Stripe | Mode test · ngrok webhook (cf. QA-01) |
| Carte | `4242 4242 4242 4242` |
| Devices | iOS Safari · Android Chrome (physique ou BrowserStack si dispo) |

---

# 5. Matrice de priorité

| Ticket | Priorité | Risque métier |
|--------|----------|---------------|
| QA-02A Pending expirée | P0 | Paiement sans place |
| QA-02B Double paiement | P0 | Double débit / double place |
| QA-02C/D Webhook duplicate/replay | P0 | Double réservation |
| QA-02F Places | P0 | Surbooking (8 max) |
| QA-02G Déconnexion | P1 | Sécurité / UX |
| QA-02H Réseau checkout | P1 | Confusion post-paiement |
| QA-02E QR expiré | P1 | Embarquement |
| QA-02I/J Mobile | P1 | Audience convoyeur mobile |

---

# 6. Definition of Done (FEATURE-QA-02)

- [ ] Scénarios P0 (A, B, C, D, F) : **PASS** documentés
- [ ] Scénarios P1 (E, G, H, I, J) : **PASS** ou **BLOCKED** avec justification
- [ ] Aucune régression QA-01 (happy path E2E)
- [ ] Rapport `docs/qa/QA-02-edge-cases-report.md` rédigé
- [ ] Security review si modification webhook/auth
- [ ] Verdict CTO : **PASS** ou liste remédiation

---

# 7. Références techniques

| Domaine | Fichier / module |
|---------|------------------|
| Pending TTL | `backend` pending reservation · 2 min |
| Webhook idempotence | `stripe-webhook-idempotency.ts` |
| Ticket webhook | `stripe-ticket-webhook.service.ts` |
| Polling success | `usePaymentConfirmationPoll.ts` |
| Boarding QR | `BoardingPassPage.tsx` · `GET /api/boarding/:id/qr` |
| Auth guard | `RequireAuth.tsx` |

---

*PRD FEATURE-QA-02 — cadrage avant exécution BMAD VERIFY.*

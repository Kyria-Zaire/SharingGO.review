# QA-01 — Validation E2E passager (MVP V1)

**Ticket :** QA-01D — Passenger E2E Validation Report  
**Feature :** FEATURE-QA-01 — End-to-End Passenger Validation  
**Phase BMAD :** VERIFY → RELEASE (documentation)  
**Date de validation :** 2026-06-19  
**Environnement :** local Windows · Stripe **mode test**  
**Verdict :** **PASS** — MVP passager validé de bout en bout

---

## 1. Résumé exécutif

Le parcours passager complet a été exécuté avec succès en local, avec un utilisateur réel (compte Google de test) et un paiement Stripe test (carte `4242`).

Chaîne validée :

```text
Google OAuth → découverte trajets → pending reservation (2 min)
→ Stripe Checkout → webhook checkout.session.completed
→ Payment SUCCEEDED → Reservation CONFIRMED
→ historique /bookings → détail → boarding pass QR + countdown
```

**Conclusion :** la logique métier backend et le frontend passager sont alignés avec le CDC V1 (8,99 € / trajet, QR après confirmation, pas de validation optimiste côté client).

---

## 2. Environnement

| Composant | Configuration |
|-----------|---------------|
| **OS** | Windows 10/11 (poste dev local) |
| **Backend** | Docker Compose (`docker-compose.dev.yml`) · Express/TS · Prisma · Postgres |
| **Backend URL (hôte)** | `http://localhost:3000` |
| **Frontend passager** | Vite · `frontend/apps/passenger` · port **5174** |
| **Frontend admin** | port 5173 (hors scope QA-01) |
| **Stripe** | Mode **test** · Checkout Session ticket 8,99 € |
| **Google OAuth** | Client OAuth Google (convoyeur) · ID token vérifié côté backend |
| **Webhook (tunnel)** | **ngrok** → `https://<subdomain>.ngrok-free.dev` → `localhost:3000` |
| **Endpoint webhook Stripe** | Destination Dashboard · événement `checkout.session.completed` |
| **Secret webhook** | `whsec_…` issu du **Dashboard Stripe** (endpoint ngrok), **pas** du CLI `stripe listen` |

### Scripts utilitaires (local)

| Script | Rôle |
|--------|------|
| `scripts/ngrok-cli.ps1` | Wrapper ngrok (contourne PATH Windows post-winget) |
| `scripts/ngrok-webhook.ps1` | Lance `ngrok http 3000` |
| `scripts/stripe-cli.ps1` | Stripe CLI (abandonné pour QA-01 final — instabilité websocket) |

### Prérequis validés

- Backend Docker **healthy** sur `:3000`
- Tunnel ngrok **actif** pendant le paiement (URL publique stable)
- `STRIPE_WEBHOOK_SECRET` dans `.env` racine **aligné** avec le secret de l’endpoint Dashboard
- Recreate backend après changement `.env` : `docker compose … down` puis `up --build -d backend` (un simple `restart` ne recharge pas `env_file`)

### Carte de test Stripe

| Champ | Valeur |
|-------|--------|
| Numéro | `4242 4242 4242 4242` |
| Date | Toute date future |
| CVC | 3 chiffres quelconques |

---

## 3. Parcours validé

| # | Étape | Résultat |
|---|--------|----------|
| 1 | **Login Google** (`/login` → OAuth) | Session cookie établie |
| 2 | **Trip discovery** (`/trips` · filtre date · trajet disponible) | Liste et détail trajet OK |
| 3 | **Pending reservation** (CTA « Réserver ma place ») | Pending créée · TTL 2 min |
| 4 | **Stripe Checkout** (CTA « Payer maintenant ») | Redirect Stripe · session `cs_test_…` |
| 5 | **Paiement test** (carte 4242) | Paiement accepté · redirect success |
| 6 | **Webhook** `checkout.session.completed` | Reçu via ngrok · traité backend |
| 7 | **Payment** | Statut **SUCCEEDED** · 8,99 € |
| 8 | **Reservation** | Statut **CONFIRMED** · liée au payment |
| 9 | **Booking history** (`/bookings` · onglet « À venir ») | Réservation visible |
| 10 | **Booking detail** (`/bookings/:id`) | Montant · paiement réussi · référence |
| 11 | **Boarding pass QR** (`/bookings/:id/boarding-pass`) | QR affiché · countdown actif · CTA actualiser |

### Metadata Checkout (SharingGO)

Le webhook a traité une session avec metadata métier attendues :

- `pendingReservationId`
- `userId`
- `tripId`

(Aucune validation optimiste frontend : la confirmation repose sur le webhook Stripe.)

---

## 4. Preuves techniques

> **Note :** identifiants partiels · aucun secret dans ce document.

| Artefact | Valeur (preuve) |
|----------|-----------------|
| **Payment ID** | `cmqklvcv60005qo0tia72wsku` |
| **Payment status** | `SUCCEEDED` |
| **Montant** | 8,99 € |
| **Stripe PaymentIntent** | `pi_3TjwpcJoKcqsGQTG1T7upvAa` |
| **Stripe Checkout Session** | `cs_test_a10yKkBSFZiG2bvYrX2d…` (tronqué) |
| **Reservation ID** | `cmqklvzz8000bqo0t3zxzprak` |
| **Reservation status** | `CONFIRMED` |
| **Webhook event ID** | `evt_1TjwpdJoKcqsGQTG074lecov` |
| **Webhook event type** | `checkout.session.completed` |
| **Webhook processed at** | 2026-06-19 ~07:27 UTC |
| **Utilisateur test** | `kyriamambu1@gmail.com` |
| **UI — statut réservation** | « Confirmée » |
| **UI — statut paiement** | « Réussi » / « Succeeded » |
| **UI — QR** | Affiché · instruction « Présente ce QR au chauffeur » |
| **UI — countdown** | Actif (validité calculée côté API `expiresAt`) |

### Corrélation DB (post-validation)

```text
Payment SUCCEEDED ──reservationId──► Reservation CONFIRMED
WebhookEvent (checkout.session.completed) enregistré après traitement idempotent
```

---

## 5. Problèmes rencontrés (historique QA-01)

| Problème | Symptôme | Cause racine | Résolution |
|----------|----------|--------------|------------|
| **`VITE_GOOGLE_CLIENT_ID` manquant** | Écran OAuth rouge / login impossible | `.env` passager absent | Création `frontend/apps/passenger/.env` aligné backend |
| **Backend Docker stale** | `Invalid Google ID token` malgré `.env` corrigé | `docker restart` ne recharge pas `env_file` | `docker compose down` + `up --build` |
| **Migration `OAuthAccount` manquante** | Erreur Prisma à la connexion Google | Migration non déployée | `prisma migrate deploy` |
| **`stripe listen` instable** | Paiements Stripe OK · Payment `PENDING` · `/bookings` vide | Websocket CLI : `Session expired` / `close sent` · events non forwardés | Abandon CLI pour validation finale |
| **`whsec` mismatch** | Webhook `400` · signature invalid | Plusieurs `stripe listen` parallèles · secrets différents | Un seul tunnel · secret unique |
| **Pending expirée (anciens paiements)** | Event rejoué ou tardif → pas de CONFIRMED | Délai > 2 min entre pending et webhook | Nouveau paiement avec pending fraîche + tunnel stable |

### Paiements test antérieurs (non validants)

Plusieurs enregistrements `Payment` restent en `PENDING` (sessions `cs_test_a1jWx8…`, `cs_test_a1gpa…`, etc.) : **échecs de livraison webhook**, pas de bug checkout UI. Ils ne remettent pas en cause le verdict QA-01 final.

---

## 6. Décisions prises

| Décision | Justification |
|----------|---------------|
| **Passage à ngrok** | Tunnel HTTPS stable · Stripe appelle directement le backend · indépendant du websocket CLI |
| **Endpoint Stripe Dashboard** | Secret webhook dédié (`whsec_…` endpoint) · traçabilité livraisons · statut HTTP visible |
| **Pas de validation optimiste frontend** | La réservation **CONFIRMED** et le QR ne dépendent que du webhook traité côté serveur (CDC / security baseline) |
| **Ne pas rejouer d’anciens events** | Pending expirée → `PENDING_EXPIRED` attendu · ne valide pas le parcours E2E |
| **Recreate backend après `.env`** | Garantir chargement du nouveau `STRIPE_WEBHOOK_SECRET` |

---

## 7. Résultat final

```text
FEATURE-QA-01 : PASS ✅

OAuth Google          : PASS ✅
Reservation Flow      : PASS ✅
Stripe Checkout       : PASS ✅
Webhook Confirmation  : PASS ✅
Bookings              : PASS ✅
Boarding Pass         : PASS ✅
QR Validation Flow    : PASS ✅ (affichage passager · génération JWT côté API)
```

**MVP passager V1 : validé** pour le périmètre QA-01 (convoyeur · ligne Châlons ↔ Vatry · ticket 8,99 € · QR post-paiement).

### Hors scope QA-01 (non testé ici)

- Scan chauffeur / `POST /api/boarding/validate` · consume
- Abonnements Stripe Billing
- Turnstile prod · déploiement VPS
- Admin cockpit

---

## 8. Suites recommandées

| Priorité | Ticket / thème | Contenu |
|----------|----------------|---------|
| **P0** | **FEATURE-QA-02** | Edge cases : pending expirée · QR expiré · double paiement · double réservation · webhook replay · erreurs réseau · responsive mobile · utilisateur non connecté |
| **P1** | Driver boarding | Validation scan chauffeur E2E (S2-T2 / S2-T3) |
| **P1** | Deployment prep | Webhook endpoint prod · `deployments` · secrets · CORS · rate limits |
| **P2** | Doc ops | Runbook webhook local (ngrok) vs prod (URL fixe) |

---

## Références

| Document | Lien |
|----------|------|
| Auth foundation | `docs/features/S0-T4-auth-foundation.md` |
| Google OAuth backend | `docs/features/F4A-T5A-backend-google-oauth.md` |
| Pending reservation | `docs/features/F4A-T6A-passenger-pending-reservation-flow.md` |
| Stripe Checkout | `docs/features/F4A-T7-passenger-stripe-checkout.md` |
| Booking history | `docs/features/F4A-T8A-passenger-booking-history.md` |
| Booking detail | `docs/features/F4A-T8B-passenger-booking-detail.md` |
| Boarding pass QR | `docs/features/F4A-T9-passenger-boarding-pass-qr.md` |
| Stripe ticket webhook | `docs/features/S1-T4-stripe-checkout-integration.md` |
| Security baseline | `.cursor/rules/security-baseline.mdc` |

---

*Rapport rédigé dans le cadre BMAD VERIFY — documentation uniquement · aucun secret versionné.*

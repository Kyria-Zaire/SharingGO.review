# OPS-03B — Validation backend lifecycle trajet

**Ticket :** OPS-03B  
**Date :** 2026-06-20  
**Statut :** Implémenté + verify boarding 6/6 OK — **en attente commit CTO**  
**Périmètre :** Backend uniquement

---

## 1. Résumé

Moteur lifecycle manuel sur `Trip` : enum `TripLifecycleStatus`, service dédié, routes admin, garde-fous boarding QR, audit `TRIP_*`, script de tests `ops03b-lifecycle-test.mjs`.

---

## 2. Schéma Prisma

### Enum `TripLifecycleStatus`

`WAITING` · `BOARDING` · `DEPARTED` · `COMPLETED` · `CANCELLED`

### Champs `Trip`

| Champ | Rôle |
|-------|------|
| `lifecycleStatus` | État courant (défaut `WAITING`) |
| `boardingStartedAt` | Horodatage ouverture embarquement |
| `departedAt` | Horodatage départ |
| `completedAt` | Horodatage clôture service |
| `cancelledAt` | Horodatage annulation |
| `lifecycleUpdatedByUserId` | Dernier acteur admin |
| `cancellationReason` | Motif annulation (≥ 10 car.) |

Migration : `prisma/migrations/*_trip_lifecycle_status`

---

## 3. API Admin

| Méthode | Route | RBAC | Corps |
|---------|-------|------|-------|
| POST | `/api/admin/trips/:id/start-boarding` | ADMIN, SUPER_ADMIN | — |
| POST | `/api/admin/trips/:id/depart` | ADMIN, SUPER_ADMIN | — |
| POST | `/api/admin/trips/:id/complete` | ADMIN, SUPER_ADMIN | — |
| POST | `/api/admin/trips/:id/cancel` | ADMIN, SUPER_ADMIN | `{ "reason": "…" }` (≥ 10 car.) |

Réponses : `{ trip }` avec relations line/driver.

Erreurs :

- `404 TRIP_NOT_FOUND`
- `400 TRIP_DISABLED` (trip soft-deleted)
- `409 INVALID_LIFECYCLE_TRANSITION`

---

## 4. Matrice de transitions

| Depuis | Vers autorisés |
|--------|----------------|
| WAITING | BOARDING, CANCELLED |
| BOARDING | DEPARTED, CANCELLED |
| DEPARTED | COMPLETED |
| COMPLETED | — |
| CANCELLED | — |

Refus explicites testés : `WAITING→COMPLETED`, `BOARDING→COMPLETED`, `DEPARTED→BOARDING`, toute sortie depuis `COMPLETED` / `CANCELLED`.

---

## 5. Impact boarding

Codes ajoutés (validation + consume) :

| `lifecycleStatus` | Code retour |
|-------------------|-------------|
| WAITING | `BOARDING_NOT_STARTED` |
| BOARDING | scan autorisé (autres checks inchangés) |
| DEPARTED | `BOARDING_CLOSED` |
| COMPLETED | `TRIP_COMPLETED` |
| CANCELLED | `TRIP_CANCELLED` |

La fenêtre horaire `departureTime + 10 min` n'est plus le garde-fou principal : le lifecycle manuel prime (`DEPARTED` ferme).

Codes historiques conservés (`BOARDING_WINDOW_EXPIRED`, etc.) pour compatibilité mapping incidents/UI.

---

## 6. Audit / Activity Feed

Actions `AuditLog` :

- `TRIP_BOARDING_STARTED`
- `TRIP_DEPARTED`
- `TRIP_COMPLETED`
- `TRIP_CANCELLED`

`targetType = Trip`, `metadata` inclut `previousStatus` et horodatages.

---

## 7. Tests

```bash
# Prérequis : docker postgres + backend :3000 rebuild
cd backend && npm run build
node backend/scripts/ops03b-lifecycle-test.mjs
```

Couverture script :

- [x] Transitions valides WAITING→BOARDING→DEPARTED→COMPLETED
- [x] Annulations WAITING et BOARDING
- [x] Transitions invalides → 409
- [x] Cancel reason < 10 car. → 400
- [x] Boarding validate WAITING / BOARDING / DEPARTED
- [x] RBAC convoyeur + driver → 403 sur lifecycle admin
- [x] Audit TRIP_* créé

Script S2-T2 mis à jour : `start-boarding` avant validate ; test fenêtre remplacé par `BOARDING_CLOSED` en DEPARTED.

---

## 8. Fichiers touchés

| Fichier | Changement |
|---------|------------|
| `backend/prisma/schema.prisma` | enum + champs Trip |
| `backend/prisma/migrations/...` | migration lifecycle |
| `backend/src/modules/trips/trip-lifecycle.*` | service, schemas, controller, constants |
| `backend/src/modules/transport/transport.routes.ts` | 4 routes lifecycle |
| `backend/src/modules/boarding/boarding-validation-reasons.ts` | 4 codes lifecycle |
| `backend/src/modules/boarding/boarding-eligibility.ts` | garde lifecycle |
| `backend/src/modules/boarding/boarding.validation.service.ts` | garde lifecycle |
| `backend/src/modules/boarding/boarding-ui-messages.ts` | messages lifecycle |
| `backend/src/modules/incidents/field-incident-mapping.ts` | mapping signalement |
| `backend/scripts/ops03b-lifecycle-test.mjs` | tests OPS-03B |
| `backend/scripts/s2-t2-boarding-validation-test.mjs` | adapté lifecycle |
| `docs/ops/OPS-03A-trip-lifecycle-audit.md` | décisions CTO §1.1 |

**Hors périmètre (confirmé) :** aucun fichier frontend modifié.

---

## 9. Risques restants

1. **Departures UI** — readiness heuristique non alignée sur `lifecycleStatus` (ticket OPS-03C / frontend futur).
2. **Seed / trajets demo** — restent `WAITING` ; ops doit `start-boarding` avant scan terrain.
3. **Endpoint token passager** (`/api/boarding/:id/token`) — encore soumis à la fenêtre +10 min (hors ticket ; validate/consume utilisent le lifecycle).
4. **Rate limiting admin** — le script de test enchaîne beaucoup de POST ; prévoir pause ou quota dédié en CI.
5. **Migration Docker** — vérifier `prisma migrate deploy` sur l’URL `localhost:5432` avant rebuild backend.

---

## 10. Vérification boarding lifecycle (OPS-03B VERIFY)

**Script :** `backend/scripts/ops03b-boarding-lifecycle-verify.mjs`

**Fixture :** trip `POST /api/admin/trips` + 2× `POST /api/reservations/book-with-subscription` (`mosolf-active@`, `convoyeur-monthly@`) + JWT via `GET /api/boarding/:id/token` — **100 % API**, même DB que le backend (évite désync SQL Docker).

**Résultat exécution (2026-06-20) :** 6/6 OK

| # | État trip | Action | Attendu |
|---|-----------|--------|---------|
| 1 | WAITING | validate QR | `BOARDING_NOT_STARTED` |
| 2 | BOARDING | validate QR | `valid: true` |
| 3 | BOARDING | consume QR | `valid: true` |
| 4 | DEPARTED | validate autre résa | `BOARDING_CLOSED` |
| 5 | COMPLETED | validate | `TRIP_COMPLETED` |
| 6 | CANCELLED | validate | `TRIP_CANCELLED` |

---

## 11. Réponses CTO pré-commit

### Réservations sur trip `CANCELLED`

`cancelTrip()` met à jour uniquement `Trip.lifecycleStatus` (+ timestamps / motif). Les réservations **ne changent pas** (`CONFIRMED` reste `CONFIRMED`). L’embarquement est bloqué côté boarding (`TRIP_CANCELLED`). Remboursement / annulation résa = processus admin existant (non automatisé en 03B).

### DEPARTED → CANCELLED

**Exclu volontairement** de la matrice (cf. OPS-03A §1.1). Un trajet parti ne peut plus être annulé via lifecycle ; clôture via `COMPLETED` uniquement.

### Ordre RF02 (retry consume `USED`)

Dans `consumeBoardingTokenSubmission` :

1. `status === USED` est évalué **avant** toute logique `CONFIRMED` / `evaluateConfirmedConsumptionEligibility`.
2. Branche `USED` → `evaluateUsedBoardingMatch` → si `null` → `handleAlreadyUsed` (succès vert RF02).
3. Le lifecycle est dans `evaluateUsedBoardingMatch` : tant que le trip est encore `BOARDING`, retry idempotent = succès. Si ops a déjà `DEPARTED`, retry affiche `BOARDING_CLOSED` (edge case post-départ).

### `field-incident-mapping.ts`

**Lié volontairement à OPS-03B** : les 4 nouveaux codes boarding (`BOARDING_NOT_STARTED`, `BOARDING_CLOSED`, `TRIP_COMPLETED`, `TRIP_CANCELLED`) doivent être mappés pour le signalement terrain OPS-02. Pas un reliquat OPS-02 non lié — dépendance directe des nouveaux reason codes.

---

## 12. Commandes qualité

```bash
cd backend && npm run lint && npm run build
node backend/scripts/ops03b-lifecycle-test.mjs
node backend/scripts/ops03b-boarding-lifecycle-verify.mjs
```

**Commit :** aucun — attente validation CTO.

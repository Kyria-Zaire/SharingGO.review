# CASCADE-01 — Cascade d'annulation de trajet & politique de remboursement — Design

> **Statut :** Design validé section par section (CTO), prêt pour plan d'implémentation
> **Branche :** `feature/cascade-01`
> **Positionnement :** entre OPS-05 et PILOT-01 — bloquant pour PILOT-01
> **Règle projet :** aucun commit sur `main` sans PR + review CTO

---

## 1. Objectif

Faire en sorte que l'annulation d'un trajet (`cancelTrip()`) cascade proprement sur les
réservations liées et ouvre une file d'attente de traitement manuel admin (remboursement
Stripe ou avoir), sans jamais déclencher d'appel Stripe automatique. Bloquant avant PILOT-01
car on manipule de vrais billets payés.

## 2. Décisions produit (arbitrage CTO, figées)

- **Pas de remboursement automatique.** Toute annulation avec réservations payées → validation
  manuelle admin, au cas par cas.
- **Deux issues par réservation, choisies manuellement :** remboursement Stripe intégral, ou
  avoir (crédit) pour un trajet futur.
- **Notification passager :** in-app obligatoire ; email **hors scope** (aucun provider dans le
  stack — voir §9).

## 3. Décisions techniques (arbitrage CTO, figées)

| Sujet | Décision |
|---|---|
| Atomicité cascade | Une seule `prisma.$transaction` (trip + réservations + audit) |
| Audit cascade | 1 log trip + 1 log par réservation impactée |
| Audit dans tx | Écrit **dans** la transaction — un échec de log → rollback de la cascade |
| Idempotence refund | Garde d'état `FOR UPDATE` + `Idempotency-Key` Stripe déterministe |
| Verrou concurrent | `SELECT … FOR UPDATE` en tx courte — **pas** de nouvel état `PROCESSING` sur l'enum |
| Échec Stripe refund | Réservation reste `PENDING`, HTTP **502** `STRIPE_REFUND_FAILED`, retry admin |
| Séquencement Stripe/tx | Tx courte (garde) → Stripe **hors tx** → tx courte (commit REFUNDED) |
| Montant | Toujours `payment.amount` — jamais paramétrable depuis le front |
| Expiration avoir | `expiresAt` **nullable**, laissé `NULL` en V1 (pas de purge) |
| Niveau de test | Intégration DB réelle + Stripe mocké |
| Runner de test | **Vitest** (à installer — aucune infra de test n'existe) |
| DB de test | Postgres dédiée via `.env.test` + `prisma migrate deploy` + truncate entre tests |

## 4. Phase 0 — Audit préalable (FAIT, positif)

`payment_intent_id` est stocké et exploitable par réservation :

- `Payment.stripePaymentIntentId String? @unique` — `schema.prisma:309`.
- Peuplé depuis `session.payment_intent` — `stripe-ticket-webhook.service.ts:82-85`, persistance l.209.
- Exploitable via la relation 1:1 `Reservation.payment Payment?` (`Payment.reservationId @unique`).
- « Paiement capturé » = `payment.status === SUCCEEDED` **et** `stripePaymentIntentId != null`.

**Aucun blocker.** Le modèle CASCADE-01 n'introduit pas de champ paiement — il s'appuie sur l'existant.

## 5. Modèle de données

### 5.1 Nouvelle enum

```prisma
enum RefundStatus {
  NONE       // défaut — pas de paiement capturé, ou trip non annulé
  PENDING    // annulation avec paiement capturé → file d'attente admin
  REFUNDED   // remboursement Stripe effectué
  CREDITED   // avoir créé
}

enum CreditStatus {
  AVAILABLE
  USED
}
```

> **Note orthographe (piège réel du code) :** `ReservationStatus.CANCELED` (un L, `schema.prisma:20`)
> vs `TripLifecycleStatus.CANCELLED` (deux L, `schema.prisma:101`). La cascade fait passer les
> réservations à `CANCELED` et le trip à `CANCELLED`. Le typage Prisma généré empêche la coquille
> silencieuse (une faute ne compilerait pas).

### 5.2 Ajouts sur `Reservation`

```prisma
model Reservation {
  // ... champs existants ...
  refundStatus            RefundStatus @default(NONE)
  refundProcessedAt       DateTime?
  refundProcessedByUserId String?
  refundProcessedBy       User?        @relation("RefundProcessedBy", fields: [refundProcessedByUserId], references: [id], onDelete: SetNull)
  credit                  Credit?      // avoir éventuellement issu de cette réservation (1:1 optionnel)

  @@index([refundStatus])  // la vue admin filtre sur refundStatus = PENDING
}
```

### 5.3 Nouvelle table `Credit`

```prisma
model Credit {
  id                  String       @id @default(cuid())
  userId              String
  user                User         @relation(fields: [userId], references: [id])
  sourceReservationId String       @unique
  sourceReservation   Reservation  @relation(fields: [sourceReservationId], references: [id])
  amount              Decimal      @db.Decimal(10, 2)
  status              CreditStatus @default(AVAILABLE)
  usedOnReservationId String?      // référence traçable, sans FK stricte (application hors scope)
  createdAt           DateTime     @default(now())
  expiresAt           DateTime?    // NULL en V1

  @@index([userId])
  @@index([status])
}
```

### 5.4 Relations réciproques sur `User` (obligatoires — sinon Prisma rejette le schéma)

```prisma
model User {
  // ... champs existants ...
  refundedReservations Reservation[] @relation("RefundProcessedBy")
  credits              Credit[]
}
```

**Choix de conception :**
- `RefundStatus` séparé de `ReservationStatus` — deux axes orthogonaux, pas de surcharge d'enum.
- `sourceReservationId @unique` + `Reservation.credit Credit?` — verrouille au schéma « une réservation
  ne génère qu'un seul avoir ».
- `refundProcessedBy` en `onDelete: SetNull` — cohérent avec `lifecycleUpdatedBy` existant.
- `Reservation` porte **deux** relations vers `User` (`user` passager + `refundProcessedBy`), légal en
  Prisma car nommées explicitement des deux côtés.
- Migration via `prisma migrate` — jamais de SQL raw (règle projet).

## 6. Cascade dans `cancelTrip()`

**Fichier :** `backend/src/modules/trips/trip-lifecycle.service.ts:160-187` (fonction existante).

Tout dans une `prisma.$transaction` :

1. Hors tx : `getTripOrThrow` + `assertTripActive` + `assertTransitionAllowed(… CANCELLED)`.
   (Trip déjà `CANCELLED` → 409 `INVALID_LIFECYCLE_TRANSITION` avant toute cascade — idempotence.)
2. Dans tx :
   a. `tx.trip.update` → `lifecycleStatus CANCELLED`, `cancelledAt`, `cancellationReason` (comportement existant).
   b. `reservations = tx.reservation.findMany({ where: { tripId, status: { in: [PENDING, CONFIRMED] } }, include: { payment: true } })`.
   c. Pour chaque réservation :
      - `tx.reservation.update` → `status: CANCELED`.
      - Si `payment?.status === SUCCEEDED && payment.stripePaymentIntentId != null` → `refundStatus: PENDING` ; sinon `NONE`.
      - `writeCascadeAuditLog(tx, { action: RESERVATION_CANCELLED_BY_TRIP, targetType: "Reservation", targetId, metadata: { tripId, refundStatus, hadPayment } })` (helper = `tx.auditLog.create`, cf. §6.1).
   d. `writeCascadeAuditLog(tx, { action: TRIP_CANCELLED, metadata: { …, impactedReservations: N } })`.
3. Retourner le trip (includes actuels).

**Aucun appel Stripe** dans la cascade (DoD). La mise en `PENDING` est une pure mise en file d'attente DB.

### 6.1 Audit dans la transaction — SANS toucher `writeAuditLog`

**Décision (révisée après vérification des 35 appelants) : `writeAuditLog` n'est PAS modifié.**
La voie transactionnelle de CASCADE-01 appelle `tx.auditLog.create({ data: … })` **directement**
dans le `prisma.$transaction`, sur un chemin de code nouveau et séparé.

**Garantie de non-régression (vérifiée) :**
- `backend/src/lib/audit-log.ts` reste **inchangé au sens strict** — même signature `writeAuditLog(input): Promise<void>`,
  même `try/catch` qui `warn` sans throw (décision S1-T1).
- Les **35 appelants** (tous `await writeAuditLog({ … })`, un seul argument, retour `void` ignoré,
  aucun n'entoure l'appel d'un `try/catch` dépendant de l'absence de throw) : **aucun changement de signature,
  de comportement, ni de gestion d'erreur.** Surface de régression = nulle.
- La règle « échec log = rollback » s'applique **uniquement** au `tx.auditLog.create` de la cascade :
  une erreur d'insert y propage naturellement (pas de `catch` sur ce chemin) et abort la transaction.

Un petit helper interne à CASCADE-01 — `writeCascadeAuditLog(tx, input)` faisant `tx.auditLog.create` —
est utilisé par **toutes** les écritures d'audit transactionnelles de cette feature (cascade `cancelTrip`,
refund admin, credit admin). Il évite la duplication et garantit la propagation d'erreur (donc le rollback),
sans réintroduire de couplage avec `writeAuditLog`. Les 35 appelants hors-tx continuent d'utiliser
`writeAuditLog` inchangé.

## 7. API admin

Toutes sous `/api/admin/reservations`, middleware admin existant. Pattern controller → service → schemas Zod.

### 7.1 Liste filtrée (extension)

`GET /api/admin/reservations?refundStatus=PENDING`
- Étendre `listAdminReservationsQuerySchema` avec `refundStatus?: RefundStatus` (optionnel, rétrocompatible).
- Sérialisation : ajoute `refundStatus`, `refundProcessedAt`, `refundProcessedBy` (id + nom), et
  `stripePaymentIntentId` **tronqué** via `stripeShortRef()` (`admin.serializers.ts:53`). Jamais le PI complet.

### 7.2 Rembourser

`POST /api/admin/reservations/:id/refund` — corps `{}`, acteur = `req.user!.id`.

| Cas | HTTP | Code |
|---|---|---|
| Succès | 200 | réservation (`refundStatus: REFUNDED`) |
| Plus `PENDING` | 409 | `REFUND_NOT_PENDING` |
| Pas de PaymentIntent | 422 | `NO_PAYMENT_INTENT` |
| Introuvable | 404 | `RESERVATION_NOT_FOUND` |
| Échec Stripe | 502 | `STRIPE_REFUND_FAILED` (reste `PENDING`) |

Séquence : tx courte `SELECT … FOR UPDATE` + garde `PENDING` → **hors tx**
`stripe.refunds.create({ payment_intent }, { idempotencyKey: 'refund_' + id })` → tx courte
`update REFUNDED` + `payment REFUNDED` + `writeCascadeAuditLog(tx, RESERVATION_REFUNDED)` (§6.1).
Client Stripe : `getStripeClient()` (`stripe.service.ts`).

### 7.3 Créditer

`POST /api/admin/reservations/:id/credit` — corps `{}`, acteur = `req.user!.id`.

| Cas | HTTP | Code |
|---|---|---|
| Succès | 200 | réservation (`refundStatus: CREDITED`) + `credit` |
| Plus `PENDING` | 409 | `REFUND_NOT_PENDING` |
| Introuvable | 404 | `RESERVATION_NOT_FOUND` |

Séquence : une seule tx (pas d'appel externe) — `FOR UPDATE` + garde `PENDING` →
`credit.create` (`amount = payment.amount`, `AVAILABLE`, `expiresAt null`) →
`reservation.update CREDITED` → `writeCascadeAuditLog(tx, RESERVATION_CREDITED)` (§6.1). Le `@unique` sur
`sourceReservationId` est le dernier filet anti-double-crédit.

## 8. UI Admin & statut passager

### 8.1 Vue « Annulations à traiter » (back-office)

Tableau dense, une réservation `PENDING` par ligne : passager · trajet · montant · date paiement ·
PI tronqué, avec deux actions à droite (**Rembourser** vert, **Créditer un avoir** bordure).
Pas de traitement en masse.

- **Confirmation obligatoire** avant tout appel (modal rappelant montant + passager).
- **Cas 409 au clic** (réservation traitée entre-temps par un autre admin / onglet obsolète) : le modal
  **bascule** sur un état explicite « Déjà traité entre-temps » (⚠️ ambré, pas erreur rouge), affiche le
  statut réel + qui l'a traité, et un bouton **Rafraîchir la liste** qui refetch `?refundStatus=PENDING`.
  Le front **traduit** le 409 produit par la garde backend — aucune protection ne repose sur le front.

### 8.2 Statut in-app passager

Pas d'infra push. « Temps réel » = reflété au prochain fetch. Le sérialiseur passager expose
`refundStatus` ; le libellé est construit **côté front** :

| État | Affichage |
|---|---|
| `CANCELED` + `refundStatus PENDING` | « Trajet annulé — remboursement en cours de traitement » |
| `refundStatus REFUNDED` | « Remboursé » |
| `refundStatus CREDITED` | « Avoir crédité sur votre compte » |
| `CANCELED` + `refundStatus NONE` | « Trajet annulé » |

## 9. Hors scope (explicite)

- Application automatique des avoirs sur un futur paiement (chantier séparé).
- Remboursement partiel (V1 = intégral uniquement).
- Notification email — **aucun provider dans le stack** (audit : zéro dépendance email, tous les matchs
  `EMAIL` sont des codes d'erreur métier). → ouvrir **NOTIFY-01** pour le suivi. Ne pas improviser
  d'intégration email dans CASCADE-01.
- SMS, traitement en masse, expiration automatique des avoirs (le champ existe, la purge est future).

## 10. Infra de test (fondation à poser dans CASCADE-01)

**Constat :** aucune infra de test n'existe (script `test` placeholder, zéro test projet, aucun runner
en devDeps). CASCADE-01 pose la fondation — le premier vrai test du projet.

- **Vitest** en devDependency + config ESM/TS.
- **`.env.test`** avec `DATABASE_URL` pointant une Postgres de test ; `prisma migrate deploy` avant les tests ;
  truncate/reset entre chaque test.
- **Stripe mocké** (aucun appel réseau, aucun argent).

### 10.1 Couverture (DoD)

**Cascade `cancelTrip()` :** réservation payée → `CANCELED` + `PENDING` ; sans paiement capturé → `NONE` ;
`CONFIRMED` sans paiement → `NONE` ; trip sans réservation → seul le trip bascule ; trip déjà `CANCELLED`
→ 409, aucune cascade ; **aucun appel Stripe** (mock jamais appelé) ; rollback total si un update échoue.

**Refund admin :** succès → `REFUNDED` + `payment REFUNDED` + audit + Stripe appelé **une fois** avec la
bonne `idempotencyKey` ; double-clic concurrent → un seul refund, le 2e prend 409 ; pas de PI → 422, Stripe
non appelé ; Stripe échoue → 502, réservation reste `PENDING`, `payment` non modifié.

**Crédit admin :** succès → `CREDITED` + `credit` (`amount = payment.amount`, `AVAILABLE`, `expiresAt null`) ;
double-crédit → bloqué (garde `PENDING` puis `@unique`) ; aucun appel Stripe.

## 11. Definition of Done

- [ ] Phase 0 confirmée (§4) — FAIT
- [ ] Migration Prisma : `RefundStatus`, `CreditStatus`, 3 colonnes `Reservation`, table `Credit`, relations `User`
- [ ] Infra de test Vitest + Postgres `.env.test` posée
- [ ] Audit cascade via `tx.auditLog.create` direct — `writeAuditLog` **non modifié** (§6.1)
- [ ] `cancelTrip()` cascade transactionnelle + audit granulaire (tests §10.1)
- [ ] Routes admin refund/credit + garde `FOR UPDATE` + Idempotency-Key (tests §10.1)
- [ ] Vue admin « Annulations à traiter » + modal + cas 409 + refresh auto
- [ ] Statut in-app passager (3 états)
- [ ] Aucun appel Stripe automatique lors de l'annulation (test)
- [ ] PR ouverte, review CTO avant merge — pas de push direct sur `main`
- [ ] NOTIFY-01 ouvert (email hors scope)
```


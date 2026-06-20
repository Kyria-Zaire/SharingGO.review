# OPS-01 — Audit compteurs opérationnels Departures

**Ticket :** OPS-01  
**Feature :** OPS-01 — Departures operational counters audit  
**Phase BMAD :** VERIFY (audit only)  
**Date :** 2026-06-19  
**Environnement :** local Windows · Postgres Docker · backend `:3000`  
**Verdict :** **Comportement scan cohérent** — hausse `Occupés` 5→6 **non expliquée par consume** ; causes externes probables  
**Code modifié :** aucun  
**Commit :** aucun

---

## 1. Résumé exécutif

Le cockpit **Departures** (`/departures`) affiche des métriques dérivées de l’API admin `GET /api/admin/trips/:id/occupancy`, enrichies côté frontend par des heuristiques UX (readiness, incidents, %).

**Invariant validé :** un `consume` boarding (`CONFIRMED → USED`) **ne modifie pas** `occupiedSeats` ; il déplace une unité de `confirmedSeats` vers `usedSeats`.

**Observation QA (Occupés 5 → 6 pendant scans) :** **comportement normal possible** si un événement parallèle a ajouté une réservation `CONFIRMED` ou un `PendingReservation` actif sur le même trajet. **Pas de bug confirmé** sur le flux scan/consume.

**Recommandation CTO :** **no fix needed** sur le chemin boarding → occupancy. Optionnel V1.x : durcir l’occupancy backend avec filtre `payment.status = SUCCEEDED` + tests d’invariant + clarifier le libellé « Restants ».

---

## 2. Fichiers inspectés

| Zone | Fichiers |
|------|----------|
| **Backend occupancy** | `backend/src/modules/admin/admin-occupancy.service.ts`, `backend/src/lib/trip-occupancy.ts`, `backend/src/modules/admin/admin-occupancy.controller.ts`, `backend/src/modules/admin/admin.types.ts` |
| **Backend boarding consume** | `backend/src/modules/boarding/boarding.consumption.service.ts` |
| **API doc** | `docs/features/S1-5-T3-admin-reservations-overview-api.md` |
| **Frontend board** | `frontend/src/features/departures/services/fetch-departure-board.ts`, `frontend/src/features/departures/utils/departure-board.ts`, `frontend/src/features/departures/utils/departure-readiness.ts` |
| **Frontend UI** | `frontend/src/pages/DeparturesPage.tsx`, `frontend/src/features/departures/components/DepartureProgressCard.tsx`, `frontend/src/features/departures/components/DepartureReadinessBadge.tsx` |
| **Types / spec UX** | `frontend/src/types/departures.types.ts`, `frontend/src/types/trips.types.ts`, `docs/features/F3-T7-driver-readiness-departure-console.md` |
| **Schéma DB** | `backend/prisma/schema.prisma` |

---

## 3. Cartographie libellés UI ↔ champs code

| Libellé UI (Departures) | Champ frontend | Champ API occupancy | Formule actuelle |
|----------------------|----------------|----------------------|------------------|
| **Occupés** | `occupiedSeats` | `occupiedSeats` | `confirmedSeats + usedSeats + activePendingSeats` |
| **Embarqués** | `boardedCount` | `usedSeats` | `COUNT(Reservation WHERE status = USED)` |
| **Restants** | `remainingBoardingCount` | `confirmedSeats` | `COUNT(Reservation WHERE status = CONFIRMED)` — *passagers pas encore embarqués* |
| **Pending** | `activePendingSeats` | `activePendingSeats` | `COUNT(PendingReservation WHERE expiresAt > now AND consumedAt IS NULL)` |
| Barre % | `percentBoarded` | — (calcul frontend) | `round(usedSeats / occupiedSeats × 100)` |
| Capacité affichée | `totalSeats` | `totalSeats` | `Trip.totalSeats` (défaut **8**) |
| Places libres booking | *(non affiché sur carte Departures)* | `remainingSeats` | `max(0, totalSeats - occupiedSeats)` |

> **Attention sémantique :** « Restants » ≠ `occupiedSeats - boardedCount`. C’est le nombre de réservations encore **CONFIRMED** (en attente d’embarquement), pas les places vides du bus.

---

## 4. Sources de données par compteur

### 4.1 `occupiedSeats` (Occupés)

**Source backend** — `admin-occupancy.service.ts` :

```typescript
occupiedSeats = confirmedSeats + usedSeats + activePendingSeats;
```

| Composant | Table / champ | Filtre |
|-----------|---------------|--------|
| `confirmedSeats` | `Reservation` | `status = CONFIRMED` |
| `usedSeats` | `Reservation` | `status = USED` |
| `activePendingSeats` | `PendingReservation` | `expiresAt > now`, `consumedAt IS NULL` |

**Non inclus :** `Reservation.status IN (PENDING, CANCELED, EXPIRED)`  
**Non filtré :** `Payment.status` — toute réservation CONFIRMED/USED compte, même sans paiement `SUCCEEDED`  
**Capacité :** `Trip.totalSeats` (référence affichage `X / totalSeats`, pas dans la somme)

Avant comptage, `deleteExpiredPendingForTrip` supprime les pending expirées (`expiresAt < now`).

### 4.2 `boardedPassengers` / Embarqués

**Source :** `usedSeats` = nombre de `Reservation` `USED` pour le `tripId`.

Déclenché par `POST /api/boarding/consume` :

```typescript
// boarding.consumption.service.ts — transaction
status: ReservationStatus.USED,
usedAt: now,
usedByUserId: adminUserId,
```

### 4.3 `remainingPassengers` / Restants (UI)

**Source réelle :** `confirmedSeats` uniquement.

**Formule métier attendue (embarquement) :**

```text
remainingToBoard = confirmedSeats
                 = occupiedSeats - usedSeats - activePendingSeats
```

Les pending actifs sont **occupés** mais **pas embarquables** tant qu’elles ne sont pas confirmées.

### 4.4 `boardingPercentage`

**Règle produit V1 (implémentée) :**

```text
percentBoarded = round(usedSeats / occupiedSeats × 100)
```

**Pas** `usedSeats / totalSeats` (capacité brute).

Implémentation : `frontend/src/features/departures/utils/departure-readiness.ts` → `computePercentBoarded`.

### 4.5 `pendingReservations` / Pending (UI)

**Source :** `activePendingSeats` — table `PendingReservation`, fenêtre **2 min** (`expiresAt`), non consommées.

Comptées **dans** `occupiedSeats` mais **pas** dans Embarqués ni Restants (tant que non confirmées).

### 4.6 Cohérence avec `trip-occupancy.ts` (lib partagée)

La lib publique `countOccupiedSeats` utilise la même logique réservations (`CONFIRMED + USED`) + pending actifs. Utilisée pour listings passager / verrou places ; l’admin occupancy duplique explicitement les trois compteurs pour la réponse détaillée.

---

## 5. Statuts opérationnels (readiness)

Les statuts **WAITING / BOARDING / CLOSED** du brief correspondent partiellement au modèle V1 :

| Brief | Statut code V1 | Badge UI | Condition |
|-------|----------------|----------|-----------|
| WAITING | `WAITING_PASSENGERS` | « Waiting » | `usedSeats = 0` et (`confirmedSeats > 0` ou `activePendingSeats > 0`) |
| BOARDING | `BOARDING_IN_PROGRESS` | « Boarding » | `usedSeats > 0` et `confirmedSeats > 0` |
| *(tous embarqués)* | `READY` | « Ready » | `usedSeats > 0` et `confirmedSeats = 0` |
| *(vide)* | `EMPTY` | « Empty » | `occupiedSeats = 0` |
| *(erreur API)* | `UNKNOWN` | « Unknown » | occupancy non chargée ou état indéterminé |
| CLOSED | — | — | **Non implémenté** — type futur `DepartureReadinessStatusFuture` |

### Transitions (heuristiques frontend, non persistées)

```text
EMPTY
  → WAITING_PASSENGERS     (première réservation / pending active)

WAITING_PASSENGERS
  → BOARDING_IN_PROGRESS   (premier consume : usedSeats ≥ 1)

BOARDING_IN_PROGRESS
  → READY                  (dernier CONFIRMED consommé : confirmedSeats = 0)

READY
  → BOARDING_IN_PROGRESS   (nouvelle CONFIRMED ou pending→confirm sur le trajet)
```

**Garde UX :** jamais `READY` si `boardedCount === 0` → forcé en `WAITING_PASSENGERS` (`departure-board.ts`).

**CLOSED :** prévu dans les types (`DEGRADED`, `DELAYED`, `INCIDENT`, `CLOSED`) — **aucune règle de transition** en V1.

---

## 6. Flux de données frontend (Departures)

```text
DeparturesPage
  └─ useQuery → fetchDepartureBoard()
        ├─ GET /api/admin/trips
        ├─ GET /api/admin/reservations (limit 100)  ← chargé mais countReservationsByTrip() non utilisé
        └─ GET /api/admin/trips/:id/occupancy (N appels parallèles, allSettled)
              └─ buildDepartureTripView() → métriques + readiness + incidents
```

| Paramètre | Valeur |
|-----------|--------|
| `staleTime` | 15 s |
| Refresh auto | **Non** — refresh manuel uniquement (cooldown 2 s) |
| Source affichage | **100 % occupancy API** par trajet |

**Point mort :** `countReservationsByTrip` dans `fetch-departure-board.ts` calcule une map locale **jamais consommée** — n’impacte pas les compteurs affichés.

---

## 7. Comportement attendu après scan

### 7.1 Premier scan réussi (validate + consume)

| Métrique | Avant | Après | Δ |
|----------|-------|-------|---|
| `confirmedSeats` | n | n−1 | −1 |
| `usedSeats` | m | m+1 | +1 |
| `occupiedSeats` | n+m (+pending) | **identique** | **0** |
| Embarqués | m | m+1 | +1 |
| Restants | n | n−1 | −1 |
| % embarquement | m/(n+m) | (m+1)/(n+m) | ↑ |
| Readiness | WAITING ou BOARDING | BOARDING ou READY | selon reste |

### 7.2 Double scan refusé

Aucune mutation DB (`BOARDING_ALREADY_USED` / `RESERVATION_NOT_CONFIRMED` sur validate). **Tous les compteurs inchangés.**

### 7.3 Invariants validés

| Règle | Statut |
|-------|--------|
| USED reste dans le total occupé | ✅ (`CONFIRMED + USED`) |
| CONFIRMED→USED ne baisse pas `occupiedSeats` | ✅ |
| `boardedPassengers` +1 par consume réussi | ✅ |
| `remainingBoardingCount` −1 par consume réussi | ✅ |
| Pending actif compte dans Occupés | ✅ (by design) |
| Paiement non SUCCEEDED exclu des Occupés | ❌ **non filtré** (risque seed / données aberrantes) |

---

## 8. Analyse du cas « Occupés 5 → 6 »

### 8.1 Ce que le consume **ne peut pas** faire

Transfert `CONFIRMED → USED` conserve `confirmed + used`. **Un scan réussi ne peut pas augmenter `occupiedSeats`.**

### 8.2 Causes plausibles d’une hausse +1

| Cause | Probabilité QA | Mécanisme |
|-------|----------------|-----------|
| Nouvelle réservation **CONFIRMED** (webhook Stripe, autre testeur) | **Élevée** | `confirmedSeats +1` |
| Nouveau **PendingReservation** actif (2 min) | Moyenne | `activePendingSeats +1` |
| Refresh manual / navigation retour après événement parallèle | Élevée | snapshot occupancy plus récent |
| Confusion Embarqués / Occupés | Moyenne | libellés proches |
| Bug consume retirant USED du total | **Écartée** | code audité — non |
| Polling automatique | **Écartée** | pas de `refetchInterval` sur Departures |

### 8.3 Données DB locales (audit 2026-06-19)

- **34** réservations `CONFIRMED` **sans** paiement `SUCCEEDED` comptées dans l’occupancy (seed / données de test) — peuvent gonfler « Occupés » indépendamment du boarding.
- Aucun `PendingReservation` actif au moment de l’audit.
- Exemple trajet actif QA : `cmqj9ltpv002rlh5i6up1j79w` → `3 CONFIRMED + 3 USED = 6 occupés`, 50 % embarqués.

### 8.4 Verdict cas 5→6

**Comportement normal / expliquable** sans bug sur le flux scan, sous réserve d’un événement booking concurrent ou d’un refresh tardif. **Bug non confirmé.**

Pour trancher sur un trajet précis en replay : corréler horodatages `Reservation.createdAt` / `usedAt` / `AuditLog` (`BOARDING_CONSUMED`) avec les refresh Departures.

---

## 9. Bugs confirmés

| ID | Sévérité | Description | Confirmé ? |
|----|----------|-------------|------------|
| OPS-01-A | Info | `countReservationsByTrip` calculé mais inutilisé | Oui (dead code, pas d’impact runtime) |
| OPS-01-B | Moyen (data) | Occupancy compte CONFIRMED/USED sans filtre `Payment.SUCCEEDED` | Oui — 34 cas en DB locale |
| OPS-01-C | Faible (UX) | « Restants » = CONFIRMED, pas « restant à embarquer sur occupés » | By design — risque de lecture exploitant |
| OPS-01-D | — | Consume fausse `occupiedSeats` | **Non** |
| OPS-01-E | — | CLOSED / lifecycle manquant | Attendu V1 — type futur seulement |

---

## 10. Comparaison formule métier attendue vs existant

| Métrique | Formule attendue (brief) | Implémentation | Écart |
|----------|-------------------------|----------------|-------|
| `occupiedSeats` | CONFIRMED + USED (+ pending ?) | CONFIRMED + USED + **pending actifs** | Pending inclus — conforme CDC pending 2 min |
| `boardedPassengers` | COUNT(USED) | `usedSeats` | ✅ |
| `remainingPassengers` | occupied − boarded | **`confirmedSeats` seulement** | Écart sémantique : ignore pending dans « Restants » |
| `boardingPercentage` | boarded / occupied ou / capacity | **boarded / occupied** | Règle documentée F3-T7 |
| `pendingReservations` | non expirées | `activePendingSeats` | ✅ |
| Filtre paiement | SUCCEEDED requis | **Absent** sur occupancy | Écart sécurité données |

---

## 11. Risques avant pilote réel

1. **Occupancy sans filtre paiement** — réservations CONFIRMED aberrantes gonflent Occupés (vu en seed).
2. **N+1 occupancy** — une requête par trajet ; race possible si refresh pendant mutations parallèles (affichage transitoire, pas corruption DB).
3. **Readiness `READY` avec pending actifs** — si `used > 0`, `confirmed = 0`, `pending > 0` : badge Ready alors que `boardingComplete` est false (pending encore dans occupés).
4. **Pas de statut CLOSED** — fin de service non modélisée côté Departures.
5. **Libellé « Restants »** — peut être lu comme places bus restantes au lieu de passagers à embarquer.

---

## 12. Recommandation CTO

| Priorité | Action | Type |
|----------|--------|------|
| **P0** | **Aucun correctif urgent** sur boarding → compteurs | no fix needed |
| P1 | Documenter en ops que **consume ne change pas Occupés** | doc only ✅ (ce fichier) |
| P2 | Envisager filtre `payment.status = SUCCEEDED` dans `getAdminTripOccupancy` | fix backend — **validation CTO requise** |
| P2 | Tests d’invariant : `occupied = confirmed + used + pending` ; consume préserve `occupied` | add tests only |
| P3 | Supprimer ou brancher `countReservationsByTrip` (dead code) | fix frontend — cosmétique |
| P3 | Renommer UI « Restants » → « À embarquer » (futur) | hors scope OPS-01 |
| V2 | Implémenter lifecycle `CLOSED` + realtime occupancy | feature |

---

## 13. Fichiers créés / modifiés

| Fichier | Action |
|---------|--------|
| `docs/qa/OPS-01-departures-counters-audit.md` | **Créé** |
| Code applicatif | **Aucune modification** |

**Commit :** aucun (conforme au ticket).

---

## 14. Requêtes QA utiles (replay)

```powershell
# Occupancy d'un trajet (session admin requise)
curl.exe -b cookies.txt http://localhost:3000/api/admin/trips/TRIP_ID/occupancy

# Détail réservations par statut
docker exec sharinggo-postgres-dev psql -U postgres -d sharinggo -c "
  SELECT status, COUNT(*)
  FROM \"Reservation\"
  WHERE \"tripId\" = 'TRIP_ID'
  GROUP BY status;
"

# Pending actifs
docker exec sharinggo-postgres-dev psql -U postgres -d sharinggo -c "
  SELECT COUNT(*) FROM \"PendingReservation\"
  WHERE \"tripId\" = 'TRIP_ID'
    AND \"expiresAt\" > NOW()
    AND \"consumedAt\" IS NULL;
"

# Audit boarding récent
docker exec sharinggo-postgres-dev psql -U postgres -d sharinggo -c "
  SELECT action, \"createdAt\", metadata
  FROM \"AuditLog\"
  WHERE action IN ('BOARDING_CONSUMED', 'BOARDING_ALREADY_USED')
  ORDER BY \"createdAt\" DESC
  LIMIT 20;
"
```

---

*Audit réalisé sans modification de code ni commit — validation CTO requise avant tout durcissement occupancy.*

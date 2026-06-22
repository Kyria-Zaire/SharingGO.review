# OPS-05A — Audit reporting & exports

**Ticket :** OPS-05A  
**Feature :** OPS-05 — Reporting & Exports  
**Phase BMAD :** OPS (audit / architecture)  
**Date :** 2026-06-22  
**Rôle :** Operations Analyst + Product Architect + Data Analyst  
**Prérequis livrés :** OPS-01 · OPS-02 · OPS-03 · OPS-04  
**Statut :** Audit de référence — **aucune implémentation**  
**Code modifié :** aucun  
**Migration :** aucune  
**Endpoint :** aucun  
**Commit :** aucun

---

## 1. Résumé exécutif

### Question centrale

> *Quels indicateurs et exports sont réellement utiles à l'exploitation Sharing Go, et avec quelles données peut-on les produire aujourd'hui ?*

**Réponse courte :** le système dispose de **données métier riches** (trajets, réservations, paiements, lifecycle, incidents, boarding) et d'un **premier read-model par trajet** (OPS-04 `exploitation-history`). En revanche, il n'existe **aucun moteur de reporting agrégé**, **aucun export** (CSV / Excel / PDF), et les KPI dashboard actuels sont **partiels** (échantillon 100 paiements/jour, pas de taux de remplissage historique).

**Recommandation :**

| Phase | Périmètre |
|-------|------------|
| **OPS-05B** | Backend read-only — rapports agrégés période + endpoints export CSV |
| **OPS-05C** | UI admin `/reports` — filtres date, prévisualisation, téléchargement |

**Principe produit V1 :** une ligne unique, 8 places, 8 €/ticket — les rapports doivent rester **opérationnels** (par trajet / par jour) avant tout reporting entreprise Mosolf.

---

## 2. Inventaire des données disponibles

### 2.1 Synthèse par domaine

| Domaine | Données clés | API / accès admin | Fréquence usage probable | Intérêt opérationnel |
|---------|--------------|-------------------|------------------------|----------------------|
| **Trips** | planning, lifecycle, capacité, chauffeur, disable | `GET /api/admin/trips`, lifecycle POST | Quotidien | **Élevé** — pivot de tous les rapports |
| **Reservations** | statut, passager, `usedAt`, embarqueur | `GET /api/admin/reservations` (filtres trip, date, statut) | Quotidien | **Élevé** — remplissage, no-show |
| **Payments** | montant, type, statut Stripe | `GET /api/admin/payments` (filtres date, statut, type) | Quotidien / hebdo | **Élevé** — recettes |
| **Subscriptions** | type, statut, période Stripe | **Pas d'API admin liste** · table `Subscription` | Mensuel | **Moyen** — Mosolf futur |
| **Boarding** | `usedAt`, audits `BOARDING_*` | Via réservations + `AuditLog` + exploitation-history | Par départ | **Élevé** — présence réelle |
| **Incidents** | type, gravité, statut, trip lié | `GET /api/admin/incidents` (filtres riches) | Quotidien | **Élevé** — qualité service |
| **Lifecycle** | statuts + timestamps sur `Trip` | Champs trip + audits `TRIP_*` | Par départ | **Élevé** — ponctualité / annulations |
| **Exploitation History** | summaries + timeline par trajet | `GET /api/admin/trips/:id/exploitation-history` | Post-départ / audit | **Élevé** — fiche trajet complète |

### 2.2 Trips

| Dimension | Détail |
|-----------|--------|
| **Champs** | `departureTime`, `arrivalTime`, `totalSeats`, `lifecycleStatus`, timestamps lifecycle, `cancellationReason`, `driverId`, `deletedAt` |
| **Calculs possibles** | Nombre départs effectués / annulés / terminés ; durée boarding→départ |
| **Limites** | Pas de snapshot occupancy historique ; `arrivalTime` souvent null |

### 2.3 Reservations

| Dimension | Détail |
|-----------|--------|
| **Champs** | `status`, `userId`, `tripId`, `usedAt`, `usedByUserId`, `createdAt` |
| **Calculs possibles** | Taux embarquement = `USED / CONFIRMED+USED` ; annulations résa |
| **Limites** | Pas de lien employeur / Mosolf sur `User` ; statut `EXPIRED` peu alimenté |

### 2.4 Payments

| Dimension | Détail |
|-----------|--------|
| **Champs** | `amount`, `currency`, `status`, `type` (TICKET / SUBSCRIPTION / SUBSCRIPTION_ACCESS), IDs Stripe |
| **Calculs possibles** | CA tickets par période ; répartition par type |
| **Limites** | Pas `updatedAt` ; refunds peu audités ; abonnements récurrents ≠ ligne Payment ticket |

### 2.5 Subscriptions

| Dimension | Détail |
|-----------|--------|
| **Champs** | `type` (MOSOLF_MONTHLY / CONVOYEUR_MONTHLY), `status`, `currentPeriodStart/End`, Stripe IDs |
| **Calculs possibles** | Abonnés actifs à date ; churn (CANCELED/EXPIRED) |
| **Limites** | **Aucune route admin** ; page cockpit informative seulement ; pas de rattachement entreprise |

### 2.6 Boarding

| Dimension | Détail |
|-----------|--------|
| **Sources** | `Reservation.usedAt` ; `AuditLog` boarding |
| **Calculs possibles** | Scans réussis / refusés par trajet (via audits) |
| **Limites** | QR généré non historisé ; audits non indexés par `tripId` |

### 2.7 Incidents

| Dimension | Détail |
|-----------|--------|
| **Champs** | `type`, `severity`, `status`, `source`, `relatedTripId`, `occurredAt`, `resolvedAt` |
| **Calculs possibles** | Comptage par type / gravité / trajet / période |
| **Limites** | Assignation non auditée ; cap liste 100–200 côté UI |

### 2.8 Lifecycle

| Dimension | Détail |
|-----------|--------|
| **Champs** | `Trip.lifecycleStatus` + `boardingStartedAt`, `departedAt`, `completedAt`, `cancelledAt` |
| **Calculs possibles** | Départs annulés vs réalisés ; délai boarding |
| **Limites** | Un seul `lifecycleUpdatedByUserId` (dernier acteur) |

### 2.9 Exploitation History (OPS-04)

| Dimension | Détail |
|-----------|--------|
| **Endpoint** | Agrégation read-only par `tripId` |
| **Livré** | `tripSummary`, `occupancySummary`, `reservationSummary`, `paymentSummary`, `incidentSummary`, `timeline[]` |
| **Usage reporting** | **Modèle de fiche trajet** — à généraliser en batch période |
| **Limites** | Pas de batch ; `noShowEstimated` = approximation ; occupancy live |

### 2.10 Sources transverses

| Source | Usage reporting | Limite |
|--------|-----------------|--------|
| `AuditLog` | Événements fins, activity feed | Cap 250 global ; pas d'index `tripId` |
| Dashboard KPIs (frontend) | Paiements jour, places occupées, incidents ouverts | Agrégation **client** ; échantillon partiel |
| Activity feed | Journal opérationnel | Non exportable ; non agrégé |

---

## 3. Reporting exploitation

### 3.1 Rapports identifiés

| # | Rapport | Formule / source | MVP | Important | Nice-to-have |
|---|---------|------------------|:---:|:---------:|:------------:|
| R01 | **Taux de remplissage par trajet** | `occupiedSeats / totalSeats` (occupancy) | ✅ | | |
| R02 | **Embarqués vs réservés** | `usedSeats` vs `confirmedSeats + usedSeats` | ✅ | | |
| R03 | **No-show estimé** | `confirmedSeats` à `departedAt` (approx. OPS-04) | ✅ | | |
| R04 | **Incidents par trajet** | `COUNT(Incident WHERE relatedTripId)` | ✅ | | |
| R05 | **Incidents par type** | `GROUP BY type` sur période | ✅ | | |
| R06 | **Incidents par gravité** | `GROUP BY severity` | | ✅ | |
| R07 | **Annulations trajet** | `lifecycleStatus = CANCELLED` + raison | ✅ | | |
| R08 | **Annulations réservation** | `Reservation.status = CANCELED` | | ✅ | |
| R09 | **Départs effectués** | `DEPARTED + COMPLETED` | ✅ | | |
| R10 | **Départs annulés** | `CANCELLED` | ✅ | | |
| R11 | **Recettes par trajet** | `SUM(Payment SUCCEEDED)` liés réservations trip | ✅ | | |
| R12 | **Recettes par période** | Agrégation payments date | ✅ | | |
| R13 | **Répartition ticket vs abo accès** | `Payment.type` | | ✅ | |
| R14 | **Taux conversion pending → payé** | Pending vs CONFIRMED (audit) | | ✅ | |
| R15 | **Boarding refusés** | Audits `BOARDING_*_FAILED` | | ✅ | |
| R16 | **Délai moyen boarding → départ** | `departedAt - boardingStartedAt` | | ✅ | |
| R17 | **Trajets complets (full)** | `remainingSeats = 0` | | | ✅ |
| R18 | **Heatmap horaires** | Remplissage par créneau départ | | | ✅ |
| R19 | **Comparatif sens Châlons ↔ Vatry** | Par `Line` (une seule ligne V1) | | | ✅ |

### 3.2 MVP reporting exploitation (recommandé OPS-05B)

Période filtrable `from` / `to` (défaut : jour ou semaine glissante).

**Tableau de bord synthèse :**

- Trajets planifiés / partis / terminés / annulés
- Places vendues / embarquées / no-show estimé
- CA tickets confirmé (€)
- Incidents ouverts / critiques

**Tableau détail par trajet** (une ligne = un trip) :

| Colonne | Source |
|---------|--------|
| Date départ | `Trip.departureTime` |
| Lifecycle final | `Trip.lifecycleStatus` |
| Occupés / capacité | occupancy |
| Embarqués | `usedSeats` |
| No-show est. | exploitation-history logic |
| Incidents | count incidents |
| CA trajet | sum payments |
| Raison annulation | `cancellationReason` si CANCELLED |

---

## 4. Reporting entreprise (Mosolf — futur)

> **Hors périmètre V1 CDC** — audit prospectif pour cadrer OPS-05 sans sur-implémenter.

### 4.1 Contexte métier

| Élément CDC | Impact reporting |
|-------------|------------------|
| Abonné Mosolf 40 €/mois | Reporting RH / mobilité entreprise |
| Code promo usage unique | Pas de lien `User` → entreprise en DB aujourd'hui |
| Convoyeur ticket 8 € | Traçabilité individuelle possible via `userId` |
| Ligne unique | Pas de reporting multi-sites |

### 4.2 Rapports entreprise identifiés

| # | Rapport | Données requises | Faisable aujourd'hui ? |
|---|---------|------------------|------------------------|
| E01 | Utilisation abonnements actifs | `Subscription` + admin API | ❌ Pas d'API admin |
| E02 | Trajets par salarié (email) | `Reservation` + `User.email` | ⚠️ Partiel (pas export) |
| E03 | Taux d'utilisation abo | Trajets USED / mois / user abonné | ⚠️ Calcul lourd |
| E04 | Présence embarquement | `usedAt` par user | ⚠️ Partiel |
| E05 | Absences / no-show | CONFIRMED non USED post-départ | ⚠️ Approximation |
| E06 | Répartition Mosolf vs convoyeur | `Subscription.type` ou domaine email | ❌ Domaine non structuré |
| E07 | Coût mobilité entreprise | Facturation Stripe B2B | ❌ Hors scope V1 |

### 4.3 Prérequis data futurs (non V1)

- Champ `employerId` ou `companyCode` sur `User` (ou table `Organization`)
- API admin abonnements + export anonymisable RGPD
- Règles d'agrégation par domaine email `@mosolf.com` (fragile, non recommandé seul)

**Recommandation :** documenter Mosolf en **OPS-05.x** ou feature dédiée post-V1 — ne pas bloquer OPS-05B exploitation.

---

## 5. Exports

### 5.1 Matrice exports

| Format | Utilisateur cible | Fréquence | Données | MVP |
|--------|-------------------|-----------|---------|:---:|
| **CSV — Trajets opérationnels** | Exploitation, admin | Quotidien / post-service | R01–R11 par trajet période | ✅ |
| **CSV — Incidents** | Exploitation, qualité | Hebdo / ad hoc | Incidents filtrés + métadonnées trip | ✅ |
| **CSV — Paiements** | Admin, compta | Quotidien / mensuel | Payments SUCCEEDED période | ✅ |
| **CSV — Réservations** | Exploitation | Ad hoc | Réservations + statut + trip | | ✅ |
| **CSV — Synthèse période** | Direction ops | Hebdo | KPIs agrégés R12, départs, incidents | ✅ |
| **Excel (.xlsx)** | Compta, RH | Mensuel | Mêmes jeux + onglets | | ✅ |
| **PDF — Fiche trajet** | Exploitation, litige | Ad hoc | Contenu exploitation-history | | ✅ |
| **PDF — Rapport période** | Direction | Mensuel | Synthèse + graphiques | | | ✅ |

### 5.2 Détail exports MVP

#### CSV Trajets opérationnels

- **Colonnes :** tripId, date départ, ligne, lifecycle, totalSeats, occupied, used, confirmed, noShowEst, incidents, revenue, cancelledReason
- **Filtres :** from, to, lifecycleStatus, lineId
- **Volume estimé :** ≤ 160 trajets/mois (CDC) — trivial

#### CSV Incidents

- **Colonnes :** code, type, severity, status, source, relatedTripId, occurredAt, resolvedAt, title
- **Filtres :** from, to, type, severity, status

#### CSV Paiements

- **Colonnes :** id, createdAt, amount, currency, status, type, userId, reservationId, stripe refs (masqués)
- **Filtres :** from, to, status=SUCCEEDED, type

### 5.3 Contraintes export

| Contrainte | Détail |
|------------|--------|
| RBAC | `ADMIN` / `SUPER_ADMIN` uniquement |
| RGPD | Pas d'export massif emails sans justification ; colonnes configurables |
| Performance | Période max recommandée 90 jours par export V1 |
| Idempotence | Export = lecture seule, pas de mutation |
| Traçabilité | Audit `REPORT_EXPORTED` recommandé OPS-05B |

---

## 6. Gaps identifiés

### 6.1 Bloquant (pour OPS-05 MVP)

| # | Gap | Impact |
|---|-----|--------|
| B1 | **Aucun endpoint reporting agrégé** | Tout recalcul client-side fragmenté |
| B2 | **Aucun export CSV** | Besoin compta / archivage non couvert |
| B3 | **Dashboard KPIs incomplets** | `limit: 100` payments ; pas de remplissage % historique |
| B4 | **Pas de rapport période unifié** | Ops doit croiser 4 pages admin manuellement |

### 6.2 Important

| # | Gap | Impact |
|---|-----|--------|
| I1 | **Pas d'API admin abonnements** | Reporting Mosolf / abos actifs impossible |
| I2 | **Occupancy non historisée** | No-show et remplissage passé = rejeu approximatif |
| I3 | **Payment sans `updatedAt`** | Date refund / échec imprécise |
| I4 | **AuditLog sans index `tripId`** | Agrégations boarding coûteuses |
| I5 | **Lists admin cap 100–200** | Rapports longue période tronqués si client-only |
| I6 | **Pas de lien User → entreprise** | Reporting RH Mosolf bloqué |
| I7 | **REFUNDED peu tracé** | CA net vs brut ambigu |

### 6.3 Nice-to-have

| # | Gap | Impact |
|---|-----|--------|
| N1 | Excel natif vs CSV | Confort compta |
| N2 | PDF fiche trajet | Litiges / archivage signé |
| N3 | Snapshots occupancy à `TRIP_DEPARTED` | No-show exact |
| N4 | Table `ReportExport` (jobs async) | Gros volumes futurs |
| N5 | Envoi email planifié | Automatisation Mosolf |
| N6 | Stripe Dashboard sync | Réconciliation automatique |

---

## 7. Recommandation OPS-05B — Backend Reporting Engine

**Périmètre :** read-only · RBAC admin · Zod · pas de mutation métier.

### 7.1 Endpoints proposés

| Méthode | Route | Rôle |
|---------|-------|------|
| `GET` | `/api/admin/reports/operations/summary` | KPIs agrégés période |
| `GET` | `/api/admin/reports/operations/trips` | Tableau détail par trajet (paginé) |
| `GET` | `/api/admin/reports/incidents` | Agrégation + liste incidents période |
| `GET` | `/api/admin/reports/payments` | Agrégation CA + liste payments |
| `GET` | `/api/admin/reports/exports/:reportKey.csv` | Export CSV (`trips` \| `incidents` \| `payments` \| `summary`) |

**Query communs :** `from`, `to` (ISO), `lineId?`, `lifecycleStatus?`, `limit`, `offset`.

### 7.2 Contrat synthèse (esquisse)

```typescript
interface OperationsReportSummary {
  period: { from: string; to: string };
  trips: {
    planned: number;
    departed: number;
    completed: number;
    cancelled: number;
  };
  seats: {
    totalCapacity: number;
    totalOccupied: number;
    totalUsed: number;
    fillRatePercent: number;
    noShowEstimated: number;
  };
  revenue: {
    ticketSucceededAmount: string;
    currency: string;
    succeededPaymentCount: number;
  };
  incidents: {
    total: number;
    open: number;
    critical: number;
    byType: Record<string, number>;
  };
  meta: { generatedAt: string; limitations: string[] };
}
```

### 7.3 Stratégie d'implémentation

1. **Réutiliser** `getAdminTripOccupancy` + filtres Prisma (éviter N+1 via batch queries).
2. **Factoriser** la logique OPS-04 (`noShowEstimated`, payment sum) dans un service `reports/` partagé.
3. **Exports CSV** : streaming réponse `text/csv` · en-têtes FR · BOM UTF-8 pour Excel.
4. **Audit** : `REPORT_EXPORTED` avec `reportKey`, période, `actorUserId`.
5. **Tests** : `backend/scripts/ops05b-reporting-test.mjs` (admin OK, RBAC, CSV non vide, période).

### 7.4 Hors périmètre OPS-05B

- Excel binaire natif (CSV suffit MVP)
- PDF
- Reporting Mosolf entreprise
- Jobs async / email
- Graphiques

---

## 8. Recommandation OPS-05C — Admin Reporting UI

**Route :** `/reports` (section Operations).

### 8.1 Écrans

| Écran | Contenu |
|-------|---------|
| **Synthèse** | Cartes KPI période (reprend `summary`) + sélecteur dates |
| **Trajets** | Table détail R01–R11 + lien vers `/history/:tripId` |
| **Incidents** | Table + mini agrégation par type |
| **Paiements** | Table + total CA |
| **Exports** | Boutons « Télécharger CSV » par rapport + période active |

### 8.2 UX

- Période : aujourd'hui / 7 jours / 30 jours / custom
- Pas de graphiques V1 (tableaux + chiffres — CDC « stats simples »)
- Palette lifecycle OPS-03 réutilisée
- États vide / erreur alignés OPS-04C
- RBAC : masquer section si non admin

### 8.3 Navigation

```
Operations
├ Departures
├ Incidents
├ Historique
└ Rapports        ← OPS-05C
```

### 8.4 Dépendances

- OPS-05B endpoints livrés
- Pas de modification exploitation-history (lien seulement)

---

## 9. Alignement CDC & existant

| Exigence CDC §3 | État actuel | OPS-05 |
|-----------------|-------------|--------|
| Taux remplissage | Occupancy live ; dashboard partiel | ✅ Rapport trajets |
| Revenus | Liste paiements ; KPI jour | ✅ Synthèse CA période |
| Abonnements actifs | Pas d'API admin | ⚠️ Post-V1 ou scope réduit |
| Stats simples | Dashboard dispatch-first | ✅ Compléter sans sur-ingénierie |

---

## 10. Fichiers inspectés

| Zone | Fichiers |
|------|----------|
| Schéma | `backend/prisma/schema.prisma` |
| Admin APIs | `admin.routes.ts`, `admin-*-service.ts`, `admin.schemas.ts` |
| Exploitation | `admin-exploitation-history.service.ts` |
| Occupancy | `admin-occupancy.service.ts`, `trip-occupancy.ts` |
| Dashboard | `dashboard-kpis.ts`, `useDashboardData.ts` |
| Frontend | `SubscriptionsPage.tsx`, `ExploitationHistory*` |
| Références | `docs/CAHIER_DES_CHARGES.md`, `docs/ops/OPS-04A-exploitation-history-audit.md` |

---

## 11. Confirmations

| Exigence ticket | Statut |
|-----------------|--------|
| `docs/ops/OPS-05A-reporting-exports-audit.md` | ✅ |
| Inventaire données disponibles | ✅ §2 |
| Rapports MVP | ✅ §3.2 |
| Exports MVP | ✅ §5 |
| Gaps identifiés | ✅ §6 |
| Recommandations OPS-05B | ✅ §7 |
| Recommandations OPS-05C | ✅ §8 |
| Aucun code | ✅ |
| Aucun commit | ✅ |

---

*Document de référence pour OPS-05B (Backend Reporting Engine) et OPS-05C (Admin Reporting UI). Créer `docs/prd/active/OPS-05-reporting-exports.md` avant implémentation significative.*

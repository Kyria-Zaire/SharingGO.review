# PRD-OPS-05 — Reporting & Exports

**Status :** DESIGN  
**Owner :** Product Owner · Operations Analyst · Senior Backend Architect  
**Last updated :** 2026-06-22  
**Version :** v1.0  
**Ticket :** OPS-05A.1 — PRD Reporting & Exports  
**Prérequis :** OPS-01 DONE · OPS-02 DONE · OPS-03 DONE · OPS-04 DONE · OPS-05A audit validé

> Méthodologie : [`docs/methodology/BMAD.md`](../../methodology/BMAD.md)  
> Produit global : [`docs/CAHIER_DES_CHARGES.md`](../../CAHIER_DES_CHARGES.md)  
> Audit source : [`docs/ops/OPS-05A-reporting-exports-audit.md`](../../ops/OPS-05A-reporting-exports-audit.md)  
> Socle existant : Dashboard admin (KPIs partiels) · OPS-04 exploitation-history (fiche trajet)

---

# 1. Vision produit

SharingGO exploite une **ligne unique** Châlons-en-Champagne ↔ Paris-Vatry avec **8 trajets/jour** et **8 places** par créneau. L'exploitation dispose désormais d'un socle opérationnel complet : compteurs départs (OPS-01), incidents (OPS-02), lifecycle trajets (OPS-03), historique exploitation par trajet (OPS-04).

**Problème aujourd'hui :** les données métier existent (trajets, réservations, paiements, boarding, incidents, lifecycle) mais le reporting est **fragmenté** :

- Le dashboard admin affiche des KPIs **temps réel** partiels (échantillon 100 paiements, pas de remplissage historique).
- L'opérateur doit **croiser manuellement** les pages Départs, Incidents, Paiements et Historique pour produire une vue période.
- **Aucun export** (CSV / Excel / PDF) n'est disponible pour la compta, l'archivage ou les revues hebdomadaires.
- Le reporting entreprise Mosolf (RH, mobilité) est **impossible** faute d'API abonnements et de lien User → entreprise.

**Vision OPS-05 :** offrir à l'exploitation un **cockpit reporting unifié** — lecture seule, période filtrable, exportable — sans dupliquer la logique métier déjà portée par OPS-04.

```
Sources existantes          OPS-05B (agrégation)         OPS-05C (UI)
──────────────────          ────────────────────         ────────────
Trips · Reservations   →    summary / trips /       →    /reports
Payments · Incidents        incidents / payments          Synthèse + tables
Boarding · Lifecycle          + CSV exports                 + téléchargements
OPS-04 exploitation-history (réutilisé, pas dupliqué)
```

**Utilisateurs :**

| Persona | Besoin |
|---------|--------|
| **Opérateur / dispatch** (`ADMIN`) | Vue synthèse jour/semaine : remplissage, no-show, incidents, départs annulés |
| **Super admin** (`SUPER_ADMIN`) | Recettes période, exports compta, revue qualité service |
| **Direction ops** (lecture) | Synthèse hebdomadaire exportable sans manipulation SQL |
| **Compta / finance** (externe) | CSV paiements SUCCEEDED sur période |
| **Mosolf RH / mobilité** | **Hors MVP** — reporting entreprise reporté post-V1 |

**Impact attendu :**

- Fin du recoupement manuel entre 4 écrans admin pour une revue de service.
- Archivage et transmission compta en **&lt; 1 clic** (export CSV).
- Alignement CDC §3 : taux de remplissage, revenus, stats simples — **sur période**, pas seulement temps réel.
- Base data pour pilote Mosolf sans sur-ingénierie V1.

**Principe directeur :** **read-only** · réutiliser OPS-04 · stats simples (tableaux + chiffres, pas de BI) · une ligne / 8 places / 8 €.

---

# 2. Objectifs MVP

## 2.1 Objectifs primaires (livraison OPS-05B + OPS-05C)

| ID | Objectif | Réf. audit |
|----|----------|------------|
| O1 | Exposer une **synthèse agrégée** sur période (`from` / `to`) : trajets, places, CA, incidents | B1, B4 · R09–R12 |
| O2 | Exposer un **tableau détail par trajet** : remplissage, embarqués, no-show estimé, incidents, recettes | R01–R05, R07, R11 |
| O3 | Permettre l'**export CSV** des 4 jeux MVP : trajets, incidents, paiements, synthèse | B2 · §5 OPS-05A |
| O4 | **Réutiliser** la logique OPS-04 (`noShowEstimated`, payment sum) — pas de divergence | I2 |
| O5 | **Tracer** chaque export via `AuditLog` `REPORT_EXPORTED` | §5.3 OPS-05A |
| O6 | UI `/reports` avec sélecteur période, prévisualisation et téléchargement | OPS-05C |
| O7 | RBAC strict : `ADMIN` / `SUPER_ADMIN` uniquement | Security baseline |

## 2.2 Objectifs secondaires (si capacité sprint OPS-05C)

| ID | Objectif |
|----|----------|
| O8 | Lien direct trajet → `/history/:tripId` depuis tableau rapports |
| O9 | Raccourcis période : aujourd'hui / 7 jours / 30 jours |
| O10 | Bandeau `meta.limitations` (no-show estimé, occupancy non historisée) |

## 2.3 Critère de succès produit (MVP)

> Un opérateur sélectionne la période « semaine en cours », consulte la synthèse (départs, remplissage, CA, incidents), parcourt le détail par trajet, et télécharge un **CSV trajets opérationnels** et un **CSV paiements** — **sans quitter** `/reports` et **sans recalcul manuel** côté client.

---

# 3. Rapports MVP

Période filtrable `from` / `to` (ISO 8601). Défaut UI : **7 jours glissants**.

## 3.1 Synthèse période (`summary`)

| Indicateur | Formule / source | ID audit |
|------------|------------------|----------|
| Trajets planifiés | `COUNT(Trip)` dans période (non soft-deleted) | — |
| Départs effectués | `lifecycleStatus IN (DEPARTED, COMPLETED)` | R09 |
| Départs terminés | `lifecycleStatus = COMPLETED` | R09 |
| Départs annulés | `lifecycleStatus = CANCELLED` | R10 |
| Capacité totale places | `SUM(totalSeats)` trajets période | — |
| Places occupées (vendues) | `SUM(occupiedSeats)` via occupancy batch | R01 |
| Places embarquées | `SUM(usedSeats)` | R02 |
| Taux remplissage global | `totalOccupied / totalCapacity × 100` | R01 |
| No-show estimé global | Logique OPS-04 (`confirmedSeats` non embarqués post-départ) | R03 |
| CA tickets confirmé | `SUM(Payment.amount)` `SUCCEEDED` + `TICKET` liés réservations période | R12 |
| Paiements réussis (count) | `COUNT(Payment)` `SUCCEEDED` période | R12 |
| Incidents total | `COUNT(Incident)` `occurredAt` dans période | R05 |
| Incidents ouverts | `status IN (OPEN, IN_PROGRESS)` | — |
| Incidents critiques | `severity = CRITICAL` | — |
| Incidents par type | `GROUP BY type` | R05 |

## 3.2 Détail par trajet (`trips`)

Une ligne = un `Trip` dont `departureTime` ∈ période.

| Colonne | Source | ID audit |
|---------|--------|----------|
| `tripId` | `Trip.id` | — |
| `departureTime` | `Trip.departureTime` | — |
| `lineName` | `Line` | — |
| `lifecycleStatus` | `Trip.lifecycleStatus` | R07, R09, R10 |
| `totalSeats` | `Trip.totalSeats` | — |
| `occupiedSeats` | occupancy | R01 |
| `usedSeats` | occupancy | R02 |
| `confirmedSeats` | occupancy | R02 |
| `fillRatePercent` | `occupied / totalSeats × 100` | R01 |
| `noShowEstimated` | logique OPS-04 | R03 |
| `incidentCount` | `COUNT(Incident WHERE relatedTripId)` | R04 |
| `revenueAmount` | `SUM(Payment SUCCEEDED)` réservations trip | R11 |
| `cancellationReason` | si `CANCELLED` | R07 |
| `driverId` | optionnel MVP | — |

**Pagination :** `limit` (défaut 50, max 100) · `offset`.

## 3.3 Incidents période (`incidents`)

| Livrable | Contenu |
|----------|---------|
| Agrégation | `byType`, `bySeverity`, `openCount`, `criticalCount` |
| Liste | Incidents `occurredAt` ∈ période, filtres `type`, `severity`, `status` |

## 3.4 Paiements période (`payments`)

| Livrable | Contenu |
|----------|---------|
| Agrégation | `totalAmount`, `count`, `byType` (TICKET / SUBSCRIPTION / SUBSCRIPTION_ACCESS) |
| Liste | Payments `createdAt` ∈ période, filtre `status` (défaut `SUCCEEDED`) |

## 3.5 Rapports Important (post-MVP — documentés, non livrés OPS-05)

| ID | Rapport | Phase cible |
|----|---------|-------------|
| R06 | Incidents par gravité (graphique) | OPS-05.x |
| R08 | Annulations réservation | OPS-05.x |
| R13 | Répartition ticket vs abo accès (détail) | OPS-05.x |
| R14 | Taux conversion pending → payé | OPS-05.x |
| R15 | Boarding refusés (audits) | OPS-05.x |
| R16 | Délai moyen boarding → départ | OPS-05.x |

## 3.6 Rapports Nice-to-have (hors OPS-05)

R17 trajets full · R18 heatmap horaires · R19 comparatif sens — CDC V2 ou analytics avancés.

---

# 4. Exports MVP

## 4.1 Matrice exports livrés

| Clé export | Format | Utilisateur | Fréquence | Données |
|------------|--------|-------------|-----------|---------|
| `trips` | CSV | Exploitation, admin | Quotidien / post-service | Colonnes §3.2, période active |
| `incidents` | CSV | Exploitation, qualité | Hebdo / ad hoc | code, type, severity, status, source, relatedTripId, occurredAt, resolvedAt, title |
| `payments` | CSV | Admin, compta | Quotidien / mensuel | id, createdAt, amount, currency, status, type, userId, reservationId (refs Stripe masquées) |
| `summary` | CSV | Direction ops | Hebdo | KPIs §3.1 (une ligne ou bloc clé-valeur) |

## 4.2 Règles export

| Règle | Détail |
|-------|--------|
| Encodage | UTF-8 avec BOM (compatibilité Excel FR) |
| Séparateur | `;` ou `,` — configurable serveur, défaut `;` pour locale FR |
| En-têtes | Libellés français |
| Période max | **90 jours** par export V1 |
| Auth | Session admin · RBAC `ADMIN` / `SUPER_ADMIN` |
| Mutation | **Aucune** — lecture seule |
| Audit | `REPORT_EXPORTED` : `reportKey`, `from`, `to`, `actorUserId`, `rowCount` |
| RGPD | Pas de colonne `email` par défaut dans exports MVP ; `userId` uniquement |

## 4.3 Exports hors MVP

| Export | Phase |
|--------|-------|
| CSV réservations | OPS-05.x |
| Excel natif (.xlsx) | OPS-05.x (CSV suffit MVP) |
| PDF fiche trajet (exploitation-history) | OPS-05.x |
| PDF rapport période avec graphiques | V2 |
| Export planifié / email | V2 |

---

# 5. Hors scope

Explicitement **exclu** de OPS-05 MVP.

| Hors scope | Raison | Cible |
|------------|--------|-------|
| Reporting entreprise Mosolf (RH, mobilité, présence salariés) | Pas de lien User → entreprise · pas d'API admin abonnements | Feature Mosolf post-V1 |
| API admin liste abonnements | Prérequis Mosolf · hors périmètre reporting exploitation | Ticket dédié |
| Excel binaire natif (.xlsx) | CSV + BOM suffit MVP compta | OPS-05.x |
| PDF (fiche trajet ou rapport période) | Complexité rendu · export CSV prioritaire | OPS-05.x |
| Graphiques / dashboards BI | CDC « stats simples » — tableaux uniquement | V2 |
| Jobs async / file d'attente exports | Volume ≤ 160 trajets/mois — synchrone OK | V2 |
| Envoi email planifié | Pas CDC V1 | V2 |
| Snapshots occupancy historiques | Migration + event à `TRIP_DEPARTED` | V1.x data |
| Réconciliation Stripe automatique | Stripe Dashboard suffit pilote | V2 |
| Multi-lignes / multi-sites | Produit verrouillé CDC | V2 |
| Reporting passager (mes trajets, reçus) | Admin uniquement | V2 |
| Modification données via écran rapports | Read-only strict | Jamais |
| `localStorage` / agrégation client seule | Source de vérité = backend OPS-05B | Jamais |

---

# 6. User Stories

## Story 1 — Synthèse exploitation

En tant qu'**opérateur admin**,  
je veux consulter une synthèse sur une période choisie,  
afin de piloter le service sans croiser plusieurs écrans.

### Critères d'acceptation

- [ ] La page `/reports` affiche les KPIs §3.1 pour la période sélectionnée
- [ ] Les raccourcis aujourd'hui / 7j / 30j fonctionnent
- [ ] Un état vide explicite si aucun trajet dans la période
- [ ] Les limitations connues sont affichées (`noShowEstimated`, occupancy live)

## Story 2 — Détail par trajet

En tant qu'**opérateur admin**,  
je veux un tableau détaillé par trajet sur la période,  
afin d'identifier les créneaux sous-performants ou problématiques.

### Critères d'acceptation

- [ ] Chaque ligne contient les colonnes §3.2
- [ ] Pagination fonctionnelle (50 par page)
- [ ] Lien vers `/history/:tripId` depuis chaque ligne
- [ ] Filtre optionnel `lifecycleStatus`

## Story 3 — Export CSV compta

En tant que **super admin**,  
je veux télécharger les paiements réussis sur une période en CSV,  
afin de les transmettre à la compta sans accès DB.

### Critères d'acceptation

- [ ] Export `payments` génère un CSV UTF-8 BOM valide
- [ ] Seuls les paiements de la période active sont inclus
- [ ] L'action est tracée dans `AuditLog` `REPORT_EXPORTED`
- [ ] Période &gt; 90 jours → erreur `VALIDATION_ERROR` explicite

## Story 4 — Export opérationnel post-service

En tant qu'**opérateur admin**,  
je veux exporter le détail trajets de la journée en CSV,  
afin d'archiver la revue de service.

### Critères d'acceptation

- [ ] Export `trips` reflète exactement le tableau §3.2
- [ ] Export `incidents` et `summary` disponibles sur la même page
- [ ] Téléchargement déclenché sans rechargement complet de page

---

# 7. API cibles OPS-05B

**Module :** `backend/src/modules/admin/reports/` (nom indicatif)  
**Nature :** read-only · Zod · RBAC · format erreur standard

## 7.1 Endpoints

### `GET /api/admin/reports/operations/summary`

**Rôle :** KPIs agrégés période (§3.1).

**Auth :** `ADMIN` | `SUPER_ADMIN`

**Query :**

| Param | Type | Requis | Détail |
|-------|------|--------|--------|
| `from` | ISO datetime | oui | Début période (inclus) |
| `to` | ISO datetime | oui | Fin période (inclus) |
| `lineId` | string | non | Filtre ligne (une seule en V1) |

**Response 200 :** `OperationsReportSummary` (voir audit OPS-05A §7.2) + `meta.limitations[]`

**Errors :** `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`

---

### `GET /api/admin/reports/operations/trips`

**Rôle :** Tableau détail par trajet (§3.2).

**Query :** `from`, `to`, `lineId?`, `lifecycleStatus?`, `limit`, `offset`

**Response 200 :**

```json
{
  "data": {
    "trips": [ "/* OperationsTripReportRow[] */" ],
    "pagination": { "total": 0, "limit": 50, "offset": 0 }
  },
  "meta": { "generatedAt": "ISO", "limitations": [] }
}
```

---

### `GET /api/admin/reports/incidents`

**Rôle :** Agrégation + liste incidents période (§3.3).

**Query :** `from`, `to`, `type?`, `severity?`, `status?`, `limit`, `offset`

**Response 200 :** `{ aggregation: { byType, bySeverity, openCount, criticalCount }, incidents[], pagination }`

---

### `GET /api/admin/reports/payments`

**Rôle :** Agrégation CA + liste paiements (§3.4).

**Query :** `from`, `to`, `status?` (défaut `SUCCEEDED`), `type?`, `limit`, `offset`

**Response 200 :** `{ aggregation: { totalAmount, count, byType }, payments[], pagination }`

---

### `GET /api/admin/reports/exports/:reportKey.csv`

**Rôle :** Export CSV synchrone.

**Param `reportKey` :** `trips` | `incidents` | `payments` | `summary`

**Query :** mêmes filtres que l'endpoint JSON correspondant

**Response 200 :** `Content-Type: text/csv; charset=utf-8` · `Content-Disposition: attachment`

**Side-effect :** `AuditLog` `REPORT_EXPORTED`

**Errors :** `VALIDATION_ERROR` (période &gt; 90j), `INVALID_REPORT_KEY`

## 7.2 Règles backend

| Règle | Détail |
|-------|--------|
| Réutilisation | Factoriser logique OPS-04 (`admin-exploitation-history.service.ts`) |
| Occupancy | Batch `getAdminTripOccupancy` — pas de N+1 |
| Montants | `Decimal` → string 2 décimales en JSON/CSV |
| Rate limit | Routes authentifiées 100 req/min/user |
| Tests | `backend/scripts/ops05b-reporting-test.mjs` |

## 7.3 Impact base de données

**Migration requise :** **NON** (MVP)

Lecture seule sur tables existantes : `Trip`, `Reservation`, `Payment`, `Incident`, `Line`, `User` (jointures minimales).

Option V1.x (non bloquante MVP) : index `AuditLog` par `tripId` pour R15.

---

# 8. UI cible OPS-05C

**Route :** `/reports`  
**Section navigation :** Operations (après Historique)

```
Operations
├ Départs
├ Incidents
├ Historique
└ Rapports          ← OPS-05C
```

## 8.1 Structure écran (single page, onglets ou sections)

| Section | Source API | Contenu |
|---------|------------|---------|
| **En-tête** | — | Titre « Rapports » · sélecteur période · raccourcis 1j / 7j / 30j |
| **Synthèse** | `summary` | Grille cartes KPI (style dashboard OPS existant) |
| **Trajets** | `operations/trips` | Table paginée §3.2 · lien historique |
| **Incidents** | `incidents` | Mini agrégation par type + table |
| **Paiements** | `payments` | Total CA + table |
| **Exports** | `exports/:key.csv` | 4 boutons téléchargement · période active |

## 8.2 UX

| Principe | Détail |
|----------|--------|
| Mobile | Responsive — tableaux scroll horizontal si besoin |
| Loading | Skeleton cartes + tables pendant fetch |
| Erreur | Toast + message inline (aligné OPS-04C) |
| Vide | « Aucun trajet sur cette période » |
| Graphiques | **Aucun** en MVP |
| Couleurs | Lifecycle badges OPS-03 · palette `DESIGN.md` |
| RBAC | Section masquée si rôle insuffisant |

## 8.3 Fichiers frontend indicatifs

| Zone | Chemin indicatif |
|------|------------------|
| Page | `frontend/src/pages/ReportsPage.tsx` |
| API | `frontend/src/api/admin-reports.api.ts` |
| Types | `frontend/src/types/reports.types.ts` |
| Feature | `frontend/src/features/reports/` |
| Navigation | `Sidebar.tsx`, `navigation.ts`, `routes.ts`, `router.tsx` |
| Query keys | `query-keys.ts` → `reports.*` |

## 8.4 Dépendances

- OPS-05B endpoints livrés et validés (script QA)
- Pas de modification OPS-04 exploitation-history (lien lecture seule)
- Dashboard existant **inchangé** en MVP (pas de fusion forcée)

---

# 9. Critères d'acceptation globaux (DoD OPS-05)

La feature OPS-05 est **DONE** lorsque :

## 9.1 OPS-05B (Backend)

- [ ] Les 5 endpoints §7.1 répondent avec Zod + RBAC
- [ ] Les chiffres `summary` sont cohérents avec exploitation-history sur un échantillon de 3 trajets
- [ ] Export CSV `trips` ouvre correctement dans Excel FR (BOM, séparateur)
- [ ] Période &gt; 90 jours refusée avec message clair
- [ ] `REPORT_EXPORTED` écrit dans `AuditLog` à chaque export
- [ ] Script `ops05b-reporting-test.mjs` vert
- [ ] Security review `@reviewer-securite-code` → APPROVE
- [ ] TypeScript strict + lint OK

## 9.2 OPS-05C (Frontend)

- [ ] `/reports` accessible depuis sidebar Operations
- [ ] Synthèse + 3 tableaux + 4 exports fonctionnels
- [ ] Sélecteur période et raccourcis opérationnels
- [ ] Lien `/history/:tripId` depuis tableau trajets
- [ ] États loading / erreur / vide conformes
- [ ] Build frontend OK
- [ ] QA manuelle documentée `docs/qa/OPS-05C-reporting-ui-validation.md`

## 9.3 Documentation

- [ ] PRD status → DONE
- [ ] QA backend `docs/qa/OPS-05B-reporting-backend-validation.md`
- [ ] Index `docs/prd/active/README.md` mis à jour

---

# 10. Roadmap OPS-05B / OPS-05C

## 10.1 Phasage BMAD

| Phase | Ticket | Livrable | Statut |
|-------|--------|----------|--------|
| Audit | OPS-05A | `docs/ops/OPS-05A-reporting-exports-audit.md` | ✅ DONE |
| PRD | OPS-05A.1 | Ce document | ✅ DESIGN |
| Backend | OPS-05B | Reporting Engine + exports CSV | À faire |
| UI | OPS-05C | Page `/reports` | À faire (après OPS-05B) |
| QA | OPS-05D | Validation fonctionnelle bout-en-bout | À faire |

## 10.2 OPS-05B — séquence d'implémentation

| Étape | Tâche | Estimation |
|-------|-------|------------|
| B1 | Schémas Zod + types `reports.types.ts` | 0,5 j |
| B2 | Service agrégation — factoriser OPS-04 | 1 j |
| B3 | Endpoint `summary` + tests | 0,5 j |
| B4 | Endpoint `operations/trips` paginé | 0,5 j |
| B5 | Endpoints `incidents` + `payments` | 0,5 j |
| B6 | Export CSV (4 clés) + audit `REPORT_EXPORTED` | 1 j |
| B7 | Script QA `ops05b-reporting-test.mjs` | 0,5 j |
| B8 | Security review | 0,5 j |

**Total indicatif OPS-05B :** ~5 j

## 10.3 OPS-05C — séquence d'implémentation

| Étape | Tâche | Estimation |
|-------|-------|------------|
| C1 | API client + types frontend | 0,5 j |
| C2 | `ReportsPage` — layout + sélecteur période | 0,5 j |
| C3 | Section synthèse (cartes KPI) | 0,5 j |
| C4 | Tables trajets / incidents / paiements | 1 j |
| C5 | Boutons export + téléchargement blob | 0,5 j |
| C6 | Navigation + routes + RBAC | 0,25 j |
| C7 | QA doc + polish états | 0,5 j |

**Total indicatif OPS-05C :** ~3,75 j

**Dépendance stricte :** OPS-05C démarre après merge OPS-05B en environnement de test.

## 10.4 Roadmap post-MVP (OPS-05.x)

| Item | Priorité | Prérequis |
|------|----------|-----------|
| CSV réservations | Important | — |
| Rapports R06–R16 (Important audit) | Important | Index AuditLog tripId optionnel |
| Excel natif .xlsx | Nice-to-have | — |
| PDF fiche trajet | Nice-to-have | Rendu exploitation-history |
| API admin abonnements | Bloquant Mosolf | Ticket dédié |
| Reporting entreprise Mosolf | Futur | `Organization` / `employerId` |
| Snapshots occupancy à départ | Important data | Migration event |

---

# 11. Sécurité

| Risque | Mitigation |
|--------|------------|
| Fuite PII (emails) via export | Colonnes MVP sans email · `userId` opaque |
| IDOR / accès non admin | Middleware rôle `ADMIN` / `SUPER_ADMIN` |
| Export massif / DoS | Période max 90j · rate limit 100 req/min |
| Injection via query | Zod strict sur tous paramètres |
| Open redirect export | Pas de redirect — attachment direct |

**Reviewer :** `@reviewer-securite-code` → APPROVE requis avant merge PROD.

---

# 12. Performance

| Dimension | Cible MVP |
|-----------|-----------|
| Trajets/mois | ≤ 160 (CDC) |
| Latence `summary` | &lt; 2 s période 30j |
| Latence export CSV | &lt; 5 s période 90j |
| Concurrence | Faible (1–3 admins) |

**Bottleneck connu :** occupancy batch sur N trajets — acceptable à l'échelle V1 ; optimiser si &gt; 500 ms sur 30j.

---

# 13. Observabilité

| Événement | Canal |
|-----------|-------|
| `REPORT_EXPORTED` | `AuditLog` |
| Erreur agrégation | Logger structuré backend |
| Latence endpoint | Log warn si &gt; 2 s |

**Métriques futures (V2) :** fréquence exports par clé, périodes les plus consultées.

---

# 14. Alignement CDC

| Exigence CDC §3 | OPS-05 MVP |
|-----------------|------------|
| Taux de remplissage | ✅ `fillRatePercent` summary + trips |
| Revenus | ✅ CA période + export payments |
| Abonnements actifs | ⚠️ Post-MVP (pas d'API admin) |
| Stats simples | ✅ Tableaux + KPIs, pas de BI |

---

# 15. Open Questions

| # | Question | Décision provisoire |
|---|----------|---------------------|
| Q1 | Séparateur CSV `;` ou `,` ? | `;` défaut FR · configurable env |
| Q2 | Inclure trajets `deletedAt` (disable) ? | Non par défaut · filtre explicite post-MVP |
| Q3 | CA : TICKET seul ou inclure SUBSCRIPTION_ACCESS ? | MVP : breakdown `byType` · total tickets = `TICKET` |
| Q4 | Fusionner `/reports` et dashboard ? | Non MVP — pages distinctes |
| Q5 | Timezone période ? | `Europe/Paris` — documenter dans API |

---

# 16. Changelog

## v1.0 — 2026-06-22

PRD initial OPS-05A.1 — basé sur audit OPS-05A. Status DESIGN.

---

*Prochaine étape BMAD : OPS-05B BUILD — Backend Reporting Engine. Aucun code dans ce ticket.*

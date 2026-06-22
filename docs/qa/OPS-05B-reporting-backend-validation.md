# OPS-05B — Validation backend Reporting Engine

**Ticket :** OPS-05B  
**Feature :** OPS-05 — Reporting & Exports  
**Date :** 2026-06-22  
**Statut :** Backend livré — VERIFY

---

## Endpoints livrés

| Méthode | Route | Rôle |
|---------|-------|------|
| `GET` | `/api/admin/reports/operations/overview` | KPIs agrégés période |
| `GET` | `/api/admin/reports/operations/trips` | Détail par trajet (paginé) |
| `GET` | `/api/admin/reports/operations/incidents` | Incidents + agrégation |
| `GET` | `/api/admin/reports/operations/revenue` | CA par jour / semaine / mois |
| `GET` | `/api/admin/reports/export/:reportKey` | CSV (`trips.csv`, `incidents.csv`, `payments.csv`, `summary.csv`) |

## Query communs

- `from` (ISO, requis)
- `to` (ISO, requis)
- `lineId` (optionnel)
- Période max **90 jours**

## Overview — champs

`totalTrips`, `completedTrips`, `cancelledTrips`, `totalReservations`, `usedReservations`, `boardingRate`, `occupancyRate`, `totalRevenue`, `currency`, `totalIncidents`, `criticalIncidents`, `meta`

## Fichiers

- `backend/src/modules/admin/admin-reports.service.ts`
- `backend/src/modules/admin/admin-reports.controller.ts`
- `backend/src/modules/admin/admin-reports.schemas.ts`
- `backend/src/modules/admin/admin-reports.types.ts`
- `backend/src/modules/admin/admin-reports-csv.ts`
- `backend/scripts/ops05b-reporting-test.mjs`

## Tests

```bash
node backend/scripts/ops05b-reporting-test.mjs
```

Vérifie : RBAC, 4 JSON reports, période >90j → 400, 4 exports CSV avec BOM UTF-8, audit `REPORT_EXPORTED`.

## Limitations documentées (`meta.limitations`)

- Occupancy snapshot live
- noShowEstimated = approximation OPS-04
- Overview revenue = paiements SUCCEEDED liés aux trajets de la période
- Revenue report = agrégation par `Payment.createdAt` (Europe/Paris)

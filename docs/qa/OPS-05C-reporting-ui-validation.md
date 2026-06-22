# OPS-05C — Validation UI Reporting Admin

**Ticket :** OPS-05C  
**Feature :** OPS-05 — Reporting & Exports  
**Date :** 2026-06-22  
**Statut :** ACCEPTED — validation visuelle 2026-06-22

---

## Route & navigation

| Élément | Valeur |
|---------|--------|
| Route | `/reports` |
| Sidebar | Operations → Reports |

## Sections livrées

1. **KPI Overview** — `GET /api/admin/reports/operations/overview`
2. **Tableau trajets** — filtres période + lifecycle, pagination
3. **Tableau incidents** — filtres statut / type / sévérité, pagination
4. **Recettes** — summary + tableaux jour / semaine / mois (pas de graphique)
5. **Exports** — 4 CSV avec feedback téléchargement

## Fichiers principaux

- `frontend/src/pages/ReportsPage.tsx`
- `frontend/src/api/admin-reports.api.ts`
- `frontend/src/types/reports.types.ts`
- `frontend/src/features/reports/components/*`

## Vérifications

```bash
cd frontend && npm run lint && npm run build
```

## Critères d'acceptation

- [x] Route `/reports`
- [x] Navigation Operations → Reports
- [x] KPI overview
- [x] Tableau trajets
- [x] Tableau incidents
- [x] Tableau revenue
- [x] 4 exports CSV
- [x] États loading / error / empty
- [x] Lint OK
- [x] Build OK
- [x] Aucun backend modifié

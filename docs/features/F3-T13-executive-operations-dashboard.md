# F3-T13 — Executive Operations Dashboard

## Objectif

Remplacer le placeholder `/` par un centre de pilotage opérationnel **dispatch-first**, sans WebSocket ni BI backend.

## Ordre des widgets (strict)

1. **Dispatch Summary** — tuiles incidents / départs / boarding / complet / monitoring
2. **Attention Required** — urgences visuellement dominantes (rouge, bordures épaisses)
3. **Active Operations** — boarding, départs imminents, incidents critiques
4. **KPIs** — métriques agrégées côté client
5. **Activity Feed Preview** — 8 derniers événements (`/api/admin/activity-feed`)
6. **Monitoring** — snapshot health/readiness

Quick Actions en tête de page (raccourcis + refresh).

## Architecture

```
frontend/src/features/dashboard/
├── constants/dashboard.ts
├── hooks/useDashboardData.ts      # TanStack Query, poll 30s
├── utils/
│   ├── dashboard-date.ts
│   ├── dashboard-kpis.ts
│   └── dashboard-attention.ts
└── components/
    ├── DashboardWidget.tsx        # container / header / loading / empty
    ├── DashboardDispatchSummary.tsx
    ├── DashboardAttentionPanel.tsx
    ├── DashboardActiveOperations.tsx
    ├── DashboardKpiGrid.tsx + DashboardKpiCard.tsx
    ├── DashboardActivityPreview.tsx
    ├── DashboardMonitoringCard.tsx
    └── DashboardQuickActions.tsx
```

Réutilisation :
- `useDispatchStickySummary` (incidents + departures board)
- `fetchMonitoringSnapshot`
- `listAdminActivityFeed`, `listAdminIncidents`, `listAdminPayments`
- `ActivityFeedCard`, `relativeTime`, `HealthStatusBadge`

## Philosophie dispatch-first

Les urgences (incidents, boarding inactif, monitoring) précèdent les KPIs business. Labels KPI **sans** « Revenue » / « Earnings » :

| KPI | Source V1 |
|-----|-----------|
| Successful payments today | `SUCCEEDED` + `createdAt` aujourd'hui |
| Processed payments | `SUCCEEDED` dans fenêtre chargée (from=startOfDay) |
| Active subscriptions | Proxy : paiements `SUBSCRIPTION*` réussis (pas de liste admin abonnements) |
| Occupied seats | Somme `occupiedSeats` sur départs à venir |
| Trips in boarding | `readiness === BOARDING_IN_PROGRESS` |
| Open incidents | Statuts OPEN / IN_PROGRESS |

## Polling

- `refetchInterval: 30_000` sur toutes les queries dashboard
- Refresh manuel : cooldown **2s** (`DASHBOARD_REFRESH_COOLDOWN_MS`)
- `placeholderData` non requis (widgets tolèrent stale pendant fetch)

## Sécurité

- Activity feed : `sanitizeFeedDescription` via `ActivityFeedCard`
- Pas d’affichage Stripe IDs complets, JWT, secrets

## Limites V1

- KPIs sur échantillon limité (100 paiements / 100 incidents)
- Pas de graphiques, export, historique
- Subscriptions : proxy via paiements, pas API dédiée
- Mobile : responsive minimal (grilles `sm:` / `lg:`)

## Futur (non implémenté)

- Charts : occupancy trends, line heatmaps, delay analytics
- Payment analytics / SLA monitoring
- Dispatch analytics temps réel (WebSocket)
- Widgets configurables par rôle
- Export CSV/PDF

## Tests manuels

1. Ouvrir `/` connecté admin
2. Vérifier ordre des sections et tuiles dispatch
3. Créer incident CRITICAL → Attention Required rouge
4. Refresh + attendre 30s (polling)
5. Liens Quick Actions + « Voir tout » dispatch
6. Aucune donnée sensible dans le DOM réseau/UI
